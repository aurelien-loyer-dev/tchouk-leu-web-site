import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中" },
] as const;

function LanguageSwitcher() {
  const { i18n: i18nInstance } = useTranslation();
  const currentLang = (i18nInstance.language ?? "fr").split("-")[0];

  return (
    <div className="flex items-center gap-0.5">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          onClick={() => void i18nInstance.changeLanguage(lang.code)}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
            currentLang === lang.code
              ? "text-[#7BAEC8] bg-[#5B7D95]/20"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

const NAV_LINKS = [
  { to: "/", key: "nav.home", exact: true },
  { to: "/club", key: "nav.club", exact: false },
  { to: "/oiboi", key: "nav.oiboi", exact: false },
  { to: "/planning", key: "nav.planning", exact: false },
  { to: "/galerie", key: "nav.gallery", exact: false },
  { to: "/contact", key: "nav.contact", exact: false },
] as const;

export function Header() {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  useEffect(() => {
    if (isHomePage) {
      const handleScroll = () => setIsVisible(window.scrollY > 60);
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

  const activePill = "bg-[#5B7D95]/20 text-[#7BAEC8] border border-[#5B7D95]/30";
  const hoverClass = "hover:text-[#7BAEC8] hover:bg-[#5B7D95]/10";
  const sizeClass = isChinese ? "text-sm px-3 py-1.5" : "text-sm px-4 py-1.5";

  const navLinkClass = (to: string, exact: boolean) =>
    `${sizeClass} font-medium rounded-full transition-all ${
      isActive(to, exact) ? activePill : `text-slate-400 ${hoverClass}`
    }`;

  const mobileLinkClass = (to: string, exact: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(to, exact)
        ? "bg-[#5B7D95]/20 text-[#7BAEC8]"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-[#070b12]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/images/logo.png" alt="Tchouk'Leu" className="h-8 w-auto object-contain" />
          </Link>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {NAV_LINKS.map(({ to, key, exact }) => (
              <Link key={to} to={to} className={navLinkClass(to, exact)}>
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    aria-label={t("nav.openMenu")}
                  >
                    {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#0d1520] border-white/[0.07] pt-12 w-64">
                  <SheetTitle className="sr-only">{t("nav.mainMenu")}</SheetTitle>
                  <nav className="flex flex-col gap-1 px-2">
                    {NAV_LINKS.map(({ to, key, exact }) => (
                      <SheetClose key={to} asChild>
                        <Link to={to} className={mobileLinkClass(to, exact)}>
                          {t(key)}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="px-4 mt-6 pt-4 border-t border-white/[0.07]">
                    <LanguageSwitcher />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
