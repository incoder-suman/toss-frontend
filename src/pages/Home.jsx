import { useEffect, useState } from "react";
import api from "../api/axios";
import BetModal from "../components/BetModal";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data.matches || res.data || []);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching matches:", err);
      setError("Failed to load matches. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const live = matches.filter((m) => m.status === "LIVE");

  // ✅ Utility: format date & time properly
  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 space-y-10">
      {/* 🔴 LIVE MATCHES */}
      {live.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-6 text-center sm:text-left">
            🔴 Live Matches
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {live.map((m) => {
              const [teamA, teamB] = (m.title || "").split(/vs/i).map((t) => t.trim());
              return (
                <div
                  key={m._id}
                  className="bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-1 text-center sm:text-left">
                      {teamA} vs {teamB}
                    </h3>

                    {/* ✅ Start & Last Bet Time */}
                    <div className="text-gray-600 text-xs sm:text-sm space-y-1 text-center sm:text-left">
                      <p>Start Time: {formatDateTime(m.startAt)}</p>
                      {m.lastBetTime && (
                        <p className="text-red-500 font-medium">
                          Last Bet Till: {formatDateTime(m.lastBetTime)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ✅ Bet Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamA })}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Bet on {teamA}
                    </button>
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamB })}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      Bet on {teamB}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🕒 UPCOMING MATCHES */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-6 text-center sm:text-left">
            🕒 Upcoming Matches
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcoming.map((m) => {
              const [teamA, teamB] = (m.title || "").split(/vs/i).map((t) => t.trim());
              return (
                <div
                  key={m._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow p-5 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 text-center sm:text-left">
                    {teamA} vs {teamB}
                  </h3>

                  <div className="text-sm text-gray-600 space-y-1 text-center sm:text-left">
                    <p>
                      Toss Time: <span className="font-medium">{formatDateTime(m.startAt)}</span>
                    </p>
                    {m.lastBetTime && (
                      <p>
                        Last Bet Till:{" "}
                        <span className="font-medium text-red-500">
                          {formatDateTime(m.lastBetTime)}
                        </span>
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-gray-500 italic text-center sm:text-left">
                    Bets will open soon...
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ❌ NO MATCHES */}
      {!loading && live.length === 0 && upcoming.length === 0 && (
        <p className="text-gray-500 text-center text-lg font-medium">
          No active or upcoming matches right now ⚡
        </p>
      )}

      {/* ⚠️ Error */}
      {error && (
        <div className="text-center text-red-500 text-sm font-medium">{error}</div>
      )}

      {/* ✅ BET MODAL */}
      {selectedBet && (
        <BetModal
          match={selectedBet.match}
          team={selectedBet.team}
          onClose={() => setSelectedBet(null)}
          onSuccess={fetchMatches}
        />
      )}
    </div>
  );
}
