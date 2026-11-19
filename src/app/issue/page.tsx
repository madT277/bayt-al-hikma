import type { Metadata } from "next";
import ArchivePage from "@/app/archive/page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الأعداد" };

export default function IssuesIndexPage() {
  return <ArchivePage />;
}
