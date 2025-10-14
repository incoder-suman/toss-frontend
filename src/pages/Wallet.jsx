import React, { useEffect, useState } from "react";
import { Wallet as WalletIcon } from "lucide-react";
import api from "../api/axios";

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  /* ------------------------------------------------------------
    🔁 Fetch all wallet transactions
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!token) return;

    const fetchTransactions = async () => {
      try {
        const res = await api.get("/wallet/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, [token]);

  /* ------------------------------------------------------------
    📱 WhatsApp Redirect for Admin Chat
  ------------------------------------------------------------ */
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "918449060585"; // include country code
    // const message = "Hello! I want to Deposit or Withdraw my tokens.";
    window.location.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
  };

  /* ------------------------------------------------------------
    🧠 Transaction Type Formatter
  ------------------------------------------------------------ */
  const renderDescription = (txn) => {
    const t = txn.type;
    const meta = txn.meta || {};

    // 🧩 Betting Transactions
    if (t === "BET_STAKE") {
      return (
        <>
          <p className="font-semibold text-gray-800">
            Bet on {meta.matchName || "Unknown Match"}
          </p>
          {meta.side && (
            <p className="text-gray-500 text-xs sm:text-sm">
              Your Bet: {meta.side}
            </p>
          )}
        </>
      );
    }

    if (t === "BET_WIN") {
      return (
        <>
          <p className="font-semibold text-green-600">
            Win bet on {meta.matchName || "Unknown Match"}
          </p>
          {meta.side && (
            <p className="text-gray-500 text-xs sm:text-sm">
              Your Bet: {meta.side}
            </p>
          )}
        </>
      );
    }

    // 🧩 Wallet & Admin Transactions
    if (t === "ADMIN_CREDIT") {
      return <p className="font-semibold text-green-600">Money Added To Wallet</p>;
    }

    if (t === "WITHDRAW") {
      return (
        <p className="font-semibold text-red-600">
          Money withdrawal from wallet
        </p>
      );
    }

    if (t === "DEPOSIT") {
      return (
        <p className="font-semibold text-green-600">Deposit added</p>
      );
    }

    // Default fallback
    return (
      <p className="font-semibold text-gray-600 capitalize">
        {t.replace("_", " ").toLowerCase()}
      </p>
    );
  };

  /* ------------------------------------------------------------
    🧾 Render Component
  ------------------------------------------------------------ */
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold text-cyan-700 flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-cyan-600" />
          Wallet History
        </h1>

        <button
          onClick={handleWhatsAppRedirect}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-all w-full sm:w-auto"
        >
          💬 Chat with Admin (WhatsApp)
        </button>
      </div>

      {/* Transaction Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-cyan-100">
        <div className="bg-cyan-600 text-white text-sm font-semibold px-4 py-2">
          Transaction History
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((txn, i) => {
              const isPositive = txn.amount > 0;
              return (
                <div key={i} className="px-4 py-3">
                  {/* Description & Amount */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">{renderDescription(txn)}</div>

                    <div
                      className={`font-bold ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : "-"}₹{Math.abs(txn.amount || 0)}
                    </div>
                  </div>

                  {/* Timestamp + Balance */}
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{new Date(txn.createdAt).toLocaleString()}</span>
                    {txn.balanceAfter != null && (
                      <span>Balance: ₹{txn.balanceAfter.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
