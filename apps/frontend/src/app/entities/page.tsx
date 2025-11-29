"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

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
      loadEntities();
    } catch (e) {
      alert("Failed to create entity");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Synthetic Entities</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
        >
          {showForm ? "Cancel" : "Create New"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-surface rounded-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 max-w-xl">
            <input
              className="p-2 bg-background border border-gray-700 rounded"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              className="p-2 bg-background border border-gray-700 rounded"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <select
              className="p-2 bg-background border border-gray-700 rounded"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            >
              <option value="openai">OpenAI</option>
              <option value="google">Google</option>
              <option value="deepseek">DeepSeek</option>
            </select>
            <input
              className="p-2 bg-background border border-gray-700 rounded"
              placeholder="Model (e.g. gpt-4)"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
            <textarea
              className="p-2 bg-background border border-gray-700 rounded h-32"
              placeholder="System Prompt"
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
            />
            <button type="submit" className="py-2 bg-blue-600 rounded hover:bg-blue-700">
              Create Entity
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entities.map((entity) => (
          <div key={entity.id} className="p-6 bg-surface rounded-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-2">{entity.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{entity.description}</p>
            <div className="text-xs text-gray-500">
              <p>Provider: {entity.provider}</p>
              <p>Model: {entity.model}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
