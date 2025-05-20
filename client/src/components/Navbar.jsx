import { NavLink } from 'react-router';
import { Rocket } from 'lucide-react';
import StartProjectButton from './StartProjectButton';
import { useContext } from 'react';
import { Context } from '../Context';

// Navbar Component
const Navbar = () => {
  const { user, boardsObjects, setActiveBoardObject, activeBoardObject } =
    useContext(Context);

  const handleChange = (e) => {
    const selectedBoard = boardsObjects.find((b) => b._id === e.target.value);
    setActiveBoardObject(selectedBoard);
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="flex items-center justify-between p-4 w-[90%] mx-auto">
        {/* Left Side: Logo + Greeting */}
        <div className="flex items-center gap-4">
          <NavLink
            to={user ? '/home/overview' : '/'}
            className="text-xl font-bold flex items-center gap-1"
            aria-label="Go to Dashboard Home"
          >
            <Rocket color="#1446E7" strokeWidth={1} />
            <span>DashboardX</span>
          </NavLink>
          <span>Hi {user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
        </div>

        {/* Right Side: Actions (Create button + Profile) */}
        <ul className="flex items-center gap-4">
          {user ? (
            <>
              <div className="p-4">
                {boardsObjects && boardsObjects.length > 0 ? (
                  <select
                    id="board-select"
                    value={activeBoardObject?._id || ''}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full"
                  >
                    <option value="">-- Select a Board --</option>
                    {boardsObjects.map((board) => (
                      <option key={board._id} value={board._id}>
                        {board.name || 'Untitled Board'}
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
                      user.profileImage || 'placeholder image for user profile'
                    }
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
