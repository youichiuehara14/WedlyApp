import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Context } from '../Context';

import ring from '../assets/icons/ring.png';

const NavbarLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useContext(Context);

  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === '/';

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('nav').offsetHeight;
      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLoginClick = () => navigate('/login');

  return (
    <div>
      <header className="bg-white mt-5 shadow-md">
        <nav className="flex flex-col sm:flex-row items-center justify-between p-4 w-[90%] mx-auto">
          <NavLink
            to={'/'}
            className="text-xl font-bold flex items-center gap-1"
            aria-label="Go to Dashboard Home"
          >
            <img src={ring} alt="" className="w-11" />
            <span
              style={{ fontFamily: 'Parisienne' }}
              className="text-4xl font-light"
            >
              Wedly
            </span>
          </NavLink>

          {/* Landing Page Navigation Buttons */}
          {isLandingPage && (
            <div className="hidden md:flex space-x-8 text-l">
              <a
                href="#hero"
                onClick={(e) => scrollToSection(e, 'hero')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                About
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Features
              </a>
              <a
                href="#testimonials"
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                onClick={(e) => scrollToSection(e, 'pricing')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#contact"
                onClick={(e) => scrollToSection(e, 'contact')}
                className="text-gray-600 hover:text-pink-500 transition-colors"
              >
                Contact
              </a>
            </div>
          )}

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
                className="text-gray-600 hover:text-pink-500 transition-colors cursor-pointer text-l"
                onClick={handleLoginClick}
              >
                Login
              </button>
            )}
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default NavbarLandingPage;
