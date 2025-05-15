import { NavLink } from 'react-router';
import { LayoutDashboard } from 'lucide-react';
import { Store } from 'lucide-react';
import { SquareKanban } from 'lucide-react';
import { UserRoundCog } from 'lucide-react';
import { LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sm:flex flex-col justify-between h-full w-72 bg-white shadow-md hidden ">
      <div className="py-15 px-10">
        <ul className="space-y-5">
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <LayoutDashboard strokeWidth={1} />
            <NavLink to="/overview">Overview</NavLink>
          </li>
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <SquareKanban strokeWidth={1} />
            <NavLink to="/tasks">Tasks</NavLink>
          </li>
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <Store strokeWidth={1} />
            <span>Vendor</span>
          </li>
        </ul>
      </div>

      <div className="mt-auto p-6">
        <hr className="mb-6 border-gray-300" />
        <ul className="space-y-5 ">
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <UserRoundCog strokeWidth={1} />
            <NavLink to="/profile">Profile</NavLink>
          </li>
          <li className="cursor-pointer hover:text-blue-500 font-medium flex gap-4 items-center">
            <LogOut strokeWidth={1} />
            <NavLink to="/logout">Logout</NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
