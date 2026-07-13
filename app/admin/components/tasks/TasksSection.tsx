"use client";

import { useState } from "react";

import { ActiveTasksView } from "./ActiveTasksView";
import { CreateTaskView } from "./CreateTaskView";

import type { TasksView } from "./taskTypes";

import styles from "../../AdminPanel.module.css";

export function TasksSection() {
  const [activeView, setActiveView] =
    useState<TasksView>("active");

  return (
    <section className={styles.tasksSection}>
      <header className={styles.tasksSectionHeader}>
        <div>
          <h2>Tasks</h2>

          <p>
            Створення, публікація та керування завданнями гравців
          </p>
        </div>

        <div className={styles.tasksViewTabs}>
          <button
            type="button"
            className={
              activeView === "active"
                ? styles.tasksViewTabActive
                : styles.tasksViewTab
            }
            onClick={() => setActiveView("active")}
          >
            <span>✓</span>
            Active Tasks
          </button>

          <button
            type="button"
            className={
              activeView === "create"
                ? styles.tasksViewTabActive
                : styles.tasksViewTab
            }
            onClick={() => setActiveView("create")}
          >
            <span>+</span>
            Create Task
          </button>
        </div>
      </header>

      {activeView === "active" ? (
        <ActiveTasksView
          onCreateTask={() => setActiveView("create")}
        />
      ) : (
        <CreateTaskView
          onBackToTasks={() => setActiveView("active")}
        />
      )}
    </section>
  );
}