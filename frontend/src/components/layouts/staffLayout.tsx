import { Outlet } from "react-router-dom";
import Sidebar from "../sideMenus/staffMenu";
import Header from "../Header";

export default function StaffLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
