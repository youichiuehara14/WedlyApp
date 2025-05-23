import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { Context } from "../Context";
import { Menu, X } from "lucide-react";
import ring from "../assets/icons/ring.png";

const NavbarLandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext(Context);

  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector("nav").offsetHeight;
      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: "smooth" });
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLoginClick = () => navigate("/login");

  return (
    <div className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <nav className="items-center justify-between p-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center gap-4">
            {/* Logo and standard navigation */}
            <div className="flex items-center">
              <div>
                <NavLink
                  to={"/"}
                  className="text-xl font-bold flex items-left gap-1"
                  aria-label="Go to Dashboard Home"
                >
                  <img src={ring} alt="" className="w-11 h-7 mt-2" />
                  <span
                    style={{ fontFamily: "Parisienne" }}
                    className="text-4xl font-light"
                  >
                    Wedly
                  </span>
                </NavLink>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#hero"
                onClick={(e) => scrollToSection(e, "hero")}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                About
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, "features")}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, "testimonials")}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                onClick={(e) => scrollToSection(e, "pricing")}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, "contact")}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Right side buttons */}
            <div className="">
              {/* Right Side: Actions */}
              <ul className="flex flex-col sm:flex-row items-center sm:gap-4">
                {user ? (
                  <NavLink to="/home/overview">
                    <button className="text-gray-600 hover:text-pink-500 transition-colors cursor-pointer text-l">
                      Manage Board
                    </button>
                  </NavLink>
                ) : (
                  <button
                    className="hidden md:flex space-x-8 text-gray-600 hover:text-pink-500 transition-colors cursor-pointer text-l"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLoginClick();
                    }}
                  >
                    Login
                  </button>
                )}
              </ul>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded hover:bg-gray-700"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 pt-2 border-t border-gray-700">
              <div className="flex flex-col space-y-2">
                <a
                  href="#hero"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(e, "hero");
                  }}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Hero
                </a>
                <a
                  href="#features"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(e, "features");
                  }}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(e, "testemonials");
                  }}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(e, "pricing");
                  }}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    scrollToSection(e, "contact");
                  }}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Contact
                </a>
                <div>
                  <button onClick={handleLoginClick}>Login</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default NavbarLandingPage;
