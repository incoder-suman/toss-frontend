// src/components/BetModal.jsx
import { useState } from "react";
import api from "../api/axios"; // ✅ use configured axios instance

export default function BetModal({ match, team, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("userToken"); // ✅ consistent key

  const placeBet = async () => {
    if (!amount || Number(amount) <= 0) {
      return alert("⚠️ Enter a valid amount");
    }

    if (!token) {
      return alert("You must be logged in to place a bet.");
    }

    try {
      setLoading(true);

      // ✅ API call using axios instance
      const res = await api.post(
        "/bets",
        {
          matchId: match._id,
          side: team,
          stake: Number(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data?.message || "✅ Bet placed successfully!");
      onSuccess?.(); // reload matches
      onClose?.(); // close modal
    } catch (err) {
      console.error("❌ Bet place error:", err);
      alert(
        err.response?.data?.message ||
          "Error placing bet. Check wallet balance or match status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3 sm:px-0">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 sm:p-8 shadow-xl transform transition-all">
        {/* Header */}
        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-700">
          Bet on {team}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-5">
          Match: <span className="font-medium text-gray-700">{match.title}</span>
        </p>

        {/* Amount Input */}
        <div className="mb-4">
          <input
            type="number"
            min="1"
            placeholder="Enter bet amount (₹)"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Potential Win */}
        <div className="flex justify-between items-center mb-6 text-sm sm:text-base">
          <span className="text-gray-600">Potential Win:</span>
          <span className="font-semibold text-green-600">
            ₹{amount ? (amount * 1.98).toFixed(2) : 0}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={placeBet}
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Placing..." : "Place Bet"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-2.5 rounded-lg transition"
          >
            Cancel
          </button>
        </div>

        {/* Footer info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Note: Winning ratio is <span className="font-semibold text-green-500">1.98x</span>
        </p>
      </div>
    </div>
  );
}
