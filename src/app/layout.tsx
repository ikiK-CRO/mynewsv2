import "./globals.scss";
import Topbar from "./components/Topbar";
import React from "react";
import { AppProvider } from "./context/AppProvider";
import TransitionLayout from "./components/TransitionLayout";

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
        <AppProvider>
          <Topbar />
          <div className="container">
            <TransitionLayout>
              {children}
            </TransitionLayout>
          </div>
        </AppProvider>
      </body>
    </html>
  );
} 