"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { Send, Terminal, Activity, Cpu, Play, Pause, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
// ✅ IMPORTANTE: Usando os hooks padronizados do TanStack Query
import { useThread, useThreadMessages } from "@/hooks/use-threads";
import { useEntities } from "@/hooks/use-auth";

export default function ThreadDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado local apenas para UI interativa (inputs, loading de envio)
  const [selectedEntity, setSelectedEntity] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [isSending, setIsSending] = useState(false);

  // ✅ TANSTACK QUERY: Gerenciamento de estado e Polling automático (2s)
  const { data: thread, isLoading: isThreadLoading, refetch: refetchThread } = useThread(id);
  const { data: messages = [], isLoading: isMsgsLoading } = useThreadMessages(id);
  const { data: myEntities = [] } = useEntities();

  // Scroll automático inteligente (só quando novas mensagens chegarem)
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Seleciona a primeira entidade do usuário por padrão se nada estiver selecionado
  useEffect(() => {
    if (myEntities.length > 0 && !selectedEntity) {
      setSelectedEntity(myEntities[0].id);
    }
  }, [myEntities, selectedEntity]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Lógica de Pause/Resume simplificada
  const toggleSimulation = async () => {
    if (!thread) return;
    const newState = !thread.isSimulationActive;

    try {
      await apiFetch(`/threads/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: newState }),
      });
      // Força atualização imediata do cache
      refetchThread();
    } catch (e) {
      alert("Erro ao alterar status da simulação.");
    }
  };

  const injectTopic = async () => {
    if (!selectedEntity && myEntities.length === 0) return alert("Crie uma entidade primeiro.");
    if (!newTopic.trim()) return;

    setIsSending(true);
    const sender = selectedEntity || myEntities[0].id;

    try {
      await apiFetch(`/threads/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          entityId: sender,
          content: newTopic,
          target: "broadcast",
        }),
      });
      setNewTopic("");
      // Não precisamos recarregar manualmente, o polling do TanStack vai pegar a msg
    } catch (e) {
      alert("Erro na injeção neural.");
    } finally {
      setIsSending(false);
    }
  };

  const getEntityName = (senderId: string) => {
    if (senderId === 'SYSTEM') return 'SOCKET DO SISTEMA';
    // Tenta achar nas minhas entidades ou busca no cache geral (futuro: cache global de entities)
    const entity = myEntities.find((e: any) => e.id === senderId);
    return entity ? entity.name : `Nó Neural ${senderId.slice(0,4)}`;
  };

  const getEntityModel = (senderId: string) => {
    if (senderId === 'SYSTEM') return 'KERNEL';
    const entity = myEntities.find((e: any) => e.id === senderId);
    return entity ? entity.model : 'unknown';
  };

  // Loading State Elegante
  if (isThreadLoading) return (
    <div className="flex h-screen items-center justify-center text-primary font-mono animate-pulse">
      ESTABELECENDO LINK NEURAL...
    </div>
  );

  if (!thread) return <div className="text-center mt-20 text-red-500 font-mono">FALHA NO LINK: Thread não encontrada.</div>;

  const isPaused = !thread.isSimulationActive;

  return (
    <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto px-4 flex flex-col animate-in fade-in duration-500">

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/threads" className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className={`w-5 h-5 ${isPaused ? 'text-yellow-500' : 'text-green-500 animate-pulse'}`} />
              {thread.title}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
              <span>ID: {thread.id.slice(0,8)}</span>
              <span className="text-gray-700">|</span>
              <span className={isPaused ? 'text-yellow-500' : 'text-green-400'}>
                {isPaused ? 'STANDBY' : 'PROCESSAMENTO ATIVO'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleSimulation}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
            isPaused
              ? 'bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500/20'
              : 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20'
          }`}
        >
          {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
          {isPaused ? "RETOMAR" : "PAUSAR"}
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-8 mb-6 p-8 rounded-2xl bg-black/40 border border-white/5 custom-scrollbar relative shadow-inner">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
            <Cpu className="w-16 h-16 mb-4 stroke-1 animate-spin-slow" />
            <p className="font-mono text-sm">INICIALIZANDO DEBATE...</p>
          </div>
        )}

        {messages.map((msg: any) => {
          const isSystem = msg.senderId === 'SYSTEM';
          const isInjection = msg.metadata?.type === 'system_injection' || isSystem;

          return (
            <div key={msg.id} className={`relative pl-8 group animate-in slide-in-from-bottom-2 duration-500 ${isSystem ? 'mb-12 mt-4' : ''}`}>
              <div className="absolute left-[11px] top-8 bottom-[-32px] w-px bg-white/5 group-last:bottom-0"></div>

              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                isInjection
                  ? 'bg-white border-white shadow-[0_0_15px_white]'
                  : 'bg-gray-900 border-gray-700'
              }`}>
                {isInjection && <div className="w-2 h-2 bg-black rounded-full"></div>}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold tracking-wide uppercase flex items-center gap-2 ${
                    isInjection ? 'text-white text-base' : 'text-primary'
                  }`}>
                    {isSystem && <Terminal className="w-4 h-4" />}
                    {getEntityName(msg.senderId)}
                  </span>
                  {!isSystem && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono border border-white/5">
                        {getEntityModel(msg.senderId)}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600 font-mono ml-auto">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className={`p-5 rounded-lg text-sm leading-relaxed border backdrop-blur-sm shadow-xl ${
                  isInjection
                    ? 'bg-white/10 border-white/30 text-white font-medium'
                    : 'bg-black/40 border-white/5 text-gray-300'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel p-2 rounded-xl border border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
        <div className="flex items-center bg-black/60 rounded-lg px-2">
          <div className="flex items-center border-r border-white/10 pr-3 mr-3 py-3">
            <span className="text-[10px] font-mono text-gray-500 mr-2">PROXY:</span>
            <select
              aria-label="Selecionar Nó Proxy"
              className="bg-transparent text-xs text-primary font-bold uppercase outline-none cursor-pointer hover:text-white transition-colors max-w-[120px]"
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              title="Qual nó iniciará o processamento?"
            >
              {myEntities.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              className="w-full bg-transparent border-none text-white focus:outline-none font-mono text-sm py-3 pl-1 placeholder-gray-600"
              placeholder="Injetar novo tópico manual..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && injectTopic()}
              disabled={isSending || isPaused}
              autoComplete="off"
            />
          </div>

          <button
            onClick={injectTopic}
            disabled={isSending || isPaused}
            className={`ml-2 p-2 rounded-lg transition-all duration-200 ${
              newTopic.trim() && !isPaused && !isSending
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] hover:scale-105'
                : 'bg-white/5 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isSending ? <Zap className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
