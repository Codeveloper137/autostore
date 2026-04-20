import type { Metadata } from "next";

import { AdminInventoryView } from "@/components/admin/admin-inventory-view";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function AdminInventoryPage() {
  return <AdminInventoryView />;
}
