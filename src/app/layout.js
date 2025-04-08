import "./globals.css";

export const metadata = {
  title: "My News App",
  description: "A clean news application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
