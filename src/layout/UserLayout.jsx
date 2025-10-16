import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";

export default function UserLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Sidebar */}
      <aside
        className={`fixed sm:static z-50 top-0 left-0 h-full w-64 bg-white shadow-md border-r border-gray-200 transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0`}
      >
        {/* Sidebar header (mobile close button) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sm:hidden">
          <h1 className="font-bold text-xl text-cyan-600">Freinds Toss Book</h1>
          <button onClick={() => setOpen(false)} className="text-gray-600">
            <X size={22} />
          </button>
        </div>

        <Sidebar onNavigate={() => setOpen(false)} />
      </aside>

      {/* ✅ Top bar visible only on mobile */}
      <div className="sm:hidden fixed top-0 left-0 w-full flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 z-40 shadow-sm">
        <button onClick={() => setOpen(true)} className="text-gray-700">
          <Menu size={24} />
        </button>
        <h1 className="font-bold text-cyan-600 text-lg">Freinds Toss Book</h1>
        <div className="w-6" /> {/* placeholder for symmetry */}
      </div>

      {/* ✅ Main Content */}
      <main className="flex-1 sm:ml-64 mt-12 sm:mt-0 p-4 sm:p-6 overflow-y-auto">
        <Outlet />
      </main>

      {/* ✅ Overlay for mobile sidebar */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 sm:hidden z-40"
        ></div>
      )}
    </div>
  );
}
