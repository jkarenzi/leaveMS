import { NavLink } from "react-router-dom";
import { FaHome, FaUsers, FaCalendarAlt, FaClipboardList, FaUserCog } from "react-icons/fa";
import { useAppSelector } from "../../redux/hooks";


const adminNavItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/admin/leave-requests', label: 'Leave Requests', icon: <FaClipboardList /> },
    { path: '/admin/employees', label: 'Employees', icon: <FaUsers /> },
    { path: '/admin/leave-types', label: 'Leave Types', icon: <FaUserCog /> },
    { path: '/admin/calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
];

const managerNavItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <FaHome /> },
  { path: '/manager/leave-requests', label: 'Leave Requests', icon: <FaClipboardList /> },
  { path: '/manager/employees', label: 'Employees', icon: <FaUsers /> },
  { path: '/manager/calendar', label: 'Calendar', icon: <FaCalendarAlt /> },
];

export default function Sidebar() {
  const {user} = useAppSelector(state => state.user)
  return (
    <aside className="w-64 bg-white h-screen p-4 border-r shadow-md">
      <h1 className="text-xl font-bold mb-6 px-2">HR-LMS</h1>
      <nav className="flex flex-col gap-3">
        {user?.role === 'admin' && adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                isActive ? "bg-gray-200 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {user?.role === 'manager' && managerNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md transition ${
                isActive ? "bg-gray-200 font-medium" : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}