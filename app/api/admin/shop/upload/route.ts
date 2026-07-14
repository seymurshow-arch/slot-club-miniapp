import { put } from "@vercel/blob";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/adminSession";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const SHOP_IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 30;

const allowedFileTypes = new Map<
  string,
  {
    extension: string;
  }
>([
  ["image/png", { extension: "png" }],
  ["image/jpeg", { extension: "jpg" }],
  ["image/webp", { extension: "webp" }],
]);

class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

class BlobConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlobConfigurationError";
  }
}

async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return verifyAdminSessionToken(token);
}

function normalizeFileName(fileName: string): string {
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return baseName || "shop-item";
}

function hasPngSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function hasJpegSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  );
}

function hasWebpSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function verifyFileSignature(
  contentType: string,
  bytes: Uint8Array,
): boolean {
  switch (contentType) {
    case "image/png":
      return hasPngSignature(bytes);
    case "image/jpeg":
      return hasJpegSignature(bytes);
    case "image/webp":
      return hasWebpSignature(bytes);
    default:
      return false;
  }
}

function readRequestMetadata(request: Request): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  return {
    ipAddress,
    userAgent: request.headers.get("user-agent"),
  };
}

function readOptionalEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function resolveBlobCredentials(): {
  token?: string;
  storeId?: string;
} {
  const token =
    readOptionalEnvironmentVariable("slot_READ_WRITE_TOKEN") ??
    readOptionalEnvironmentVariable("BLOB_READ_WRITE_TOKEN");

  if (token) {
    return { token };
  }

  const storeId =
    readOptionalEnvironmentVariable("slot_STORE_ID") ??
    readOptionalEnvironmentVariable("BLOB_STORE_ID");

  if (storeId) {
    return { storeId };
  }

  throw new BlobConfigurationError(
    "Vercel Blob is not connected correctly. Configure slot_STORE_ID, BLOB_STORE_ID, slot_READ_WRITE_TOKEN, or BLOB_READ_WRITE_TOKEN for the public Blob store.",
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await requireAdminSession())) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const uploadedValue = formData.get("file");

    if (!(uploadedValue instanceof File)) {
      throw new UploadValidationError("Image file is required.");
    }

    if (uploadedValue.size <= 0) {
      throw new UploadValidationError("Uploaded file is empty.");
    }

    if (uploadedValue.size > MAX_FILE_SIZE_BYTES) {
      throw new UploadValidationError("Image size cannot exceed 4 MB.");
    }

    const allowedType = allowedFileTypes.get(uploadedValue.type);

    if (!allowedType) {
      throw new UploadValidationError(
        "Only PNG, JPEG and WEBP images are allowed.",
      );
    }

    const fileBuffer = await uploadedValue.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    if (!verifyFileSignature(uploadedValue.type, fileBytes)) {
      throw new UploadValidationError(
        "The uploaded file content does not match its image type.",
      );
    }

    const safeBaseName = normalizeFileName(uploadedValue.name);
    const pathname = `shop/items/${safeBaseName}.${allowedType.extension}`;
    const credentials = resolveBlobCredentials();

    const blob = await put(pathname, fileBuffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: uploadedValue.type,
      cacheControlMaxAge: SHOP_IMAGE_CACHE_SECONDS,
      ...credentials,
    });

    const { ipAddress, userAgent } = readRequestMetadata(request);

    try {
      await prisma.adminAuditLog.create({
        data: {
          actor: "browser-admin",
          action: "SHOP_IMAGE_UPLOAD",
          entityType: "ShopAsset",
          afterState: {
            url: blob.url,
            pathname: blob.pathname,
            contentType: blob.contentType,
            fileName: uploadedValue.name,
            fileSize: uploadedValue.size,
          },
          metadata: {
            downloadUrl: blob.downloadUrl,
          },
          ipAddress,
          userAgent,
        },
      });
    } catch (auditError) {
      console.error("Failed to write shop image upload audit log:", auditError);
    }

    return NextResponse.json(
      {
        ok: true,
        image: {
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
          contentType: blob.contentType,
          size: uploadedValue.size,
          originalFileName: uploadedValue.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 },
      );
    }

    if (error instanceof BlobConfigurationError) {
      console.error("Shop image upload Blob configuration error:", error.message);

      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503 },
      );
    }

    console.error("Failed to upload shop image:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to upload shop image." },
      { status: 500 },
    );
  }
}