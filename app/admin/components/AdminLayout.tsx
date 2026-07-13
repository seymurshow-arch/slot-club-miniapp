import type { ReactNode } from "react";

import type { AdminSection } from "../adminTypes";
import styles from "../AdminPanel.module.css";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

type AdminLayoutProps = {
  children: ReactNode;
  activeSection: AdminSection;
  totalPlayers: number;
};

export function AdminLayout({
  children,
  activeSection,
  totalPlayers,
}: AdminLayoutProps) {
  return (
    <main className={styles.page}>
      <AdminSidebar activeSection={activeSection} />

      <section className={styles.workspace}>
        <AdminHeader
          activeSection={activeSection}
          totalPlayers={totalPlayers}
        />

        <section className={styles.contentArea}>{children}</section>
      </section>
    </main>
  );
}