import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Bets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
   🧭 Fetch My Bets
  --------------------------------------------------------- */
  const fetchBets = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const res = await api.get("/bets/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize: if backend returns nested
      const data = res.data?.bets || res.data || [];
      setBets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching bets:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();

    // 🔁 Auto refresh every 15 seconds for live updates
    const interval = setInterval(fetchBets, 15000);

    // 🛰️ Listen to BroadcastChannel (when result declared or wallet update)
    const bc = new BroadcastChannel("wallet_channel");
    bc.onmessage = (msg) => {
      if (msg.data === "update_wallet" || msg.data === "refresh_bets") {
        fetchBets();
      }
    };

    return () => {
      clearInterval(interval);
      bc.close();
    };
  }, []);

  /* ---------------------------------------------------------
   🧩 Conditional Rendering
  --------------------------------------------------------- */
  if (loading)
    return (
      <p className="text-center mt-8 text-gray-500 text-sm sm:text-base">
        Loading your bets...
      </p>
    );

  if (bets.length === 0)
    return (
      <p className="text-center mt-8 text-gray-500 text-sm sm:text-base">
        No bets placed yet.
      </p>
    );

  /* ---------------------------------------------------------
   🖥️ Desktop Table
  --------------------------------------------------------- */
  const renderStatus = (status) => {
    switch (status?.toUpperCase()) {
      case "WON":
        return <span className="text-green-600 font-semibold">WON ✅</span>;
      case "LOST":
        return <span className="text-red-600 font-semibold">LOST ❌</span>;
      case "REFUNDED":
        return <span className="text-yellow-600 font-semibold">REFUNDED ♻️</span>;
      case "PENDING":
      default:
        return <span className="text-gray-500 font-medium">PENDING</span>;
    }
  };

  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        My Bets
      </h1>

      {/* ✅ Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Match</th>
              <th className="p-3 text-left">Team</th>
              <th className="p-3 text-left">Stake</th>
              <th className="p-3 text-left">Potential Win</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => {
              const team = bet.team || bet.side || "—";
              const result = bet.match?.result?.toUpperCase() || "WAITING";
              const isWinner = result !== "PENDING" && result === team?.toUpperCase();

              return (
                <tr
                  key={bet._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-medium text-gray-800 whitespace-nowrap">
                    {bet.match?.title || "Match Deleted"}
                  </td>
                  <td className="p-3 font-semibold text-blue-600">{team}</td>
                  <td className="p-3 text-gray-700 whitespace-nowrap">₹{bet.stake}</td>
                  <td className="p-3 text-green-600 font-semibold whitespace-nowrap">
                    ₹{bet.potentialWin}
                  </td>
                  <td className="p-3">{renderStatus(bet.status)}</td>
                  <td className="p-3">
                    <span
                      className={`font-semibold ${
                        result === "DRAW"
                          ? "text-yellow-600"
                          : isWinner
                          ? "text-green-600"
                          : result === "WAITING"
                          ? "text-gray-500"
                          : "text-red-600"
                      }`}
                    >
                      {result}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {bets.map((bet) => {
          const team = bet.team || bet.side || "—";
          const result = bet.match?.result?.toUpperCase() || "WAITING";
          const isWinner = result !== "PENDING" && result === team?.toUpperCase();

          return (
            <div
              key={bet._id}
              className="bg-white shadow-sm rounded-xl p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-gray-800 text-base">
                  {bet.match?.title || "Match Deleted"}
                </h2>
                <span className="text-xs text-gray-500">
                  {new Date(bet.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap text-sm text-gray-600 mt-2">
                <div className="w-1/2 mb-1">
                  <span className="font-medium">Team:</span>{" "}
                  <span className="text-blue-600 font-semibold">{team}</span>
                </div>
                <div className="w-1/2 mb-1 text-right">
                  <span className="font-medium">Stake:</span> ₹{bet.stake}
                </div>
                <div className="w-1/2 mb-1">
                  <span className="font-medium">Potential:</span>{" "}
                  <span className="text-green-600 font-semibold">
                    ₹{bet.potentialWin}
                  </span>
                </div>
                <div className="w-1/2 mb-1 text-right">
                  <span className="font-medium">Status:</span>{" "}
                  {renderStatus(bet.status)}
                </div>
              </div>

              <div className="border-t mt-2 pt-2 flex justify-between text-sm">
                <span className="text-gray-600">Result:</span>
                <span
                  className={`font-semibold ${
                    result === "DRAW"
                      ? "text-yellow-600"
                      : isWinner
                      ? "text-green-600"
                      : result === "WAITING"
                      ? "text-gray-400"
                      : "text-red-600"
                  }`}
                >
                  {result}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
