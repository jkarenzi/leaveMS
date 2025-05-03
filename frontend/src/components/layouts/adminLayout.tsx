import { Outlet } from "react-router-dom";
import Sidebar from "../sideMenus/adminMenu";
import Header from "../Header";


export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 w-[calc(100vw-16rem)] overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
