import { ChatMessage } from "../types";

export const geminiService = {
  async *chatStream(message: string, history: ChatMessage[] = [], systemInstruction?: string) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, history, systemInstruction }),
    });

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") return;
            try {
              const { text } = JSON.parse(data);
              yield text;
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
