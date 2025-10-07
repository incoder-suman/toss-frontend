import { useEffect, useState } from "react";
import { getMyBets } from "../services/bets"; // <-- make sure service is ready

export default function Bets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const data = await getMyBets();
        setBets(data);
      } catch (err) {
        console.error("Error fetching bets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, []);

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

  return (
    <div className="p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        My Bets
      </h1>

      {/* ✅ Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm sm:text-base">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Match</th>
              <th className="p-3 text-left">Side</th>
              <th className="p-3 text-left">Stake</th>
              <th className="p-3 text-left">Potential Win</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Result</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr
                key={bet._id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 font-medium text-gray-800 whitespace-nowrap">
                  {bet.match?.title || "Match Deleted"}
                </td>
                <td className="p-3">
                  <span className="font-semibold text-blue-600">
                    {bet.side?.toUpperCase()}
                  </span>
                </td>
                <td className="p-3 text-gray-700 whitespace-nowrap">
                  ₹{bet.stake}
                </td>
                <td className="p-3 text-green-600 font-semibold whitespace-nowrap">
                  ₹{bet.potentialWin}
                </td>
                <td className="p-3 capitalize text-gray-700">
                  {bet.status || "Pending"}
                </td>
                <td className="p-3">
                  {bet.match?.result ? (
                    <span
                      className={`${
                        bet.match.result === bet.side
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }`}
                    >
                      {bet.match.result.toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Waiting</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Mobile cards */}
      <div className="sm:hidden space-y-3">
        {bets.map((bet) => (
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
                <span className="font-medium">Side:</span>{" "}
                <span className="text-blue-600 font-semibold">
                  {bet.side?.toUpperCase()}
                </span>
              </div>
              <div className="w-1/2 mb-1 text-right">
                <span className="font-medium">Stake:</span>{" "}
                <span>₹{bet.stake}</span>
              </div>
              <div className="w-1/2 mb-1">
                <span className="font-medium">Potential Win:</span>{" "}
                <span className="text-green-600 font-semibold">
                  ₹{bet.potentialWin}
                </span>
              </div>
              <div className="w-1/2 mb-1 text-right">
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{bet.status || "Pending"}</span>
              </div>
            </div>

            <div className="border-t mt-2 pt-2 flex justify-between text-sm">
              <span className="text-gray-600">Result:</span>
              {bet.match?.result ? (
                <span
                  className={`${
                    bet.match.result === bet.side
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }`}
                >
                  {bet.match.result.toUpperCase()}
                </span>
              ) : (
                <span className="text-gray-400">Waiting</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
