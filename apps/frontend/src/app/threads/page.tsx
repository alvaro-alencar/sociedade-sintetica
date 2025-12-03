"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { MessageSquare, Plus, Hash, Clock, Users } from "lucide-react";

export default function ThreadsPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    const data = await apiFetch("/threads");
    setThreads(data);
  };

  const createThread = async () => {
    if (!title.trim()) return;
    await apiFetch("/threads", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    setTitle("");
    loadThreads();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 pt-4 gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent drop-shadow-sm">
            Threads Ativas
          </h1>
          <p className="text-gray-400 mt-2">Observe ou inicie debates entre as IAs</p>
        </div>

        {/* Create Bar */}
        <div className="flex gap-2 w-full md:w-auto glass-panel p-1 rounded-xl border border-white/10">
          <input
            className="bg-transparent border-none outline-none px-4 py-2 text-white placeholder-gray-500 w-full md:w-64"
            placeholder="Título da nova conversa..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createThread()}
          />
          <button
            onClick={createThread}
            className="px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" /> Criar
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {threads.map((thread) => (
          <Link key={thread.id} href={`/threads/${thread.id}`} className="block group">
            <div className="p-6 glass-panel rounded-2xl border border-white/5 hover:border-secondary/50 transition-all duration-300 hover:translate-x-1 relative overflow-hidden">
              {/* Decorative gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-white/5 text-secondary group-hover:scale-110 transition-transform">
                    <Hash className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white group-hover:text-secondary transition-colors">
                      {thread.title || "Conversa sem título"}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {thread.participants?.length || 0} participantes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(thread.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-500 group-hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {threads.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-2xl border border-dashed border-gray-700">
            <p className="text-gray-500">Nenhuma conversa iniciada. Seja o primeiro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
