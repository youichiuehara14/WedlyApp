import { NavLink } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { Store } from 'lucide-react';
import { SquareKanban } from 'lucide-react';
import { UserRoundCog } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useContext } from 'react';
import { Context } from '../Context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Sidebar = () => {
  const { setUser } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return; // Exit if the user cancels the logout

    fetch('http://localhost:4000/api/user/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) {
          toast.success('Logged out successfully!');
          // Clear user state
          setUser(null);
          navigate('/');
        } else {
          console.error('Logout failed', response.statusText);
        }
      })
      .catch((error) => console.error('Logout error:', error));
  };

  return (
    <div className="sm:flex flex-col justify-between h-full w-72 bg-white shadow-md hidden ">
      <div className="py-15 px-10">
        <ul className="space-y-5">
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <LayoutDashboard strokeWidth={1} />
            <NavLink to="/home/overview">Overview</NavLink>
          </li>
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <SquareKanban strokeWidth={1} />
            <NavLink to="/home/tasks">Tasks</NavLink>
          </li>
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <Store strokeWidth={1} />
            <NavLink to="/home/vendor">Vendor</NavLink>
          </li>
        </ul>
      </div>

      <div className="mt-auto p-6">
        <hr className="mb-6 border-gray-300" />
        <ul className="space-y-5 ">
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <UserRoundCog strokeWidth={1} />
            <NavLink to="/home/account">Profile</NavLink>
          </li>
          <li
            className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center"
            onClick={handleLogout}
          >
            <LogOut strokeWidth={1} />
            <span>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
