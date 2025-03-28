import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { Aside } from "@/components/aside";
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header";
import ClientLayout from "./client_layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vistats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`flex min-h-screen w-full ${geistSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
