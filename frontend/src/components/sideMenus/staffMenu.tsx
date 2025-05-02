import { NavLink } from "react-router-dom";
import { FaHome, FaPlaneDeparture, FaClock, FaUsers } from "react-icons/fa";


const navItems = [
  { label: "Dashboard", icon: <FaHome />, path: "/staff/dashboard" },
  { label: "Apply for Leave", icon: <FaPlaneDeparture />, path: "/staff/apply" },
  { label: "Leave History", icon: <FaClock />, path: "/staff/leave-history" },
  { label: "Team Calendar", icon: <FaUsers />, path: "/staff/team-calendar" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen p-4 border-r shadow-md">
      <h1 className="text-xl font-bold mb-6 px-2">HR-LMS</h1>
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => (
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