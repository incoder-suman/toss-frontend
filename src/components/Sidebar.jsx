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
import axios from "axios";

export default function Sidebar({ onNavigate }) {
  const { currency, toggleCurrency } = useCurrency();
  const [walletBalance, setWalletBalance] = useState(0);
  const [expBalance, setExpBalance] = useState(0);
  const token = localStorage.getItem("token");
  const location = useLocation();

  // ✅ Fetch wallet balance
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletBalance(res.data.walletBalance || 0);
      } catch (err) {
        console.error("Error fetching wallet:", err.response?.data || err.message);
      }
    };
    fetchWallet();
    const interval = setInterval(fetchWallet, 10000);
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

  // ✅ Nav items
  const links = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/bets", label: "Bets", icon: <Book size={18} /> },
    { to: "/history", label: "Toss History", icon: <History size={18} /> },
    { to: "/dw", label: "D / W History", icon: <Wallet size={18} /> },
    { to: "/rules", label: "Rules", icon: <Settings size={18} /> },
    { to: "/wallet", label: "Deposit / Withdraw", icon: <Wallet size={18} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-cyan-600 text-white p-5 overflow-y-auto">
      {/* 👤 Profile Section */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="https://i.pravatar.cc/100"
          alt="user"
          className="w-20 h-20 rounded-full border-4 border-white"
        />
        <h2 className="mt-3 font-bold text-lg text-center">Friends Toss Book</h2>
        <p className="text-sm opacity-80">@User</p>
      </div>

      {/* 💰 Wallet Info */}
      <div className="flex justify-between items-center text-sm mb-5 px-3 py-2 rounded-lg bg-cyan-700">
        <div>
          BAL: {currency === "INR" ? "₹" : "$"}
          {convertedBalance}
        </div>
        <div>
          EXP: {currency === "INR" ? "₹" : "$"}
          {convertedExp}
        </div>
      </div>

      {/* 🧭 Nav Links */}
      <nav className="flex-1 space-y-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
              location.pathname === item.to
                ? "bg-cyan-800 font-semibold"
                : "hover:bg-cyan-700"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 💱 Currency Switch */}
      <button
        onClick={toggleCurrency}
        className="mt-5 flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 transition-all"
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
        className="mt-6 flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all"
      >
        <LogOut size={18} /> Log out
      </Link>
    </div>
  );
}
