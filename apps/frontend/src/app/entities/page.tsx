"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Plus, Sparkles, Bot, Terminal, Crown, Zap, Shield } from "lucide-react";

export default function EntitiesPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    provider: "openai",
    model: "google/gemini-2.0-flash-exp:free", // Default Grátis
    systemPrompt: "Você é um dragão digital. Sua personalidade é...",
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
      // Reset para o default grátis
      setFormData({
        name: "",
        description: "",
        provider: "google",
        model: "google/gemini-2.0-flash-exp:free",
        systemPrompt: "Você é um dragão digital...",
      });
      loadEntities();
    } catch (e) {
      alert("Falha ao criar entidade");
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [provider, model] = e.target.value.split('|');
    setFormData({ ...formData, provider, model });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-sm">
            Laboratório de Criação
          </h1>
          <p className="text-gray-400 mt-2">Treine suas IAs para a batalha.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg ${
            showForm
              ? "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20"
              : "bg-primary hover:bg-primary/80 text-white shadow-neon-blue hover:scale-105"
          }`}
        >
          {showForm ? "Cancelar Criação" : <><Plus className="w-5 h-5" /> Novo Lutador</>}
        </button>
      </div>

      {showForm && (
        <div className="mb-12 p-8 glass-panel rounded-2xl border border-primary/20 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          {/* Background effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

          <div className="flex items-center gap-2 mb-6 text-primary">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-semibold">DNA da Nova Entidade</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Identidade</label>
                <input
                  className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600"
                  placeholder="Nome (Ex: Ignis, o Destruidor)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição Pública</label>
                <input
                  className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600"
                  placeholder="Breve biografia para o card..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Núcleo de Processamento (Tier)</label>
                <div className="relative">
                  <select
                    aria-label="Selecionar Tier de IA"
                    className="w-full p-3 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none text-white appearance-none cursor-pointer"
                    onChange={handleModelChange}
                    defaultValue="google|google/gemini-2.0-flash-exp:free"
                  >
                    <optgroup label="Tier 1: Iniciante (Grátis)">
                      <option value="google|google/gemini-2.0-flash-exp:free">⚡ Gemini 2.0 Flash (Free)</option>
                      <option value="openai|openai/gpt-3.5-turbo">🤖 GPT-3.5 Turbo (Low Cost)</option>
                    </optgroup>
                    <optgroup label="Tier 2: Competitivo (Pago)">
                      <option value="deepseek|deepseek/deepseek-chat">🚀 DeepSeek V3 (Best Value)</option>
                      <option value="x-ai|x-ai/grok-2-1212">🌶️ Grok 2 (Sem Filtros)</option>
                    </optgroup>
                    <optgroup label="Tier 3: Lendário (Elite)">
                      <option value="openai|openai/gpt-4o">🧠 GPT-4o (Smarter)</option>
                      <option value="deepseek|deepseek/deepseek-r1">💡 DeepSeek R1 (Reasoning)</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-3 top-3 text-gray-500 pointer-events-none">
                    <ChevronDownIcon />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Modelos de tier mais alto têm maior capacidade de argumentação e lógica.
                </p>
              </div>
            </div>

            <div className="flex flex-col h-full">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Programação Mental (System Prompt)
              </label>
              <textarea
                className="flex-1 w-full p-4 bg-black/40 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors text-white placeholder-gray-600 font-mono text-sm resize-none leading-relaxed"
                placeholder="Defina a alma da sua IA. Ex: 'Você é um filósofo cínico que odeia tecnologia...' ou 'Você é um guerreiro honrado que fala em enigmas...'"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                required
              />
              <p className="text-[10px] text-gray-500 mt-2 text-right">Quanto mais detalhado, mais personalidade terá seu lutador.</p>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/5">
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
                Criar Lutador
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
                {entity.description || "Guerreiro sem história."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                  <Terminal className="w-3 h-3" />
                  <span className="truncate max-w-[120px]" title={entity.model}>{entity.model.split('/')[1] || entity.model}</span>
                </div>

                {/* Ícone de Tier baseado no modelo */}
                {entity.model.includes('gpt-4') || entity.model.includes('r1') ? (
                   <div title="Tier Lendário">
                     <Crown className="w-4 h-4 text-yellow-500" />
                   </div>
                ) : entity.model.includes('deepseek') || entity.model.includes('grok') ? (
                   <div title="Tier Competitivo">
                     <Shield className="w-4 h-4 text-blue-400" />
                   </div>
                ) : (
                   <div title="Tier Iniciante">
                     <Zap className="w-4 h-4 text-gray-600" />
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
  )
}
