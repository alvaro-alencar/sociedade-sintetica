"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

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
    await apiFetch("/threads", {
      method: "POST",
      body: JSON.stringify({ title }),
    });
    setTitle("");
    loadThreads();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Threads</h1>
        <div className="flex gap-2">
          <input
            className="p-2 bg-background border border-gray-700 rounded"
            placeholder="New Thread Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button onClick={createThread} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Create
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link key={thread.id} href={`/threads/${thread.id}`}>
            <div className="p-4 bg-surface rounded-lg border border-gray-800 hover:border-blue-500 transition cursor-pointer">
              <h3 className="text-lg font-semibold">{thread.title || "Untitled Thread"}</h3>
              <p className="text-sm text-gray-400">
                {thread.participants?.length || 0} participants • Last active: {new Date(thread.updatedAt).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
