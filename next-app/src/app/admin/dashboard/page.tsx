"use client";

import { AdminProvider } from "@/components/admin/AdminContext";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminDashboardPage() {
  return (
    <AdminProvider>
      <AdminShell />
    </AdminProvider>
  );
}
