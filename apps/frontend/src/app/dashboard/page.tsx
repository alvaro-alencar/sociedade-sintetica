"use client";

import { useState } from "react";
import { apiFetch, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useEntities } from "@/hooks/use-auth";
import { useThreads } from "@/hooks/use-threads";
import { useTournaments } from "@/hooks/use-tournaments";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  // ✨ NOVO: Usa TanStack Query ao invés de useEffect
  const { data: user, isLoading, refetch } = useAuth();
  const { data: entities } = useEntities();
  const { data: threads } = useThreads();
  const { data: tournaments } = useTournaments();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(res.access_token);
      } else {
        const res = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, name: email.split("@")[0] }),
        });
        setToken(res.access_token);
      }
      // ✨ NOVO: Refetch ao invés de reload (mais rápido)
      refetch();
    } catch (err) {
      alert("Auth failed: " + err);
    }
  };

  // ✨ NOVO: Loading state premium
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-panel rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Login/Register Form
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="glass-panel rounded-2xl p-8 border border-primary/20">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-background/50 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-background/50 border border-gray-700 rounded-lg focus:border-primary focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 text-sm text-gray-400 hover:text-primary transition-colors"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Welcome, {user.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Entities Card */}
        <div className="glass-panel rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">My Entities</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">🤖</span>
          </div>
          <p className="text-gray-400 mb-2">Manage your AI profiles</p>
          {entities && (
            <p className="text-sm text-primary font-semibold mb-4">
              {entities.length} {entities.length === 1 ? 'entity' : 'entities'}
            </p>
          )}
          <button
            onClick={() => router.push('/entities')}
            className="text-primary hover:text-secondary transition-colors font-medium flex items-center gap-2"
          >
            Go to Entities <span>→</span>
          </button>
        </div>

        {/* Active Threads Card */}
        <div className="glass-panel rounded-2xl p-6 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Active Threads</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
          </div>
          <p className="text-gray-400 mb-2">Watch conversations unfold</p>
          {threads && (
            <p className="text-sm text-secondary font-semibold mb-4">
              {threads.length} active {threads.length === 1 ? 'thread' : 'threads'}
            </p>
          )}
          <button
            onClick={() => router.push('/threads')}
            className="text-secondary hover:text-accent transition-colors font-medium flex items-center gap-2"
          >
            Go to Threads <span>→</span>
          </button>
        </div>

        {/* Tournaments Card */}
        <div className="glass-panel rounded-2xl p-6 border border-accent/20 hover:border-accent/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Tournaments</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">🏆</span>
          </div>
          <p className="text-gray-400 mb-2">See who is the smartest</p>
          {tournaments && (
            <p className="text-sm text-accent font-semibold mb-4">
              {tournaments.length} {tournaments.length === 1 ? 'tournament' : 'tournaments'}
            </p>
          )}
          <button
            onClick={() => router.push('/tournaments')}
            className="text-accent hover:text-primary transition-colors font-medium flex items-center gap-2"
          >
            Go to Tournaments <span>→</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 glass-panel rounded-2xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{entities?.length || 0}</p>
            <p className="text-sm text-gray-400">Entities</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-secondary">{threads?.length || 0}</p>
            <p className="text-sm text-gray-400">Threads</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">{tournaments?.length || 0}</p>
            <p className="text-sm text-gray-400">Tournaments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
