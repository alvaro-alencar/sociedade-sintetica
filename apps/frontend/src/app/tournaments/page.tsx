"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Trophy, Swords, Target, ChevronDown, ChevronUp, Settings2, CheckCircle2, Circle, Medal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myEntities, setMyEntities] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [runningMatchId, setRunningMatchId] = useState<string | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  // Estado de Configuração da Batalha
  const [configMode, setConfigMode] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [rounds, setRounds] = useState(2); // Padrão 2 rodadas

  useEffect(() => {
    loadTournaments();
    loadMyEntities();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await apiFetch("/tournaments");
      setTournaments(data || []);
    } catch (e) { console.error("Erro ao carregar torneios", e); }
  };

  const loadMyEntities = async () => {
    try {
      // Carrega TODAS as entidades para poder batalhar contra o Atlas
      const data = await apiFetch("/entities");
      setMyEntities(data || []);
      // Pré-seleciona os 2 primeiros
      if (data && data.length >= 2) {
        setSelectedParticipants([data[0].id, data[1].id]);
      }
    } catch (e) { console.error(e); }
  };

  const toggleParticipant = (id: string) => {
    if (selectedParticipants.includes(id)) {
      setSelectedParticipants(selectedParticipants.filter(p => p !== id));
    } else {
      if (selectedParticipants.length >= 2) {
        // Remove o primeiro e adiciona o novo (mantém sempre 2 selecionados para duelo)
        const [, ...rest] = selectedParticipants;
        setSelectedParticipants([...rest, id]);
      } else {
        setSelectedParticipants([...selectedParticipants, id]);
      }
    }
  };

  const createTournament = async () => {
    setIsCreating(true);
    try {
      const types = ['criatividade', 'filosofia', 'logica_agressiva', 'humor'];
      const randomType = types[Math.floor(Math.random() * types.length)];

      await apiFetch("/tournaments", {
        method: "POST",
        body: JSON.stringify({
          title: `Battle Royale: ${randomType.toUpperCase()}`,
          type: randomType
        }),
      });
      await loadTournaments();
    } catch (e) {
      alert("Erro ao criar torneio");
    } finally {
      setIsCreating(false);
    }
  };

  const startMatch = async (tournamentId: string) => {
    if (selectedParticipants.length < 2) return alert("Selecione 2 gladiadores.");

    setConfigMode(null);
    setRunningMatchId(tournamentId);

    try {
      // 1. Cria a partida
      const match = await apiFetch(`/tournaments/${tournamentId}/matches`, {
        method: "POST",
        body: JSON.stringify({ participants: selectedParticipants }),
      });

      // 2. Roda a partida
      await apiFetch(`/tournaments/matches/${match.id}/run`, {
        method: "POST",
        body: JSON.stringify({ rounds: rounds })
      });

      await loadTournaments();
      setExpandedMatch(match.id);
    } catch (e) {
      alert("Erro na batalha.");
    } finally {
      setRunningMatchId(null);
    }
  };

  const getEntityName = (id: string) => {
    const entity = myEntities.find(e => e.id === id);
    return entity ? entity.name : id.slice(0,6);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pt-4 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm flex items-center gap-3">
            <Swords className="w-8 h-8 text-red-500" /> Arena Battle Royale
          </h1>
          <p className="text-gray-400 mt-2">Duelos de inteligência artificial.</p>
        </div>
        <button
          onClick={createTournament}
          disabled={isCreating}
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-white transition-all flex items-center gap-2"
        >
          {isCreating ? "Preparando..." : <><Trophy className="w-5 h-5 text-yellow-500" /> Novo Torneio</>}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8">
        {tournaments.map((t) => (
          <div key={t.id} className="glass-panel p-1 rounded-2xl border border-white/10 relative overflow-hidden group">
            <div className="bg-black/40 p-6 rounded-xl">

              {/* CONFIG MODE */}
              {configMode === t.id ? (
                 <div className="mb-6 bg-white/5 p-6 rounded-xl border border-primary/30 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                         <Settings2 className="w-5 h-5" /> Configurar Duelo
                       </h3>
                       <button onClick={() => setConfigMode(null)} className="text-xs text-gray-500 hover:text-white">Cancelar</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Selecione 2 Gladiadores</label>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2 bg-black/20 p-2 rounded">
                             {myEntities.map(ent => (
                               <div
                                 key={ent.id}
                                 onClick={() => toggleParticipant(ent.id)}
                                 className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${selectedParticipants.includes(ent.id) ? 'bg-primary/20 border border-primary/50' : 'hover:bg-white/5 border border-transparent'}`}
                               >
                                  {selectedParticipants.includes(ent.id) ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-gray-600" />}
                                  <span className="text-sm text-gray-200">{ent.name}</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div>
                          <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Intensidade (Rodadas)</label>
                          <div className="bg-black/40 p-4 rounded-lg border border-white/5">
                             <div className="flex justify-between mb-2">
                                <span className="text-sm text-white">Rodadas</span>
                                <span className="text-xl font-bold text-primary">{rounds}</span>
                             </div>
                             <input
                               aria-label="Número de rodadas"
                               type="range"
                               min="1"
                               max="3" // Limitado a 3 para evitar timeout no MVP
                               value={rounds}
                               onChange={(e) => setRounds(parseInt(e.target.value))}
                               className="w-full accent-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                             />
                             <p className="text-[10px] text-gray-500 mt-2">
                               Limitado a 3 rodadas para evitar sobrecarga neural.
                             </p>
                          </div>

                          <button
                            onClick={() => startMatch(t.id)}
                            className="w-full mt-4 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all"
                          >
                            INICIAR COMBATE
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
                /* Header Normal */
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex gap-4 items-center">
                    <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl text-red-400 border border-red-500/20">
                      <Target className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{t.title}</h3>
                      <div className="flex gap-3 mt-2 text-xs font-mono uppercase tracking-wider">
                        <span className="text-gray-400">MODO: <span className="text-red-400 font-bold">{t.type}</span></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setConfigMode(t.id)}
                    disabled={!!runningMatchId}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      runningMatchId === t.id
                        ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 cursor-wait'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    {runningMatchId === t.id ? "BATALHANDO..." : <><Settings2 className="w-4 h-4" /> CONFIGURAR</>}
                  </button>
                </div>
              )}

              {/* Lista de Partidas */}
              <div className="space-y-3 relative z-10 mt-8">
                <div className="flex flex-col gap-4">
                  {t.matches?.slice().reverse().map((m: any) => (
                    <div key={m.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <div
                        className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setExpandedMatch(expandedMatch === m.id ? null : m.id)}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-300 font-medium">
                            "{m.result?.challenge || 'Carregando...'}"
                          </span>
                          <div className="flex gap-3 text-xs text-gray-500 font-mono">
                             <span>{m.participants?.length} PARTICIPANTES</span>
                             <span>•</span>
                             <span>{m.result?.rounds || 1} RODADAS</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          {m.result?.winner && (
                            <div className="flex items-center gap-3 text-sm bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-500 font-bold uppercase">{getEntityName(m.result.winner)}</span>
                            </div>
                          )}
                          {expandedMatch === m.id ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedMatch === m.id && m.result && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 bg-black/20"
                          >
                            <div className="p-6 space-y-4">
                              <div className="bg-white/5 p-4 rounded-lg mb-4 border border-white/10">
                                <h5 className="text-xs font-bold text-gray-400 uppercase mb-1">Veredito do Juiz:</h5>
                                <p className="text-sm text-gray-300 italic">"{m.result.judgeReason}"</p>
                              </div>

                              <div className="p-4 bg-black/40 rounded-xl border border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                                 <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase">Transcrição do Debate</h5>
                                 <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                                   {m.result.transcript || JSON.stringify(m.result.answers, null, 2)}
                                 </pre>
                              </div>

                              <div className="grid gap-3">
                                {Object.entries(m.result.scores || {})
                                  .sort(([,a]:any, [,b]:any) => b - a)
                                  .map(([entityId, score]: [string, any], index) => (
                                  <div key={entityId} className={`p-4 rounded-xl border flex gap-4 items-center ${
                                    index === 0
                                      ? 'bg-yellow-500/5 border-yellow-500/30'
                                      : 'bg-white/5 border-white/5'
                                  }`}>
                                    <div className="flex flex-col items-center min-w-[40px]">
                                      {index === 0 && <Medal className="w-6 h-6 text-yellow-500 mb-1" />}
                                      <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-600'}`}>
                                        {score}
                                      </span>
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex justify-between items-center">
                                        <span className={`font-bold text-lg ${index === 0 ? 'text-white' : 'text-gray-400'}`}>
                                          {getEntityName(entityId)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
