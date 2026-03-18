import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patient Form - Agnos",
  description: "Real-time patient intake form with staff monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
