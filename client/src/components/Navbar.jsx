// ==============================
// Notes:
// Initial setup for Navigatino Bar UI
// This is purely UI only and non-functional.
// Logic is to be added and refactored later including styling.
// ==============================

import { NavLink } from 'react-router';
import { Rocket } from 'lucide-react';
import StartProjectButton from './StartProjectButton';
import { useContext } from 'react';
import { Context } from '../Context';

// Navbar Component
const Navbar = () => {
  const { user } = useContext(Context);

  return (
    <header className="bg-white shadow-md">
      <nav className="flex items-center justify-between p-4 w-[90%] mx-auto">
        {/* Left Side: Logo + Greeting */}
        <div className="flex items-center gap-4">
          <NavLink
            to={user ? '/home' : '/'}
            className="text-xl font-bold flex items-center gap-1"
            aria-label="Go to Dashboard Home"
          >
            <Rocket color="#1446E7" strokeWidth={1} />
            <span>DashboardX</span>
          </NavLink>
          <span>Hi {user ? `${user.user.firstName} ${user.user.lastName}` : 'User'}</span>
        </div>

        {/* Right Side: Actions (Create button + Profile) */}
        <ul className="flex items-center gap-4">
          {user ? (
            <>
              <li>
                <StartProjectButton />
              </li>
              <li>
                <NavLink to="/profile" className="flex items-center" aria-label="Go to profile">
                  <img
                    src={user.profileImage || 'placeholder image for user profile'}
                    alt="User profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </NavLink>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login" className="flex items-center">
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
