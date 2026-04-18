import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
] as const;

function LanguageSwitcher({ isWhiteSharks }: { isWhiteSharks: boolean }) {
  const { i18n: i18nInstance } = useTranslation();
  const currentLang = (i18nInstance.language ?? "fr").split("-")[0];
  const activeColor = isWhiteSharks ? "text-violet-600 dark:text-violet-300" : "text-[#5B7D95]";

  return (
    <div className="flex items-center gap-0.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => void i18nInstance.changeLanguage(lang.code)}
          className={`px-1.5 py-0.5 text-xs font-semibold rounded transition-colors ${
            currentLang === lang.code ? activeColor : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {lang.code === "zh" ? "中文" : lang.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const NAV_LINKS = [
  { to: "/", key: "nav.home", exact: true },
  { to: "/club", key: "nav.club", exact: false },
  { to: "/planning", key: "nav.planning", exact: false },
  { to: "/white-sharks", key: "nav.whiteSharks", exact: false },
  { to: "/galerie", key: "nav.gallery", exact: false },
  { to: "/contact", key: "nav.contact", exact: false },
] as const;

export function Header() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isWhiteSharks = location.pathname.startsWith("/white-sharks");

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => setIsVisible(window.scrollY > 10);
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsVisible(true);
    }
  }, [isHomePage]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = (to: string, exact: boolean) => {
    const active = isActive(to, exact);
    const activeStyle = isWhiteSharks
      ? "text-violet-700 dark:text-violet-300"
      : "text-[#5B7D95]";
    const inactiveStyle = isWhiteSharks
      ? "text-foreground/70 hover:text-violet-700 dark:hover:text-violet-300"
      : "text-foreground/70 hover:text-foreground";
    return `relative text-sm font-medium transition-colors pb-0.5 ${active ? activeStyle : inactiveStyle}`;
  };

  const mobileLinkClass = (to: string, exact: boolean) => {
    const active = isActive(to, exact);
    const baseStyle = "rounded-md px-3 py-2 text-sm font-medium transition-colors";
    if (active) {
      return isWhiteSharks
        ? `${baseStyle} bg-violet-100 dark:bg-violet-500/20 text-violet-800 dark:text-violet-200`
        : `${baseStyle} bg-accent text-[#5B7D95]`;
    }
    return isWhiteSharks
      ? `${baseStyle} hover:bg-violet-100/70 dark:hover:bg-violet-500/10 text-foreground/70`
      : `${baseStyle} hover:bg-accent/60 text-foreground/70`;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`backdrop-blur-md border-b ${
          isWhiteSharks
            ? "bg-violet-50/85 dark:bg-background/90 border-violet-200/60 dark:border-violet-400/25"
            : "bg-background/85 border-border/60"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-9 w-auto object-contain" />
            {isWhiteSharks && (
              <>
                <span className="text-sm font-medium text-muted-foreground">×</span>
                <img
                  src="/images/WhiteSharksLogo.png"
                  alt="Logo White Sharks"
                  className="h-9 w-auto object-contain rounded-sm"
                />
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ to, key, exact }) => (
              <Link key={to} to={to} className={navLinkClass(to, exact)}>
                {t(key)}
                {isActive(to, exact) && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-px ${
                      isWhiteSharks ? "bg-violet-500" : "bg-[#5B7D95]"
                    }`}
                  />
                )}
              </Link>
            ))}
            <LanguageSwitcher isWhiteSharks={isWhiteSharks} />
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher isWhiteSharks={isWhiteSharks} />
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label={t("nav.openMenu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={`pt-10 ${
                  isWhiteSharks
                    ? "bg-violet-50/95 dark:bg-background border-violet-200/60 dark:border-violet-400/25"
                    : "bg-background"
                }`}
              >
                <SheetTitle className="sr-only">{t("nav.mainMenu")}</SheetTitle>
                <nav className="flex flex-col gap-1 px-1">
                  {NAV_LINKS.map(({ to, key, exact }) => (
                    <SheetClose key={to} asChild>
                      <Link to={to} className={mobileLinkClass(to, exact)}>
                        {t(key)}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
