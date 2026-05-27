import DashboardWrapper from "@/components/dashboard/DashboardWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Peserta | Portal Magang",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Wrap all dashboard pages in our responsive shell
  return <DashboardWrapper>{children}</DashboardWrapper>;
}