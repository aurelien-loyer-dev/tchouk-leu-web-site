import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

export function Header() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

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
      <div className="bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/images/logo.png" alt="Logo Tchouk'Leu" className="h-11 w-auto object-contain" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="hover:text-[#4C93C3] transition-colors">
              Accueil
            </Link>
            <Link to="/club" className="hover:text-[#4C93C3] transition-colors">
              Le Club
            </Link>
            <Link to="/planning" className="hover:text-[#4C93C3] transition-colors">
              Planning
            </Link>
            <Link to="/whites-shark" className="hover:text-[#4C93C3] transition-colors">
              Whites Shark
            </Link>
            <Link to="/galerie" className="hover:text-[#4C93C3] transition-colors">
              Galerie
            </Link>
            <Link to="/contact" className="hover:text-[#4C93C3] transition-colors">
              Contact
            </Link>
            <ThemeToggle />
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Ouvrir le menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pt-12">
                <SheetTitle className="sr-only">Menu principal</SheetTitle>
                <nav className="flex flex-col gap-2 px-1">
                  <SheetClose asChild>
                    <Link to="/" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Accueil
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/club" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Le Club
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/planning" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Planning
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/whites-shark" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Whites Shark
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/galerie" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Galerie
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/contact" className="rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-accent-foreground">
                      Contact
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