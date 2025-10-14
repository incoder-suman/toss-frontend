import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  History,
  Wallet,
  Settings,
  LogOut,
  DollarSign,
  IndianRupee,
  Lock,
} from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import api from "../api/axios";

export default function Sidebar({ onNavigate }) {
  const { currency, toggleCurrency } = useCurrency();
  const [walletBalance, setWalletBalance] = useState(0);
  const [expBalance, setExpBalance] = useState(0);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userData") || "null")
  );

  const token = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------------------------------------------------
   🧑 Fetch user profile
  --------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        localStorage.setItem("userData", JSON.stringify(res.data.user));
      } catch {
        console.warn("⚠️ /auth/me missing — using local cache");
      }
    };
    fetchUser();
  }, [token]);

  /* ---------------------------------------------------------
   💰 Fetch wallet + exposure + auto-sync
  --------------------------------------------------------- */
  useEffect(() => {
    if (!token) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get("/wallet/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || {};
        setWalletBalance(data.walletBalance || 0);
        setExpBalance(data.exposure || 0);
      } catch (err) {
        console.error(
          "❌ Wallet fetch error:",
          err.response?.data || err.message
        );
      }
    };

    fetchWallet();

    const bc = new BroadcastChannel("wallet_channel");
    bc.onmessage = (msg) => {
      if (msg.data === "update_wallet") fetchWallet();
    };

    const interval = setInterval(fetchWallet, 15000);

    return () => {
      bc.close();
      clearInterval(interval);
    };
  }, [token]);

  /* ---------------------------------------------------------
   💱 Currency Conversion
  --------------------------------------------------------- */
  const usdRate = 83;
  const convert = (value = 0) =>
    currency === "USD" ? (value / usdRate).toFixed(2) : value.toFixed(2);

  /* ---------------------------------------------------------
   📋 Navigation Links
  --------------------------------------------------------- */
  const links = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/Bets", label: "Toss History", icon: <History size={18} /> },
    { to: "/wallet", label: "Wallet History", icon: <Wallet size={18} /> },
    { to: "/change-password", label: "Change Password", icon: <Lock size={18} /> }, // ✅ added
    { to: "/rules", label: "Rules", icon: <Settings size={18} /> },
  ];

  /* ---------------------------------------------------------
   🚪 Logout
  --------------------------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  /* ---------------------------------------------------------
   💬 WhatsApp Redirect
  --------------------------------------------------------- */
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "918449060585";
    const message = "Hello! I need help regarding my wallet or account.";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  /* ---------------------------------------------------------
   🖼 UI Rendering
  --------------------------------------------------------- */
  return (
    <aside className="h-full flex flex-col bg-cyan-600 text-white sm:p-5 p-4 min-w-[230px] sm:min-w-[250px]">
      {/* 👤 Profile */}
      <div className="flex flex-col items-center mb-5">
        <img
          src={user?.avatar || "/vite.jpeg"}
          alt="user"
          className="w-20 h-20 rounded-full border-4 border-white shadow-md"
        />
        <h2 className="mt-3 font-bold text-lg text-center">
          {user?.name || "Friends Toss Book"}
        </h2>
        <p className="text-sm opacity-80">
          {user?.name ? `@${user.name}` : "@User"}
        </p>
      </div>

      {/* 💰 Wallet Display */}
      <div className="bg-cyan-700 text-sm mb-4 px-3 py-2 rounded-lg shadow-inner">
        <div className="flex justify-between font-semibold">
          <span>
            BAL: {currency === "INR" ? "₹" : "$"}
            {convert(walletBalance)}
          </span>
          <span>
            EXP: {currency === "INR" ? "₹" : "$"}
            {convert(expBalance)}
          </span>
        </div>
      </div>

      {/* 🧭 Nav Links */}
      <nav className="flex-1 overflow-y-auto space-y-2 pb-4">
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

      {/* ⚙️ Footer */}
      <div className="sticky bottom-0 bg-cyan-600 pt-3 pb-2 mt-2 border-t border-cyan-700">
        <button
          onClick={handleWhatsAppRedirect}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-all text-sm sm:text-base mb-2 font-semibold shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            fill="white"
            className="w-4 h-4"
          >
            <path d="M380.9 97.1C339-2.9 214.6-30.5 123 38.6c-59.6 44.2-87.8 121.6-68.5 197.1L24 480l248.6-64.7c79.5 17.6 162.5-22.9 200.3-96.9 41.9-81.2 14.5-180.8-62-221.3zM220.6 398.2l-66.1 17.2 17.5-64.1C130 312.1 97.1 260.9 97.1 202.4c0-87 70.6-157.6 157.6-157.6 87 0 157.6 70.6 157.6 157.6 0 87-70.6 157.6-157.6 157.6-29.7 0-58.1-8.3-83.1-23.6l-11 4z" />
          </svg>
          Whatsapp Now
        </button>

        <button
          onClick={toggleCurrency}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-cyan-700 hover:bg-cyan-800 transition-all text-sm sm:text-base mb-2"
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

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all text-sm sm:text-base"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>
    </aside>
  );
}
