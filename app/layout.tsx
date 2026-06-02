import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VNA Frontend",
  description: "VNA Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
