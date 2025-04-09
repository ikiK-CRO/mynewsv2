import "./globals.scss";
import Topbar from "./components/Topbar";
import React from "react";
import { AuthProvider } from "./context/AuthContext";

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
          <Topbar />
          <div className="container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 