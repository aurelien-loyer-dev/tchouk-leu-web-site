import { Instagram, Mail, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link, useLocation } from "react-router";

export function Footer() {
  const location = useLocation();
  const isWhitesSharkPage = location.pathname.startsWith("/whites-shark");
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`py-16 px-6 relative overflow-hidden ${
        isWhitesSharkPage ? "bg-violet-100/75 dark:bg-violet-950/25 text-foreground" : "bg-muted/30 dark:bg-muted/10"
      }`}
    >
      {/* Bird decoration */}
      <div className="absolute bottom-0 right-0 opacity-5 dark:opacity-5">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763688506457-325a5103e3c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHRyb3BpY2FsJTIwYmlyZCUyMGZseWluZ3xlbnwxfHx8fDE3NzM1NTc5NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Paille-en-queue"
          className="w-48 h-48 object-contain"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Logo & Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-12 w-10" />
              {isWhitesSharkPage && (
                <>
                  <img src="/images/WhiteSharksLogo.png" alt="Logo White Sharks" className="h-12 w-auto object-contain rounded-sm" />
                </>
              )}
              <div>
                <h3 className="text-2xl font-bold">{isWhitesSharkPage ? "White Sharks" : "Tchouk'Leu"}</h3>
                {!isWhitesSharkPage && (
                  <p className="text-sm text-muted-foreground">Depuis 2014</p>
                )}
              </div>
            </div>
            <p className={isWhitesSharkPage ? "text-muted-foreground" : "text-muted-foreground"}>
              Zenèss La Réunion
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/club"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  Tchouk'Leu
                </Link>
              </li>
              <li>
                <Link
                  to="/planning"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  Planning
                </Link>
              </li>
              <li>
                <Link
                  to="/whites-shark"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  White Sharks
                </Link>
              </li>
              <li>
                <Link
                  to="/galerie"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  Galerie
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={isWhitesSharkPage ? "text-muted-foreground hover:text-violet-800 dark:hover:text-violet-200 transition-colors" : "text-muted-foreground hover:text-[#4C93C3] transition-colors"}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Contact</h4>
            <ul className="space-y-3">
              <li className={isWhitesSharkPage ? "flex items-center gap-3 text-muted-foreground" : "flex items-center gap-3 text-muted-foreground"}>
                <Instagram className={isWhitesSharkPage ? "h-5 w-5 text-violet-500 dark:text-violet-300" : "h-5 w-5 text-[#4C93C3]"} />
                {isWhitesSharkPage && (
                  <a
                    href="https://www.instagram.com/wst_tchoukball/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-violet-800 dark:hover:text-violet-200 transition-colors"
                  >
                    @wst_tchoukball
                  </a>
                )}
                {!isWhitesSharkPage && (
                  <a
                    href="https://www.instagram.com/tchouk_leu/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#4C93C3] transition-colors"
                  >
                    @tchouk_leu
                  </a>
                )}
              </li>
              <li className={isWhitesSharkPage ? "flex items-center gap-3 text-muted-foreground" : "flex items-center gap-3 text-muted-foreground"}>
                <Mail className={isWhitesSharkPage ? "h-5 w-5 text-violet-500 dark:text-violet-300" : "h-5 w-5 text-[#4C93C3]"} />
                <span>bgaillard.pro@gmail.com</span>
              </li>
              <li className={isWhitesSharkPage ? "flex items-center gap-3 text-muted-foreground" : "flex items-center gap-3 text-muted-foreground"}>
                <MapPin className={isWhitesSharkPage ? "h-5 w-5 text-violet-500 dark:text-violet-300" : "h-5 w-5 text-[#4C93C3]"} />
                <span>{isWhitesSharkPage ? "Profondeurs de l'Océan Indien" : "Saint-Leu, Réunion"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={isWhitesSharkPage ? "mt-12 pt-8 border-t border-violet-300/40 dark:border-violet-400/30 text-center text-muted-foreground" : "mt-12 pt-8 border-t border-border text-center text-muted-foreground"}>
          <p>&copy; {currentYear} Tchouk'Leu. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}