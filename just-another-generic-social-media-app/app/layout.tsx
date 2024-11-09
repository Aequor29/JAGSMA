import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
interface RootLayoutProps {
  children: React.ReactNode;
}
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Just Another Generic Social Media App",
  description: "A social media app for the masses.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning={true}>
        <head />

        <body>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </>
  );
}
