import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("userData") || "null")
  );

  const token = localStorage.getItem("userToken");
  const location = useLocation();
  const navigate = useNavigate();

  /* ---------------------------------------------------------
   🧑 Fetch user info if /auth/me exists
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
        console.warn("⚠️ No /auth/me route found — fallback to local data");
      }
    };
    fetchUser();
  }, [token]);

  /* ---------------------------------------------------------
   💰 Wallet auto-fetch + live update
  --------------------------------------------------------- */
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

    fetchWallet();

    const bc = new BroadcastChannel("wallet_channel");
    bc.onmessage = (event) => {
      if (event.data === "update_wallet") fetchWallet();
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
  const convertedBalance =
    currency === "USD"
      ? (walletBalance / usdRate).toFixed(2)
      : walletBalance.toFixed(2);
  const convertedExp =
    currency === "USD"
      ? (expBalance / usdRate).toFixed(2)
      : expBalance.toFixed(2);

  /* ---------------------------------------------------------
   🧭 Navigation Links
  --------------------------------------------------------- */
  const links = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/bets", label: "Bets", icon: <Book size={18} /> },
    { to: "/history", label: "Toss History", icon: <History size={18} /> },
    { to: "/rules", label: "Rules", icon: <Settings size={18} /> },
    // ✅ Wallet redirect to WhatsApp instead of route navigation
    {
      to: null,
      label: "Deposit / Withdraw",
      icon: <Wallet size={18} />,
      action: () => {
        const phoneNumber = "918449060585";
        const message = "Hello! I want to know more about deposit/withdrawal.";
        window.location.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
          message
        )}`;
      },
    },
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
   🖼️ Render UI
  --------------------------------------------------------- */
  return (
    <aside className="h-full flex flex-col bg-cyan-600 text-white sm:p-5 p-4 min-w-[230px] sm:min-w-[250px]">
      {/* 👤 Profile Section */}
      <div className="flex flex-col items-center mb-5">
        <img
          src={user?.avatar || "https://i.pravatar.cc/100"}
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

      {/* 💰 Wallet Info */}
      <div className="flex justify-between items-center text-sm mb-4 px-3 py-2 rounded-lg bg-cyan-700 shadow-inner">
        <div>
          BAL: {currency === "INR" ? "₹" : "$"}
          {convertedBalance}
        </div>
        <div>
          EXP: {currency === "INR" ? "₹" : "$"}
          {convertedExp}
        </div>
      </div>

      {/* 🧭 Links */}
      <nav className="flex-1 overflow-y-auto space-y-2 pb-4">
        {links.map((item) =>
          item.to ? (
            <Link
              key={item.label}
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
          ) : (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-green-700 transition-all bg-green-600 font-semibold"
            >
              {item.icon}
              <span className="text-sm sm:text-base">{item.label}</span>
            </button>
          )
        )}
      </nav>

      {/* 📍 Footer */}
      <div className="sticky bottom-0 bg-cyan-600 pt-3 pb-2 mt-2 border-t border-cyan-700">
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
