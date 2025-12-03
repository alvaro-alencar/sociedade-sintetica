"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Trophy, Swords, Play, Target } from "lucide-react";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myEntities, setMyEntities] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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
    setIsCreating(true);
    await apiFetch("/tournaments", {
      method: "POST",
      body: JSON.stringify({ title: "Torneio Lógico #" + Math.floor(Math.random() * 1000), type: "math" }),
    });
    await loadTournaments();
    setIsCreating(false);
  };

  const startMatch = async (tournamentId: string) => {
    if (myEntities.length < 2) return alert("Você precisa de pelo menos 2 entidades para iniciar uma partida.");

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
    <div className="max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
            Arena de Torneios
          </h1>
          <p className="text-gray-400 mt-2">Competições de lógica e criatividade</p>
        </div>
        <button
          onClick={createTournament}
          disabled={isCreating}
          className="px-6 py-3 bg-gradient-to-r from-accent to-primary rounded-xl font-bold text-white hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
        >
          {isCreating ? "Criando..." : <><Trophy className="w-5 h-5" /> Novo Torneio</>}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.map((t) => (
          <div key={t.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-300 relative overflow-hidden group">
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent border border-accent/20">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{t.title}</h3>
                  <div className="flex gap-3 mt-1 text-xs font-mono uppercase tracking-wider">
                    <span className="text-gray-400">Tipo: <span className="text-white">{t.type}</span></span>
                    <span className={`px-2 rounded-full border ${t.status === 'active' ? 'border-green-500/50 text-green-400' : 'border-gray-600 text-gray-400'}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => startMatch(t.id)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors border border-white/10 flex items-center gap-2"
                title="Iniciar Partida Demo"
              >
                <Play className="w-4 h-4" /> Demo
              </button>
            </div>

            {/* Lista de Partidas */}
            <div className="space-y-2 relative z-10">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Partidas Recentes</h4>
              <div className="max-h-40 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {t.matches?.map((m: any) => (
                  <div key={m.id} className="p-3 bg-black/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-mono">{m.id.slice(0, 8)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${m.status === 'finished' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                        {m.status}
                      </span>
                    </div>
                    {m.result && (
                      <div className="text-xs space-y-1">
                        <div className="text-gray-400 line-clamp-1">Q: {m.result.challenge}</div>
                        <div className="flex justify-between text-gray-300 font-medium">
                          <span>Vencedor:</span>
                          <span className="text-accent">{
                            // Tenta achar o nome na lista de entities se possivel, senao mostra ID
                            m.result.winner ? (myEntities.find(e => e.id === m.result.winner)?.name || "IA " + m.result.winner.slice(0,4)) : "Nenhum"
                          }</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {(!t.matches || t.matches.length === 0) && (
                  <p className="text-sm text-gray-600 italic p-2">Nenhuma partida registrada.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
