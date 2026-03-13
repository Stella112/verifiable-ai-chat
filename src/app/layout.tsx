import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verifiable AI Chat",
  description: "Secure, TEE-verified AI chat interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
