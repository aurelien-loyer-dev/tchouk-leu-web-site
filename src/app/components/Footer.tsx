import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Separator } from "./ui/separator";

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();
  const isWhiteSharks = location.pathname.startsWith("/white-sharks");
  const currentYear = new Date().getFullYear();

  const accent = isWhiteSharks ? "text-violet-400" : "text-[#5B7D95]";
  const hoverLink = "text-slate-500 hover:text-slate-200 transition-colors text-sm";

  return (
    <footer className="border-t border-white/[0.06] bg-[#070b12] px-6 pt-12 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={isWhiteSharks ? "/images/WhiteSharksLogo.png" : "/images/logo.png"}
                alt={isWhiteSharks ? "White Sharks" : "Tchouk'Leu"}
                className="h-12 w-auto object-contain"
              />
              <div>
                <p className="font-bold text-slate-100 leading-tight">
                  {isWhiteSharks ? "White Sharks" : "Tchouk'Leu"}
                </p>
                <p className="text-xs text-slate-600">
                  {isWhiteSharks ? "Sélection La Réunion" : t("footer.since")}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-4">
              {isWhiteSharks ? t("footer.indianOcean") : "Saint-Leu, La Réunion"}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">
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
                  <Link to={to} className={hoverLink}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-4">
              {t("footer.contact")}
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <ExternalLink className={`h-3.5 w-3.5 flex-shrink-0 ${accent}`} />
                <a
                  href={isWhiteSharks ? "https://www.instagram.com/wst_tchoukball/" : "https://www.instagram.com/tchouk_leu/"}
                  target="_blank"
                  rel="noreferrer"
                  className={hoverLink}
                >
                  {isWhiteSharks ? "@wst_tchoukball" : "@tchouk_leu"}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${accent}`} />
                <div className="space-y-1">
                  {isWhiteSharks ? (
                    <span className={hoverLink}>bgaillard.pro@gmail.com</span>
                  ) : (
                    <>
                      <a href="mailto:bgaillard.pro@gmail.com" className={`block ${hoverLink}`}>bgaillard.pro@gmail.com</a>
                      <a href="mailto:nicolasg97424@gmail.com" className={`block ${hoverLink}`}>nicolasg97424@gmail.com</a>
                    </>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${accent}`} />
                <div className="space-y-1">
                  <a href="tel:+33656714037" className={`block ${hoverLink}`}>+33 656 71 40 37</a>
                  {!isWhiteSharks && (
                    <a href="tel:+262692812102" className={`block ${hoverLink}`}>+262 692 812102</a>
                  )}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className={`h-3.5 w-3.5 flex-shrink-0 ${accent}`} />
                <span className={hoverLink}>Saint-Leu, Réunion</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-white/[0.06] mb-6" />
        <p className="text-xs text-slate-700 text-center">
          &copy; {currentYear} Tchouk&apos;Leu. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
