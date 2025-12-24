import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Api } from "../utils/API";
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
   let session = JSON.parse(localStorage.getItem('session'));


  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
        const res = await fetch(
        `${Api}/agent/chat`,
        {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.token}`
          },
          credentials: 'include',
          body: JSON.stringify({ question: input })
        }
      );
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer }
      ]);
    } catch(e) {
      console.log("Error communicating with AI agent:", e);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ I’m having trouble responding right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Agent Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-4 py-3 shadow-lg hover:bg-blue-700 z-50"
      >
        🤖 AI Coach
      </button>

      {/* Agent Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-6 bg-white shadow-2xl rounded-xl z-50 flex flex-col border"
          style={{ width: "360px", height: "320px" }}
        >
          {/* Header */}
          <div className="px-4 py-2 border-b font-semibold text-sm flex justify-between items-center">
            <span>AI Nutrition Agent</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 px-3 py-2 overflow-y-auto space-y-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] ${
                  m.role === "user" ? "ml-auto text-right" : ""
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => (
                          <strong className="block mt-2">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc ml-5 mt-1 space-y-1">
                            {children}
                          </ul>
                        )
                      }}
                    >
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 italic text-xs">
                Agent is thinking…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask your nutrition question..."
              className="flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
