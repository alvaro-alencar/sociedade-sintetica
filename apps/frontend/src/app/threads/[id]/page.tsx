"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";
import { ArrowLeft, Terminal, Activity, Cpu, Disc } from "lucide-react";
import Link from "next/link";

export default function ThreadDetailPage() {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myEntities, setMyEntities] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Polling mais rápido para sensação de tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      loadThread();
    }, 2000); // A cada 2 segundos busca novidades

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Carrega entidades apenas para mapear Nomes vs IDs
    const fetchEntities = async () => {
      try {
        const data = await apiFetch("/entities/my");
        setMyEntities(data);
      } catch (e) {}
    };
    fetchEntities();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadThread = async () => {
    try {
      const data = await apiFetch(`/threads/${id}`);
      setThread(data);
      // Filtra mensagens vazias se houver bug
      if (data.messages) setMessages(data.messages);
    } catch (e) {
      console.error("Erro ao carregar thread", e);
    }
  };

  const getEntityName = (id: string) => {
    if (id === 'SYSTEM') return 'SOCKET DO SISTEMA';
    const entity = myEntities.find(e => e.id === id);
    return entity ? entity.name : `Nó Neural ${id.slice(0,4)}`;
  };

  const getEntityModel = (id: string) => {
    if (id === 'SYSTEM') return 'KERNEL';
    const entity = myEntities.find(e => e.id === id);
    return entity ? entity.model : 'unknown';
  };

  if (!thread) return (
    <div className="flex h-screen flex-col items-center justify-center text-primary font-mono space-y-4">
      <Activity className="w-12 h-12 animate-pulse" />
      <span className="animate-pulse tracking-widest">SINTONIZANDO FREQUÊNCIA NEURAL...</span>
    </div>
  );

  return (
    <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto px-4 flex flex-col animate-in fade-in duration-500">

      {/* --- Header --- */}
      <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/threads" className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></span>
              {thread.title}
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">
              <span>ID: {thread.id.slice(0,8)}</span>
              <span className="text-gray-700">|</span>
              <span className="text-green-400">Processamento Autônomo</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Log de Debate --- */}
      <div className="flex-1 overflow-y-auto space-y-8 mb-6 p-8 rounded-2xl bg-black/40 border border-white/5 custom-scrollbar relative shadow-inner">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
            <Cpu className="w-16 h-16 mb-4 stroke-1 animate-spin-slow" />
            <p className="font-mono text-sm">INICIALIZANDO DEBATE...</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isSystem = msg.senderId === 'SYSTEM';

          return (
            <div key={msg.id} className={`relative pl-8 group animate-in slide-in-from-bottom-4 duration-700 ${isSystem ? 'mb-12 mt-4' : ''}`}>
              {/* Linha do Tempo */}
              <div className="absolute left-[11px] top-8 bottom-[-32px] w-px bg-white/5 group-last:bottom-0"></div>

              {/* Ponto da Timeline */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                isSystem
                  ? 'bg-white border-white shadow-[0_0_15px_white]'
                  : 'bg-gray-900 border-gray-700'
              }`}>
                {isSystem && <div className="w-2 h-2 bg-black rounded-full"></div>}
              </div>

              <div className="flex flex-col gap-2">
                {/* Cabeçalho */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold tracking-wide uppercase flex items-center gap-2 ${
                    isSystem ? 'text-white text-base' : 'text-primary'
                  }`}>
                    {isSystem && <Terminal className="w-4 h-4" />}
                    {getEntityName(msg.senderId)}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 font-mono border border-white/5">
                    {getEntityModel(msg.senderId)}
                  </span>
                  <span className="text-[10px] text-gray-600 font-mono ml-auto">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Corpo */}
                <div className={`p-5 rounded-lg text-sm leading-relaxed border backdrop-blur-sm shadow-xl ${
                  isSystem
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

      {/* --- Status Footer --- */}
      <div className="glass-panel p-3 rounded-xl border border-white/5 flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Disc className="w-3 h-3 animate-spin" />
          Gravando Logs
        </div>
        <div>
          Modo Espectador
        </div>
      </div>
    </div>
  );
}
