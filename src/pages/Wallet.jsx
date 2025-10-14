import React, { useEffect, useState } from "react";
import { Wallet as WalletIcon } from "lucide-react";
import api from "../api/axios";

export default function Wallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("userToken");

  /* ------------------------------------------------------------
    🔁 Fetch wallet transactions (auto refresh every 15s)
  ------------------------------------------------------------ */
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const fetchTransactions = async () => {
      try {
        const res = await api.get("/wallet/transactions"); // interceptor adds token
        if (!mounted) return;

        const data = res.data?.transactions || [];
        setTransactions(data);
        console.log(`📦 Transactions fetched: ${data.length}`);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err.response?.data || err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  /* ------------------------------------------------------------
    📱 WhatsApp redirect for admin help
  ------------------------------------------------------------ */
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "918449060585";
    const message = "Hello! I want help with my wallet or bet transaction.";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  /* ------------------------------------------------------------
    🧠 Transaction Description Formatter
  ------------------------------------------------------------ */
  const renderDescription = (txn) => {
    const t = txn.type;
    const meta = txn.meta || {};
    const match = meta.matchName || "Unknown Match";
    const side = meta.side ? ` (${meta.side})` : "";
    const reason = meta.reason || "";

    switch (t) {
      case "BET_STAKE":
        return (
          <>
            <p className="font-semibold text-gray-800">
              Bet Placed on {match}{side}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Amount staked for your bet.
            </p>
          </>
        );

      case "BET_WIN":
        return (
          <>
            <p className="font-semibold text-green-600">
              Bet Won — {match}{side}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Winnings credited to your wallet.
            </p>
          </>
        );

      case "REVERSAL":
      case "REFUND":
      case "BET_CANCEL":
        const reasonText =
          reason === "USER_CANCELLED"
            ? "Bet cancelled by you"
            : reason === "ADMIN_CANCELLED"
            ? "Bet cancelled by admin"
            : reason === "MATCH_DRAW"
            ? "Match ended in a draw"
            : "Bet amount refunded";

        return (
          <>
            <p className="font-semibold text-yellow-600">
              {reasonText} — {match}{side}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Bet amount returned to your wallet.
            </p>
          </>
        );

      case "DEPOSIT":
        return (
          <>
            <p className="font-semibold text-green-600">Deposit Successful</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Amount added to your wallet.
            </p>
          </>
        );

      case "WITHDRAW":
        return (
          <>
            <p className="font-semibold text-red-600">Withdrawal Processed</p>
            <p className="text-gray-500 text-xs sm:text-sm">
              Amount deducted for withdrawal request.
            </p>
          </>
        );

      case "ADMIN_CREDIT":
      case "ADMIN_DEBIT":
        const label = t === "ADMIN_CREDIT" ? "Admin Credit Added" : "Admin Adjustment (Debit)";
        return (
          <>
            <p className={`font-semibold ${t === "ADMIN_CREDIT" ? "text-green-600" : "text-red-600"}`}>
              {label}
            </p>
            {meta.note && (
              <p className="text-gray-500 text-xs sm:text-sm">{meta.note}</p>
            )}
          </>
        );

      default:
        return (
          <>
            <p className="font-semibold text-gray-600 capitalize">
              {String(t || "transaction").replace(/_/g, " ").toLowerCase()}
            </p>
            {meta.matchName && (
              <p className="text-gray-500 text-xs sm:text-sm">
                {match}{side}
              </p>
            )}
          </>
        );
    }
  };

  /* ------------------------------------------------------------
    🧾 Render UI
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

      {/* Transactions Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-cyan-100">
        <div className="bg-cyan-600 text-white text-sm font-semibold px-4 py-2">
          Transaction History
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No transactions yet.</div>
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

                  {/* Timestamp & Balance */}
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
