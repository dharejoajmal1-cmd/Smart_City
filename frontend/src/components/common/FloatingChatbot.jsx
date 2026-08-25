import { useEffect, useRef, useState } from "react";
import chatService from "../../api/chatService";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", content: "Assalam-o-Alaikum! I’m the Smart City Jamshoro property assistant. Ask me about plots, houses, apartments, prices or a site visit." },
  ]);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, sending]);

  const send = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || sending || prompt.length > 2000) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: prompt }]);
    setInput("");
    setSending(true);
    try {
      const res = await chatService.sendMessage(prompt);
      const text = res.data?.data?.response || "I’m sorry, I couldn’t generate a response right now.";
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: text }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: "assistant", content: error.friendlyMessage || "The AI assistant is temporarily unavailable." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {open && (
        <div className="scj-floating-chat scj-card shadow-lg">
          <div className="scj-floating-chat__header">
            <div className="d-flex align-items-center gap-2">
              <span className="scj-floating-chat__icon"><i className="bi bi-stars" /></span>
              <div><strong>Smart City AI</strong><small>Property Assistant</small></div>
            </div>
            <button className="btn btn-sm btn-link text-white p-1" onClick={() => setOpen(false)} aria-label="Close chatbot"><i className="bi bi-x-lg" /></button>
          </div>
          <div className="scj-floating-chat__messages">
            {messages.map((message) => (
              <div key={message.id} className={`scj-floating-chat__bubble ${message.role}`}>{message.content}</div>
            ))}
            {sending && <div className="scj-floating-chat__bubble assistant"><span className="scj-ai-typing"><span /><span /><span /></span></div>}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="p-2 border-top bg-white">
            <div className="input-group">
              <input value={input} maxLength={2000} onChange={(e) => setInput(e.target.value)} className="form-control" placeholder="Ask about properties…" aria-label="Chat message" />
              <button className="btn btn-scj-primary" disabled={sending || !input.trim()} aria-label="Send"><i className="bi bi-send" /></button>
            </div>
          </form>
        </div>
      )}
      <button type="button" className="scj-floating-chat__launcher" onClick={() => setOpen((v) => !v)} aria-label="Open Smart City AI assistant">
        <i className={`bi ${open ? "bi-x-lg" : "bi-stars"}`} />
      </button>
    </>
  );
}
