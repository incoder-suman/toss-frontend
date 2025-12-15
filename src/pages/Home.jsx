import { useEffect, useState } from "react";
import api from "../api/axios";
import BetModal from "../components/BetModal";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔁 Fetch matches
  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data.matches || res.data || []);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching matches:", err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  // 👤 Fetch user bets
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

  // 🕒 Helper for date format
  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const now = new Date();

  /* -------------------------------------------------------
   ✅ Active matches (only future or ongoing ones)
  ------------------------------------------------------- */
  const activeMatches = matches.filter(
    (m) => !m.lastBetTime || new Date(m.lastBetTime) > now
  );

  /* -------------------------------------------------------
   ✅ Sort by earliest closing time (ascending)
   (so 7:25pm appears above 8:25pm, 9:25pm, etc.)
  ------------------------------------------------------- */
  activeMatches.sort((a, b) => {
    const aTime = new Date(a.lastBetTime || 0);
    const bTime = new Date(b.lastBetTime || 0);
    return aTime - bTime;
  });

  const live = activeMatches.filter((m) => m.status === "LIVE");
  const upcoming = activeMatches.filter((m) => m.status === "UPCOMING");

  // ✅ Find user’s bet for a match
  const getUserBet = (matchId) =>
    userBets.find((b) => b.match && b.match._id === matchId) || null;

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
              const deadline = new Date(m.lastBetTime);
              const expired = m.lastBetTime && deadline <= now;

              return (
                <div
                  key={m._id}
                  className="bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-lg transition-all p-5 flex flex-col justify-between"
                >
                  {/* ✅ Match title block */}
  <div className="w-full flex flex-col items-center text-center">
    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-2">
      {teamA} V/S {teamB}
    </h3>

    {m.lastBetTime && (
      <p className="text-sm text-red-500 font-medium">
        Last Bet Till: {formatDateTime(m.lastBetTime)}
      </p>
    )}

    <p className="mt-2 text-gray-900 font-semibold">
      Toss Rate 98p
    </p>
  </div>

                  {/* 🧩 Match content */}
                  {!expired ? (
                    myBet ? (
                      // ✅ Already bet placed
                      <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center space-y-2">
                        <p className="text-sm font-medium text-green-700">
                          {(() => {
                            const matchBets = userBets.filter(
                              (b) => b.match && b.match._id === m._id
                            );
                            const totalStake = matchBets.reduce(
                              (sum, b) => sum + (b.stake || 0),
                              0
                            );
                            const lastTeam =
                              matchBets[matchBets.length - 1]?.team || myBet.team;
                            return (
                              <>
                                ✅ You bet ₹{totalStake} on{" "}
                                <span className="font-semibold">{lastTeam}</span>
                              </>
                            );
                          })()}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() =>
                              setSelectedBet({ match: m, team: myBet.team })
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                          >
                            Bet More
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm("Cancel this bet?")) return;
                              try {
                                const res = await api.delete(`/bets/${myBet._id}`);
                                console.log("✅ Cancel bet response:", res.data);
                                setUserBets((prev) =>
                                  prev.filter((b) => b._id !== myBet._id)
                                );
                                await fetchMatches();
                                alert("✅ Bet cancelled & refunded successfully!");
                              } catch (err) {
                                console.error("❌ Cancel bet error:", err);
                                alert("Error cancelling bet. Please try again.");
                              }
                            }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                          >
                            Cancel Bet
                          </button>
                        </div>
                      </div>
                    ) : (
                      // 🟦 No bet yet
                      <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                          onClick={() =>
                            setSelectedBet({ match: m, team: teamA })
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Bet on {teamA}
                        </button>
                        <button
                          onClick={() =>
                            setSelectedBet({ match: m, team: teamB })
                          }
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Bet on {teamB}
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="mt-4 text-xs text-gray-400 italic text-center">
                      ⏰ Betting closed
                    </p>
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
            fetchUserBets();
            fetchMatches();
          }}
        />
      )}
    </div>
  );
}
