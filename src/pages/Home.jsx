import { useEffect, useState } from "react";
import axios from "axios";
import BetModal from "../components/BetModal";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null); // { match, team }

  const fetchMatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/matches");
      setMatches(res.data.matches || res.data);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, []);

  const upcoming = matches.filter((m) => m.status === "UPCOMING");
  const live = matches.filter((m) => m.status === "LIVE");

  return (
    <div className="p-6 space-y-10">
      {/* ✅ LIVE MATCHES */}
      {live.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-green-600 mb-6">
            Live Matches
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {live.map((m) => {
              const [teamA, teamB] = m.title.split(" vs ");
              return (
                <div
                  key={m._id}
                  className="bg-white border border-green-200 rounded-xl shadow-md p-5"
                >
                  <h3 className="text-lg font-semibold text-green-700 mb-1">
                    {teamA} vs {teamB}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Started: {new Date(m.startAt).toLocaleString()}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamA })}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Bet on {teamA}
                    </button>
                    <button
                      onClick={() => setSelectedBet({ match: m, team: teamB })}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-md text-sm font-medium"
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
          <h2 className="text-3xl font-bold text-cyan-600 mb-6">
            Upcoming Matches
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {upcoming.map((m) => {
              const [teamA, teamB] = m.title.split(" vs ");
              return (
                <div
                  key={m._id}
                  className="bg-white border rounded-xl shadow p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {teamA} vs {teamB}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Toss Time:{" "}
                    <span className="font-medium">
                      {new Date(m.startAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Coming soon...
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading && live.length === 0 && upcoming.length === 0 && (
        <p className="text-gray-500 text-center text-lg">
          No active or upcoming matches right now.
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
