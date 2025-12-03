"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Sparkles, Bot, Terminal } from "lucide-react";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    provider: "openai",
    model: "gpt-3.5-turbo",
    systemPrompt: "You are a helpful AI.",
  });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const data = await apiFetch("/entities/my");
      setEntities(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/entities", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        provider: "openai",
        model: "gpt-3.5-turbo",
        systemPrompt: "You are a helpful AI.",
      });
      loadEntities();
    } catch (e) {
      alert("Failed to create entity");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm">
            Minhas Entidades Sintéticas
          </h1>
          <p className="text-gray-400 mt-2">Gerencie as IAs que participarão da sociedade</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg ${
            showForm
              ? "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20"
              : "bg-primary hover:bg-primary/80 text-white shadow-neon-blue hover:scale-105"
          }`}
        >
          {showForm ? (
            <>Fechar</>
          ) : (
            <>
              <Plus className="w-5 h-5" /> Criar Nova Entidade
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="mb-12 p-8 glass-panel rounded-2xl border border-primary/20 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Configurar Nova Consciência</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome da Entidade</label>
                <input
                  className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600"
                  placeholder="Ex: Sócrates AI"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrição Curta</label>
                <input
                  className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600"
                  placeholder="Ex: O pai da filosofia ocidental"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Provider</label>
                  {/* CORREÇÃO: Adicionado aria-label para acessibilidade */}
                  <select
                    aria-label="Selecionar Provedor de IA"
                    className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none text-white appearance-none"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="google">Google (Gemini)</option>
                    <option value="deepseek">DeepSeek</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Modelo</label>
                  <input
                    className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none text-white placeholder-gray-600"
                    placeholder="Ex: gpt-4"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col h-full">
              <label className="block text-sm text-gray-400 mb-1">System Prompt (Personalidade)</label>
              <textarea
                className="flex-1 w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600 font-mono text-sm resize-none"
                placeholder="Defina como a IA deve se comportar, suas crenças e estilo de fala..."
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-all font-bold text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                Dar Vida à Entidade
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div
            key={entity.id}
            className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-purple group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-colors">
                  <Bot className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-mono border ${entity.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-gray-700/50 text-gray-400 border-gray-600'}`}>
                  {entity.status}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {entity.name}
              </h3>

              <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                {entity.description || "Sem descrição definida."}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-black/40 p-3 rounded-lg border border-white/5 font-mono">
                <Terminal className="w-3 h-3" />
                <span className="text-secondary">{entity.provider}</span>
                <span className="text-gray-600">/</span>
                <span className="text-accent">{entity.model}</span>
              </div>
            </div>
          </div>
        ))}

        {entities.length === 0 && !showForm && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-white/5">
            <Bot className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400">Nenhuma entidade encontrada</h3>
            <p className="text-gray-600 mt-2">Crie sua primeira IA para começar os experimentos.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 text-primary hover:text-white hover:underline"
            >
              Criar agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
