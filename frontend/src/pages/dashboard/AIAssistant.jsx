import { useEffect, useMemo, useRef, useState } from "react";
import useToast from "../../hooks/useToast";
import chatService from "../../api/chatService";
import { setSeo } from "../../utils/seo";

const normalizeHistory = (history = []) =>
  history
    .slice()
    .reverse()
    .flatMap((entry) => [
      {
        id: `${entry._id || entry.chatId}-user`,
        role: "user",
        content: entry.prompt,
        createdAt: entry.createdAt,
      },
      {
        id: `${entry._id || entry.chatId}-assistant`,
        role: "assistant",
        content: entry.response,
        createdAt: entry.createdAt,
      },
    ]);

export default function AIAssistant() {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSeo({
      title: "AI Assistant | Smart City Jamshoro",
      description: "Ask the Smart City Jamshoro AI assistant about property, locations, buying and renting.",
    });

    let mounted = true;
    chatService
      .getHistory()
      .then((res) => {
        if (!mounted) return;
        const history = res.data?.data?.history || [];
        setMessages(normalizeHistory(history));
      })
      .catch(() => {
        if (mounted) setHistoryError(true);
      })
      .finally(() => mounted && setLoadingHistory(false));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const canSend = useMemo(() => {
    const length = input.trim().length;
    return !sending && length >= 1 && length <= 2000;
  }, [input, sending]);

  const handleSend = async (e) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || prompt.length > 2000 || sending) return;

    setMessages((prev) => [
      ...prev,
      { id: `local-user-${Date.now()}`, role: "user", content: prompt, createdAt: new Date().toISOString() },
    ]);
    setInput("");
    setSending(true);

    try {
      const res = await chatService.sendMessage(prompt);
      const data = res.data?.data;
      const responseText = data?.response;

      if (!responseText) throw new Error("The AI returned an empty response.");

      setMessages((prev) => [
        ...prev,
        {
          id: data?.chatId || `local-ai-${Date.now()}`,
          role: "assistant",
          content: responseText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      toast.error(err.friendlyMessage || "The AI assistant is unavailable right now.");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="scj-ai-page d-flex flex-column">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div>
          <span className="scj-eyebrow">Smart City Intelligence</span>
          <h1 className="h3 fw-bold mb-1">AI Assistant</h1>
          <p className="text-muted mb-0">Ask about properties, locations, buying, selling or renting.</p>
        </div>
        <span className="scj-ai-status"><span /> Gemini AI</span>
      </div>

      <div className="scj-card scj-ai-shell d-flex flex-column overflow-hidden">
        <div className="scj-ai-messages flex-grow-1 overflow-auto p-3 p-md-4" aria-live="polite">
          {loadingHistory ? (
            <div className="scj-ai-empty">
              <div className="spinner-border text-scj-primary" role="status" aria-label="Loading chat history" />
              <p className="text-muted mt-3 mb-0">Loading your conversation…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="scj-ai-empty">
              <div className="scj-ai-orb"><i className="bi bi-stars" /></div>
              <h2 className="h5 fw-bold mt-3">How can I help?</h2>
              <p className="text-muted mb-3">Try: “What should I consider before buying a plot in Jamshoro?”</p>
              {historyError && <small className="text-muted">No previous conversation could be loaded.</small>}
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {messages.map((message) => (
                <div key={message.id} className={`scj-ai-row ${message.role === "user" ? "is-user" : "is-assistant"}`}>
                  {message.role === "assistant" && <div className="scj-ai-avatar"><i className="bi bi-stars" /></div>}
                  <div className={`scj-ai-bubble ${message.role === "user" ? "user" : "assistant"}`}>
                    <div className="scj-ai-content">{message.content}</div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="scj-ai-row is-assistant">
                  <div className="scj-ai-avatar"><i className="bi bi-stars" /></div>
                  <div className="scj-ai-bubble assistant scj-ai-typing" aria-label="AI is typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="scj-ai-composer">
          <label htmlFor="ai-input" className="visually-hidden">Message the AI assistant</label>
          <textarea
            ref={inputRef}
            id="ai-input"
            rows="1"
            maxLength={2000}
            className="form-control scj-ai-input"
            placeholder="Ask about a property, plot, location or price range…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <div className="scj-ai-composer-bottom">
            <small className="text-muted">Enter to send · Shift + Enter for a new line · {input.length}/2000</small>
            <button type="submit" className="btn btn-scj-gold" disabled={!canSend} aria-label="Send message">
              {sending ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-send me-1" /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
