"use client";

import { FormEvent, useState } from "react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || disabled) {
      return;
    }

    onSend(message);
    setInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white p-4"
    >
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask something..."
          disabled={disabled}
          className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
        />

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </form>
  );
}