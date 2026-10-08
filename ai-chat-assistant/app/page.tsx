"use client";

import { useState } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    // {
    //   role: "user",
    //   content: "Explain React Server Components",
    // },
    // {
    //   role: "assistant",
    //   content:
    //     "React Server Components allow components to render on the server and send the resulting UI to the client.",
    // },
  ]);

  async function handleSend(message: string) {
    const userMessage = {
      role: "user" as const,
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("Response body is missing");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantMessage = "";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        assistantMessage += chunk;

        setMessages((currentMessages) => {
          const updated = [...currentMessages];

          updated[updated.length - 1] = {
            role: "assistant",
            content: assistantMessage,
          };

          return updated;
        });
      }
    } catch (error) {
      console.error(error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">
            AI Engineering Assistant
          </h1>

          <p className="text-sm text-gray-500">
            Your AI learning project
          </p>
        </header>

        <section className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">
                Start a conversation...
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))
          )}
          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="rounded-2xl border bg-white px-4 py-3 text-sm text-gray-500">
                AI is thinking...
              </div>
            </div>
          )}
        </section>
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </main>
  );
}