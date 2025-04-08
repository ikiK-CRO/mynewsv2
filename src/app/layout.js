import "./globals.scss";
import Topbar from "./components/Topbar";

export const metadata = {
  title: "My News App",
  description: "A clean news application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Topbar />
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}
