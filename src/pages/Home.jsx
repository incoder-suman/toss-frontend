import { useEffect, useState } from "react";
import api from "../api/axios"; // ✅ use your axios instance
import BetModal from "../components/BetModal";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null); // { match, team }

  // ✅ Fetch matches from backend
  const fetchMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data.matches || res.data);
    } catch (err) {
      console.error("❌ Error fetching matches:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Auto refresh every 15s
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, []);

  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const live = matches.filter((m) => m.status === "LIVE");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8 space-y-10">
      {/* ✅ LIVE MATCHES */}
      {live.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-6 text-center sm:text-left">
            🔴 Live Matches
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {live.map((m) => {
              const [teamA, teamB] = m.title.split(" vs ");
              return (
                <div
                  key={m._id}
                  className="bg-white border border-green-200 rounded-2xl shadow-md hover:shadow-lg transition p-5 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-green-700 mb-1 text-center sm:text-left">
                      {teamA} vs {teamB}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-4 text-center sm:text-left">
                      Started: {new Date(m.startAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamA })}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                    >
                      Bet on {teamA}
                    </button>
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamB })}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
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

      {/* ✅ UPCOMING MATCHES */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-cyan-600 mb-6 text-center sm:text-left">
            🕒 Upcoming Matches
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcoming.map((m) => {
              const [teamA, teamB] = m.title.split(" vs ");
              return (
                <div
                  key={m._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow p-5 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1 text-center sm:text-left">
                    {teamA} vs {teamB}
                  </h3>
                  <p className="text-sm text-gray-600 text-center sm:text-left">
                    Toss Time:{" "}
                    <span className="font-medium">
                      {new Date(m.startAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500 italic text-center sm:text-left">
                    Coming soon...
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ✅ NO MATCHES */}
      {!loading && live.length === 0 && upcoming.length === 0 && (
        <p className="text-gray-500 text-center text-lg font-medium">
          No active or upcoming matches right now ⚡
        </p>
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
