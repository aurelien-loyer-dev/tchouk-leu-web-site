import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router";
import { Globe, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n/i18n";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
] as const;

function LanguageSwitcher({ isWhitesSharkPage }: { isWhitesSharkPage: boolean }) {
  const { i18n: i18nInstance } = useTranslation();
  const currentLang = (i18nInstance.language ?? "fr").split("-")[0];
  const currentEntry = LANGUAGES.find((l) => l.code === currentLang) ?? LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`gap-1.5 px-2 font-medium text-sm ${isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200" : "hover:text-[#4C93C3]"}`}
        >
          <Globe className="h-4 w-4" />
          <span>{currentEntry.flag} {currentEntry.code === "zh" ? "中文" : currentEntry.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => void i18nInstance.changeLanguage(lang.code)}
            className={currentLang === lang.code ? "font-semibold text-[#4C93C3]" : ""}
          >
            {lang.flag} {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isWhitesSharkPage = location.pathname.startsWith("/whites-shark");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (isHomePage) {
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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`backdrop-blur-md border-b ${
          isWhitesSharkPage
            ? "bg-violet-100/80 dark:bg-background/90 border-violet-300/70 dark:border-violet-400/35"
            : "bg-background/80 border-border"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-11 w-auto object-contain" />
            {isWhitesSharkPage && (
              <>
                <span className="font-semibold text-violet-400 dark:text-violet-300">X</span>
                <img src="/images/WhiteSharksLogo.png" alt="Logo White Sharks" className="h-11 w-auto object-contain rounded-sm" />
              </>
            )}
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.home")}
            </Link>
            <Link to="/club" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.club")}
            </Link>
            <Link to="/planning" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.planning")}
            </Link>
            <Link to="/whites-shark" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.whiteSharks")}
            </Link>
            <Link to="/galerie" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.gallery")}
            </Link>
            <Link to="/contact" className={isWhitesSharkPage ? "hover:text-violet-700 dark:hover:text-violet-200 transition-colors" : "hover:text-[#4C93C3] transition-colors"}>
              {t("nav.contact")}
            </Link>
            <LanguageSwitcher isWhitesSharkPage={isWhitesSharkPage} />
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher isWhitesSharkPage={isWhitesSharkPage} />
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label={t("nav.openMenu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className={`pt-12 ${isWhitesSharkPage ? "bg-violet-100/90 dark:bg-background border-violet-300/70 dark:border-violet-400/35" : ""}`}
              >
                <SheetTitle className="sr-only">{t("nav.mainMenu")}</SheetTitle>
                <nav className="flex flex-col gap-2 px-1">
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.home")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/club"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.club")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/planning"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.planning")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/whites-shark"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.whiteSharks")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/galerie"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.gallery")}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/contact"
                      className={`rounded-md px-3 py-2 font-medium ${
                        isWhitesSharkPage ? "hover:bg-violet-200/70 dark:hover:bg-violet-500/20 hover:text-violet-800 dark:hover:text-violet-200" : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {t("nav.contact")}
                    </Link>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}