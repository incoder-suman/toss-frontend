import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Book,
  History,
  Wallet,
  Settings,
  LogOut,
  DollarSign,
  IndianRupee,
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import api from "../api/axios";

export default function Sidebar({ onNavigate }) {
  const { currency, toggleCurrency } = useCurrency();
  const [walletBalance, setWalletBalance] = useState(0);
  const [expBalance, setExpBalance] = useState(0);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("userToken");
  const location = useLocation();

  // ✅ Fetch logged-in user info
  useEffect(() => {
    if (!token) return;
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };
    fetchUser();
  }, [token]);

  // ✅ Fetch wallet balance (auto-refresh)
  useEffect(() => {
    if (!token) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(res.data.walletBalance || 0);
      } catch (err) {
        console.error(
          "❌ Error fetching wallet:",
          err.response?.data?.message || err.message
        );
      }
    };

    fetchWallet(); // initial
    const interval = setInterval(fetchWallet, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // 💱 Currency conversion
  const usdRate = 83;
  const convertedBalance =
    currency === "USD"
      ? (walletBalance / usdRate).toFixed(2)
      : walletBalance.toFixed(2);
  const convertedExp =
    currency === "USD"
      ? (expBalance / usdRate).toFixed(2)
      : expBalance.toFixed(2);

  // ✅ Sidebar navigation items
  const links = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/bets", label: "Bets", icon: <Book size={18} /> },
    { to: "/history", label: "Toss History", icon: <History size={18} /> },
    { to: "/dw", label: "D / W History", icon: <Wallet size={18} /> },
    { to: "/rules", label: "Rules", icon: <Settings size={18} /> },
    { to: "/wallet", label: "Deposit / Withdraw", icon: <Wallet size={18} /> },
  ];

  return (
    <aside className="h-full flex flex-col bg-cyan-600 text-white p-4 sm:p-5 overflow-y-auto min-w-[230px] sm:min-w-[250px]">
      {/* 👤 Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={user?.avatar || "https://i.pravatar.cc/100"}
          alt="user"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md"
        />
        <h2 className="mt-3 font-bold text-lg text-center">
          {user?.name || "Friends Toss Book"}
        </h2>
        <p className="text-sm opacity-80">
          {user?.username ? `@${user.username}` : user?.name ? `@${user.name}` : "@User"}
        </p>
      </div>

      {/* 💰 Wallet Info */}
      <div className="flex justify-between items-center text-sm mb-5 px-3 py-2 rounded-lg bg-cyan-700 shadow-inner">
        <div>
          BAL: {currency === "INR" ? "₹" : "$"}
          {convertedBalance}
        </div>
        <div>
          EXP: {currency === "INR" ? "₹" : "$"}
          {convertedExp}
        </div>
      </div>

      {/* 🧭 Navigation Links */}
      <nav className="flex-1 space-y-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              location.pathname === item.to
                ? "bg-cyan-800 font-semibold shadow-sm"
                : "hover:bg-cyan-700"
            }`}
          >
            {item.icon}
            <span className="text-sm sm:text-base">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 💱 Currency Switch */}
      <button
        onClick={toggleCurrency}
        className="mt-5 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 transition-all text-sm sm:text-base"
      >
        {currency === "INR" ? (
          <>
            <IndianRupee size={18} /> INR
          </>
        ) : (
          <>
            <DollarSign size={18} /> USD
          </>
        )}
      </button>

      {/* 🚪 Logout */}
      <Link
        to="/logout"
        onClick={onNavigate}
        className="mt-6 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all text-sm sm:text-base"
      >
        <LogOut size={18} /> Log out
      </Link>
    </aside>
  );
}
