"use client";

import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { agentActivityLog } from "@/lib/mock-data";

interface ChatMessage {
  id: string;
  from: "agent" | "user";
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "m1", from: "agent", text: "Hi — I can answer questions about your notes and courses. What would you like to know?" },
];

export default function AgentPage() {
  const { role } = useRole();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const canSeeActivityLog = role === "admin" || role === "lecturer";

  function sendMessage() {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { id: `u${Date.now()}`, from: "user", text: input };
    const reply: ChatMessage = {
      id: `a${Date.now()}`,
      from: "agent",
      text: "This is a mock response — the agent isn't wired up to a real model or your data yet.",
    };
    setMessages((prev) => [...prev, userMessage, reply]);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader title="Agent" description="Chat scoped to what you can access." />

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 min-h-64">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`text-body font-geist ${m.from === "agent" ? "text-ink" : "text-graphite"}`}
            >
              <span className="text-body-sm text-fog block mb-1">{m.from === "agent" ? "Agent" : "You"}</span>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask the agent something..."
            className="flex-1 bg-mist-gray rounded-inputs px-4 py-2 text-body font-geist outline-none"
          />
          <PrimaryButton onClick={sendMessage}>Send</PrimaryButton>
        </div>
      </Card>

      {canSeeActivityLog && (
        <div className="flex flex-col gap-3">
          <h2 className="text-subheading font-geist font-medium text-ink">Agent activity log</h2>
          {agentActivityLog.map((entry) => (
            <Card key={entry.id} density="compact">
              <div className="text-body text-ink font-geist">{entry.action}</div>
              <div className="text-body-sm text-fog mt-1">{entry.target} · {entry.at}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
