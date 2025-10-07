import { useState } from "react";
import axios from "axios";

export default function BetModal({ match, team, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const placeBet = async () => {
    // 🔹 validation
    if (!amount || Number(amount) <= 0)
      return alert("Enter a valid amount");

    if (!token)
      return alert("You must be logged in to place a bet.");

    try {
      setLoading(true);

      // 🔹 API call with correct key 'stake'
      const res = await axios.post(
        "http://localhost:5000/api/bets",
        {
          matchId: match._id,
          side: team, // 'IND' or 'AUS' (must match backend validation)
          stake: Number(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data?.message || "✅ Bet placed successfully!");
      onSuccess?.();
      onClose?.();
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-center mb-3">
          Bet on {team}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          Match: {match.title}
        </p>

        <input
          type="number"
          min="1"
          placeholder="Enter amount"
          className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-cyan-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Potential Win:{" "}
            <span className="font-semibold text-green-600">
              ₹{amount ? (amount * 1.9).toFixed(2) : 0}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={placeBet}
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg"
          >
            {loading ? "Placing..." : "Place Bet"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
