import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const isWhiteSharks = location.pathname.startsWith("/white-sharks");
  const currentYear = new Date().getFullYear();

  const accent = isWhiteSharks ? "text-violet-500 dark:text-violet-400" : "text-[#5B7D95]";
  const hoverLink = isWhiteSharks
    ? "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
    : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <footer
      className={`border-t py-14 px-6 ${
        isWhiteSharks
          ? "border-violet-200/50 dark:border-violet-400/20 bg-violet-50/40 dark:bg-violet-950/10"
          : "border-border/40 bg-muted/10 dark:bg-muted/5"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-14 w-auto" />
              {isWhiteSharks && (
                <img
                  src="/images/WhiteSharksLogo.png"
                  alt="Logo White Sharks"
                  className="h-14 w-auto object-contain rounded-sm"
                />
              )}
              <div>
                <p className="font-bold leading-tight">
                  {isWhiteSharks ? "White Sharks" : "Tchouk'Leu"}
                </p>
                {!isWhiteSharks && (
                  <p className="text-xs text-muted-foreground">{t("footer.since")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t("footer.quickLinks")}
            </p>
            <ul className="space-y-2">
              {[
                { to: "/", label: t("nav.home") },
                { to: "/club", label: t("nav.club") },
                { to: "/planning", label: t("nav.planning") },
                { to: "/white-sharks", label: "White Sharks" },
                { to: "/galerie", label: t("nav.gallery") },
                { to: "/contact", label: t("nav.contact") },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className={`text-sm ${hoverLink}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {t("footer.contact")}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <ExternalLink className={`h-4 w-4 flex-shrink-0 ${accent}`} />
                <a
                  href={
                    isWhiteSharks
                      ? "https://www.instagram.com/wst_tchoukball/"
                      : "https://www.instagram.com/tchouk_leu/"
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={`text-sm ${hoverLink}`}
                >
                  {isWhiteSharks ? "@wst_tchoukball" : "@tchouk_leu"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className={`h-4 w-4 flex-shrink-0 mt-0.5 ${accent}`} />
                <div className="space-y-0.5">
                  {isWhiteSharks ? (
                    <span className="text-sm text-muted-foreground">bgaillard.pro@gmail.com</span>
                  ) : (
                    <>
                      <a href="mailto:bgaillard.pro@gmail.com" className={`block text-sm ${hoverLink}`}>
                        bgaillard.pro@gmail.com
                      </a>
                      <a href="mailto:nicolasg97424@gmail.com" className={`block text-sm ${hoverLink}`}>
                        nicolasg97424@gmail.com
                      </a>
                    </>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className={`h-4 w-4 flex-shrink-0 mt-0.5 ${accent}`} />
                <div className="space-y-0.5">
                  <a href="tel:+33656714037" className={`block text-sm ${hoverLink}`}>
                    +33 6 56 71 40 37
                  </a>
                  {!isWhiteSharks && (
                    <a href="tel:+262692812102" className={`block text-sm ${hoverLink}`}>
                      +262 692 812102
                    </a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className={`h-4 w-4 flex-shrink-0 ${accent}`} />
                <span className="text-sm text-muted-foreground">
                  {isWhiteSharks ? t("footer.indianOcean") : "Saint-Leu, Réunion"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={`mt-10 pt-6 border-t text-center ${
            isWhiteSharks ? "border-violet-200/40 dark:border-violet-400/20" : "border-border/40"
          }`}
        >
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Tchouk&apos;Leu. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
