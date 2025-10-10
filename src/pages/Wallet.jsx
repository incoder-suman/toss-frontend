import React, { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import api from "../api/axios";

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  // ✅ Fetch live transactions
  useEffect(() => {
    if (!token) return;

    const fetchTransactions = async () => {
      try {
        const res = await api.get("/wallet/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(res.data.transactions || res.data.items || []);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // 🔁 Auto refresh every 15 sec
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // ✅ WhatsApp redirect
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "918449060585"; // ✅ with country code
    const message = "Hello! I want to Deposit or Withdraw my tokens.";
    window.location.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      {/* 🟢 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h1 className="text-2xl font-bold text-cyan-700 flex items-center gap-2">
          <WalletIcon className="w-6 h-6 text-cyan-600" />
          Deposit / Withdraw
        </h1>

        <button
          onClick={handleWhatsAppRedirect}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow-md transition-all w-full sm:w-auto"
        >
          💬 Chat with Admin (WhatsApp)
        </button>
      </div>

      {/* 🧾 Transactions Table */}
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
              const isDeposit = txn.amount > 0; // ✅ Based on actual amount sign

              return (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3 text-sm sm:text-base"
                >
                  <div className="flex items-center gap-2">
                    {isDeposit ? (
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {isDeposit ? "Token Added" : "Token Deducted"}
                      </p>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {new Date(txn.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      isDeposit ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {isDeposit ? "+" : "-"} ₹{Math.abs(txn.amount || 0)}
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
