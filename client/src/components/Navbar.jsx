import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Rocket } from "lucide-react";
import StartProjectButton from "./StartProjectButton";
import { useContext } from "react";
import { Context } from "../Context";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For the mobile menu
  const { user, boardsObjects, setActiveBoardObject, activeBoardObject } =
    useContext(Context);

  // Use to hide the navigation when the user login
  const location = useLocation();
  const navigate = useNavigate();

  // Function to handle smooth scrolling with offset for fixed header
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);

    if (section) {
      const navbarHeight = document.querySelector("nav").offsetHeight;
      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: sectionTop,
        behavior: "smooth",
      });
    }

    // Close the mobile menu if it's open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChange = (e) => {
    const selectedBoard = boardsObjects.find((b) => b._id === e.target.value);
    setActiveBoardObject(selectedBoard);
  };

  // Use navigate to redirect to login page
  const handleLoginClick = () => {
    navigate("/login");
  };

  // Show landing nav buttons only on landing page route
  const isLandingPage = location.pathname === "/";

  return (
    <div>
      <header className="bg-white shadow-md">
        <nav className="flex items-center justify-between p-4 mx-auto bg-white shadow-sm py-4 px-6 md:px-12 fixed top-0 left-0 right-0 z-50">
          {/* Left Side: Logo + Greeting */}
          <div className="flex items-center gap-4">
            <NavLink
              to={user ? "/home/overview" : "/"}
              className="text-xl font-bold flex items-center gap-1"
              aria-label="Go to Dashboard Home"
            >
              <Rocket color="#1446E7" strokeWidth={1} />
              <span>Wedly</span>
            </NavLink>
            <span>
              Hi {user ? `${user.firstName} ${user.lastName}` : "User"}
            </span>
          </div>

          {/* Landing Page Navigation Buttons */}
          {isLandingPage && (
            <>
              <div className="hidden md:flex space-x-8">
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
            </>
          )}

          {/* Right Side: Actions (Create button + Profile) */}
          <ul className="flex items-center gap-4">
            {user ? (
              <>
                <div className="p-4">
                  {boardsObjects && boardsObjects.length > 0 ? (
                    <select
                      id="board-select"
                      value={activeBoardObject?._id || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 rounded w-full"
                    >
                      <option value="">-- Select a Board --</option>
                      {boardsObjects.map((board) => (
                        <option key={board._id} value={board._id}>
                          {board.name || "Untitled Board"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">Loading boards...</p>
                  )}
                </div>

                <li>
                  <StartProjectButton />
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className="flex items-center"
                    aria-label="Go to profile"
                  >
                    <img
                      src={
                        user.profileImage ||
                        "placeholder image for user profile"
                      }
                      alt="User profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </NavLink>
                </li>
              </>
            ) : (
              <button
                className="hidden md:flex space-x-8"
                onClick={handleLoginClick}
              >
                Login
              </button>
            )}
          </ul>

          {/* Mobile Menu */}
          {isMenuOpen && isLandingPage && (
            <div className="md:hidden mt-4 py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <a
                  href="#hero"
                  onClick={(e) => scrollToSection(e, "hero")}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Hero
                </a>
                <a
                  href="#features"
                  onClick={(e) => scrollToSection(e, "features")}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  onClick={(e) => scrollToSection(e, "testimonials")}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => scrollToSection(e, "pricing")}
                  className="text-gray-600 hover:text-pink-500 py-2 transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  onClick={(e) => scrollToSection(e, "contact")}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {/* <button onClick={toggleMenu} className="text-gray-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button> */}
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;
