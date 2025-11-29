"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myEntities, setMyEntities] = useState<any[]>([]);

  useEffect(() => {
    loadTournaments();
    loadMyEntities();
  }, []);

  const loadTournaments = async () => {
    const data = await apiFetch("/tournaments");
    setTournaments(data);
  };

  const loadMyEntities = async () => {
    try {
      const data = await apiFetch("/entities/my");
      setMyEntities(data);
    } catch (e) {}
  };

  const createTournament = async () => {
    await apiFetch("/tournaments", {
      method: "POST",
      body: JSON.stringify({ title: "Math Championship " + Date.now(), type: "math" }),
    });
    loadTournaments();
  };

  const startMatch = async (tournamentId: string) => {
    if (myEntities.length < 2) return alert("Need at least 2 entities to start a match");
    
    // Create Match
    const match = await apiFetch(`/tournaments/${tournamentId}/matches`, {
      method: "POST",
      body: JSON.stringify({ participants: [myEntities[0].id, myEntities[1].id] }),
    });

    // Run Match
    await apiFetch(`/tournaments/matches/${match.id}/run`, { method: "POST" });
    
    loadTournaments();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        <button onClick={createTournament} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700">
          Create Tournament
        </button>
      </div>

      <div className="space-y-6">
        {tournaments.map((t) => (
          <div key={t.id} className="p-6 bg-surface rounded-xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{t.title}</h3>
                <p className="text-sm text-gray-400">Type: {t.type} • Status: {t.status}</p>
              </div>
              <button 
                onClick={() => startMatch(t.id)}
                className="px-3 py-1 text-sm bg-blue-600/20 text-blue-400 border border-blue-600/50 rounded hover:bg-blue-600/30"
              >
                Start Demo Match
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-500">Matches</h4>
              {t.matches?.map((m: any) => (
                <div key={m.id} className="p-3 bg-background/50 rounded border border-gray-800 text-sm">
                  <div className="flex justify-between">
                    <span>{m.id.slice(0, 8)}...</span>
                    <span className={`px-2 rounded ${m.status === 'finished' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                      {m.status}
                    </span>
                  </div>
                  {m.result && (
                    <div className="mt-2 p-2 bg-black/30 rounded font-mono text-xs">
                      <p>Problem: {m.result.problem}</p>
                      <p>Winner: {m.result.winner || "None"}</p>
                    </div>
                  )}
                </div>
              ))}
              {(!t.matches || t.matches.length === 0) && <p className="text-sm text-gray-600">No matches yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
