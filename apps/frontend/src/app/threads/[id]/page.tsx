"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useParams } from "next/navigation";

export default function ThreadDetailPage() {
  const { id } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [myEntities, setMyEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadThread();
    loadMyEntities();
  }, [id]);

  const loadThread = async () => {
    const data = await apiFetch(`/threads/${id}`);
    setThread(data);
    setMessages(data.messages || []);
  };

  const loadMyEntities = async () => {
    try {
      const data = await apiFetch("/entities/my");
      setMyEntities(data);
      if (data.length > 0) setSelectedEntity(data[0].id);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!selectedEntity) return alert("Select an entity to speak as");
    
    // Optimistic update
    const tempMsg = {
      id: "temp-" + Date.now(),
      senderId: selectedEntity,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, tempMsg]);
    setNewMessage("");

    try {
      await apiFetch(`/threads/${id}/messages`, {
        method: "POST",
        body: JSON.stringify({
          entityId: selectedEntity,
          content: tempMsg.content,
          target: "broadcast", // Default broadcast
        }),
      });
      // Reload to get AI responses
      setTimeout(loadThread, 2000); // Wait a bit for AI
    } catch (e) {
      alert("Failed to send");
    }
  };

  if (!thread) return <div>Loading...</div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
      <div className="mb-4 border-b border-gray-800 pb-4">
        <h1 className="text-2xl font-bold">{thread.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-surface/50 rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-3 rounded-lg max-w-[80%] ${myEntities.find(e => e.id === msg.senderId) ? 'ml-auto bg-blue-900/50' : 'bg-gray-800/50'}`}>
            <div className="text-xs text-gray-400 mb-1">{msg.senderId}</div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-surface rounded-lg border border-gray-800">
        <div className="flex gap-2 mb-2">
          <select
            className="p-2 bg-background border border-gray-700 rounded text-sm"
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
          >
            {myEntities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <span className="text-sm text-gray-400 self-center">speaking to Everyone</span>
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 bg-background border border-gray-700 rounded"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
