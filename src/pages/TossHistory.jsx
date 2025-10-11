import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TossHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
   🧾 Fetch Toss History (only completed matches)
  --------------------------------------------------------- */
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const res = await api.get("/bets/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.bets || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching toss history:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    // 🔁 Auto refresh every 20s
    const interval = setInterval(fetchHistory, 20000);

    // 🛰️ Listen for broadcast updates (result published / wallet change)
    const bc = new BroadcastChannel("wallet_channel");
    bc.onmessage = (msg) => {
      if (msg.data === "refresh_bets" || msg.data === "update_wallet") {
        fetchHistory();
      }
    };

    return () => {
      clearInterval(interval);
      bc.close();
    };
  }, []);

  /* ---------------------------------------------------------
   📊 Stats Calculation
  --------------------------------------------------------- */
  const totalWon = history
    .filter((b) => b.match?.result && b.match.result.toLowerCase() === (b.team || b.side)?.toLowerCase())
    .reduce((sum, b) => sum + (b.potentialWin || 0), 0);

  const totalLost = history
    .filter((b) => b.match?.result && b.match.result.toLowerCase() !== (b.team || b.side)?.toLowerCase())
    .reduce((sum, b) => sum + (b.stake || 0), 0);

  const net = totalWon - totalLost;

  /* ---------------------------------------------------------
   🕒 Loading & Empty States
  --------------------------------------------------------- */
  if (loading)
    return (
      <p className="text-center mt-6 text-gray-500 text-sm sm:text-base">
        Loading toss history...
      </p>
    );

  if (history.length === 0)
    return (
      <p className="text-center mt-6 text-gray-500 text-sm sm:text-base">
        No completed tosses yet.
      </p>
    );

  /* ---------------------------------------------------------
   🧭 Render Component
  --------------------------------------------------------- */
  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        Wallet History
      </h1>

      {/* 📊 Summary Bar */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-5 text-sm sm:text-base">
        <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg shadow-sm">
          Total Won: ₹{totalWon.toFixed(2)}
        </div>
        <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg shadow-sm">
          Total Lost: ₹{totalLost.toFixed(2)}
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg shadow-sm ${
            net >= 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          Net: ₹{net.toFixed(2)}
        </div>
      </div>

      {/* 🖥️ Desktop Table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Match</th>
              <th className="p-3 text-left">Your Team</th>
              <th className="p-3 text-left">Stake</th>
              <th className="p-3 text-left">Win / Loss</th>
              <th className="p-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            {history.map((bet) => {
              const team = bet.team || bet.side;
              const result = bet.match?.result;
              const isWin = result && result.toLowerCase() === team?.toLowerCase();

              return (
                <tr
                  key={bet._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800 whitespace-nowrap">
                    {bet.match?.title || "Match Deleted"}
                  </td>
                  <td className="p-3 text-blue-600 font-semibold whitespace-nowrap">
                    {team?.toUpperCase()}
                  </td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    ₹{bet.stake}
                  </td>
                  <td
                    className={`p-3 font-semibold whitespace-nowrap ${
                      isWin ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isWin
                      ? `+₹${bet.potentialWin}`
                      : `-₹${(bet.stake || 0).toFixed(2)}`}
                  </td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">
                    {result?.toUpperCase() || "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {history.map((bet) => {
          const team = bet.team || bet.side;
          const result = bet.match?.result;
          const isWin = result && result.toLowerCase() === team?.toLowerCase();

          return (
            <div
              key={bet._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
            >
              <h2 className="font-semibold text-gray-800 text-base mb-1">
                {bet.match?.title || "Match Deleted"}
              </h2>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Your Team:</span>{" "}
                  <span className="text-blue-600 font-semibold">
                    {team?.toUpperCase()}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Stake:</span> ₹{bet.stake}
                </p>
                <p>
                  <span className="font-medium">Result:</span>{" "}
                  {result?.toUpperCase() || "N/A"}
                </p>
                <p
                  className={`font-semibold ${
                    isWin ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isWin
                    ? `You Won ₹${bet.potentialWin}`
                    : `You Lost ₹${bet.stake}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
