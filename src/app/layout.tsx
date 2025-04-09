import "./globals.scss";
import Topbar from "./components/Topbar";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { NewsProvider } from "./context/NewsContext";

export const metadata = {
  title: "My News App",
  description: "A clean news application",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <NewsProvider>
            <Topbar />
            <div className="container">
              {children}
            </div>
          </NewsProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 