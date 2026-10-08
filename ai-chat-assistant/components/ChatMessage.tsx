type MessageRole = "user" | "assistant";

type ChatMessageProps = {
  role: MessageRole;
  content: string;
};

export default function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`mb-4 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-black text-white"
            : "border bg-white text-gray-900"
        }`}
      >
        <div className="mb-1 text-xs font-medium opacity-60">
          {isUser ? "You" : "AI Assistant"}
        </div>

        <div className="whitespace-pre-wrap text-sm">
          {content}
        </div>
      </div>
    </div>
  );
}