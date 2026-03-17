import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ThemeProvider } from "./ThemeProvider";

export function Layout() {
  const location = useLocation();
  const isWhitesSharkPage = location.pathname.startsWith("/whites-shark");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    document.title = isWhitesSharkPage ? "Tchouk'Leu X White Sharks" : "Tchouk'Leu";

    const faviconHref = isWhitesSharkPage ? "/images/WhiteSharksLogo.png" : "/images/logo.png";
    let faviconElement = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;

    if (!faviconElement) {
      faviconElement = document.createElement("link");
      faviconElement.rel = "icon";
      document.head.appendChild(faviconElement);
    }

    faviconElement.href = faviconHref;
  }, [isWhitesSharkPage]);

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
