import { useEffect, useState } from "react";
import api from "../api/axios";
import BetModal from "../components/BetModal";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [error, setError] = useState("");

  /* ------------------------------------------
     Fetch Matches
  ------------------------------------------ */
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

  /* ------------------------------------------
     Fetch User Bets
  ------------------------------------------ */
  const fetchUserBets = async () => {
    try {
      const res = await api.get("/bets/my");
      setUserBets(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching user bets:", err);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchUserBets();
    const interval = setInterval(() => {
      fetchMatches();
      fetchUserBets();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  /* ------------------------------------------
     Helpers: time + formatting
  ------------------------------------------ */
  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // Parse date safely; return ms or null
  const parseMs = (d) => {
    if (!d) return null;
    const ms = new Date(d).getTime();
    return Number.isFinite(ms) ? ms : null;
  };

  const isBettingOpen = (m) => {
    const deadlineMs = parseMs(m.lastBetTime);
    if (deadlineMs === null) return true; // if invalid/missing, allow betting
    return deadlineMs > Date.now();
  };

  // Hide expired cards from the panel
  const activeMatches = matches.filter((m) => isBettingOpen(m));
  const live = activeMatches.filter((m) => m.status === "LIVE");
  const upcoming = activeMatches.filter((m) => m.status === "UPCOMING");

  /* ------------------------------------------
     Find user's bet for a match (supports both shapes)
  ------------------------------------------ */
  const getUserBet = (matchId) =>
    userBets.find((b) => b.match === matchId || b.match?._id === matchId) || null;

  /* ------------------------------------------
     Render
  ------------------------------------------ */
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
              const myBet = getUserBet(m._id);

              return (
                <div
                  key={m._id}
                  className="bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-2 text-center sm:text-left">
                      {teamA} vs {teamB}
                    </h3>

                    {m.lastBetTime && (
                      <p className="text-sm text-red-500 font-medium text-center sm:text-left">
                        Last Bet Till: {formatDateTime(m.lastBetTime)}
                      </p>
                    )}
                  </div>

                  {/* 🔁 Switch UI based on whether user has already bet */}
                  {myBet ? (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center space-y-2 transition-all hover:shadow-md">
                      <p className="text-sm font-medium text-green-700">
                        ✅ You bet ₹{myBet.stake} on{" "}
                        <span className="font-semibold">{myBet.side}</span>
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setSelectedBet({ match: m, team: myBet.side })}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          Bet More
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Cancel this bet?")) return;
                            await api.delete(`/bets/${myBet._id}`);
                            await fetchUserBets();
                            await fetchMatches();
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        >
                          Cancel Bet
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      {/* ✅ Buttons ALWAYS show while betting is open */}
                      {isBettingOpen(m) ? (
                        <>
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
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 italic text-center">
                          ⏰ Betting closed
                        </p>
                      )}
                    </div>
                  )}
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
                  <h3 className="font-semibold text-lg text-gray-800 mb-2 text-center sm:text-left">
                    {teamA} vs {teamB}
                  </h3>
                  {m.lastBetTime && (
                    <p className="text-sm text-red-500 font-medium text-center sm:text-left">
                      Last Bet Till: {formatDateTime(m.lastBetTime)}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-500 italic text-center sm:text-left">
                    Bets will open soon...
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && live.length === 0 && upcoming.length === 0 && (
        <p className="text-gray-500 text-center text-lg font-medium">
          No active or upcoming matches right now ⚡
        </p>
      )}

      {error && (
        <div className="text-center text-red-500 text-sm font-medium">{error}</div>
      )}

      {/* 🎯 Bet Modal */}
      {selectedBet && (
        <BetModal
          match={selectedBet.match}
          team={selectedBet.team}
          onClose={() => setSelectedBet(null)}
          onSuccess={() => {
            // instant UI refresh after placing a bet
            fetchUserBets();
            fetchMatches();
          }}
        />
      )}
    </div>
  );
}
