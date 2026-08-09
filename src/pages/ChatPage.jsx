import { useEffect, useRef } from "react";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ChatPage() {
  const { account, chatFriend, chatMessages, chatInput, setChatInput, chatLoading, sendMessage, goPage } = useApp();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  if (!account || !chatFriend) {
    return (
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-28">
        <div className="max-w-md mx-auto text-center py-16">
          <MessageCircle size={32} className="mx-auto c-text-text-2-50 mb-3" />
          <p className="c-text-text-2 text-sm mb-4">Open a chat from your Friends list.</p>
          <button onClick={() => goPage("friends")} className="text-sm font-700 text-[#3B82F6]">Go to Friends</button>
        </div>
      </section>
    );
  }

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendMessage();
  };

  return (
    <section className="max-w-5xl mx-auto px-6 pt-4 pb-6 flex flex-col" style={{ minHeight: "calc(100vh - 160px)" }}>
      <div className="max-w-md w-full mx-auto flex flex-col flex-1">
        <div className="flex items-center gap-3 pb-4 mb-2 border-b c-border-border-10">
          <button onClick={() => goPage("friends")} className="w-9 h-9 rounded-full flex items-center justify-center hv-surface2 transition c-text-text-1">
            <ArrowLeft size={18} />
          </button>
          <span className="w-10 h-10 rounded-full overflow-hidden flame-grad flex items-center justify-center text-white font-display font-700 flex-shrink-0">
            {chatFriend.profilePic ? (
              <img src={chatFriend.profilePic} alt="" className="w-full h-full object-cover" />
            ) : (
              (chatFriend.username || "?").charAt(0).toUpperCase()
            )}
          </span>
          <span className="font-display font-700 text-base c-text-text-1">{chatFriend.username}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 py-2">
          {chatLoading ? (
            <p className="text-center text-sm c-text-text-2 py-8">Loading messages…</p>
          ) : chatMessages.length === 0 ? (
            <p className="text-center text-sm c-text-text-2 py-8">Say hi to {chatFriend.username} 👋</p>
          ) : (
            chatMessages.map((m) => {
              const mine = m.sender_id === account.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                      mine ? "flame-grad text-white rounded-br-sm" : "card-surface border c-border-border-10 c-text-text-1 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 pt-3 mt-2 border-t c-border-border-10">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message"
            className="flex-1 c-bg-surface-solid border c-border-border-15 rounded-full px-4 py-3 text-sm outline-none focus:border-[#3B82F6]/60 placeholder:c-text-text-2-40 c-text-text-1"
          />
          <button onClick={handleSend} className="w-11 h-11 rounded-full flame-grad flex items-center justify-center text-white flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
