import type { Metadata } from "next";
import "./admin.css";
import FeedbackProvider from "@/components/caja/ui/Feedback";

export const metadata: Metadata = {
  title: "Panel de Caja · El Papán Huasteco",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#253d28" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="caja-root">
      <FeedbackProvider>{children}</FeedbackProvider>
    </div>
  );
}
