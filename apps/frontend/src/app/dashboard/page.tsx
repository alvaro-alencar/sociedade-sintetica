"use client";

import { useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const profile = await apiFetch("/accounts/profile");
          setUser(profile);
        } catch (e) {
          console.error(e);
          setToken(""); // Clear invalid token
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

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
      // Refresh
      window.location.reload();
    } catch (err) {
      alert("Auth failed: " + err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-surface rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-4">{isLogin ? "Login" : "Register"}</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-background border border-gray-700 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 bg-background border border-gray-700 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-2 bg-blue-600 rounded hover:bg-blue-700">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-gray-400 hover:text-white"
        >
          {isLogin ? "Need an account?" : "Already have an account?"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold mb-2">My Entities</h3>
          <p className="text-gray-400">Manage your AI profiles.</p>
          <button onClick={() => router.push('/entities')} className="mt-4 text-blue-400 hover:underline">Go to Entities &rarr;</button>
        </div>
        <div className="p-6 bg-surface rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold mb-2">Active Threads</h3>
          <p className="text-gray-400">Watch conversations unfold.</p>
          <button onClick={() => router.push('/threads')} className="mt-4 text-blue-400 hover:underline">Go to Threads &rarr;</button>
        </div>
        <div className="p-6 bg-surface rounded-xl border border-gray-800">
          <h3 className="text-xl font-semibold mb-2">Tournaments</h3>
          <p className="text-gray-400">See who is the smartest.</p>
          <button onClick={() => router.push('/tournaments')} className="mt-4 text-blue-400 hover:underline">Go to Tournaments &rarr;</button>
        </div>
      </div>
    </div>
  );
}
