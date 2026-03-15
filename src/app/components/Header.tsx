import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router";

export function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (isHomePage) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsVisible(true);
    }
  }, [isHomePage]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.jpg" alt="Logo TchoukLeu" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-bold text-xl">TchoukLeu</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-[#4C93C3] transition-colors">
              Accueil
            </Link>
            <Link to="/club" className="hover:text-[#4C93C3] transition-colors">
              Le Club
            </Link>
            <Link to="/entrainements" className="hover:text-[#4C93C3] transition-colors">
              Entraînements
            </Link>
            <Link to="/galerie" className="hover:text-[#4C93C3] transition-colors">
              Galerie
            </Link>
            <Link to="/contact" className="hover:text-[#4C93C3] transition-colors">
              Contact
            </Link>
            <ThemeToggle />
          </nav>

          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}