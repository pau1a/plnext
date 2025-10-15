import "@/styles/globals.scss";
import AppShell from "@/components/app-shell";
import type { ReactNode } from "react";

export const metadata = {
  title: "Paula Livingstone",
  description: "Cybersecurity • AI • Engineering",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AppShell>{children}</AppShell>
    </html>
  );
}

