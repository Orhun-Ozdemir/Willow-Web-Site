"use client";

import { AdminProvider } from "./AdminContext";
import AdminShell from "./AdminShell";

export default function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
