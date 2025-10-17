import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function ChatbotRestaurant() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Bonjour ! Bienvenue à La Belle Assiette 🍽️. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMsg = { sender: "bot", text: data.reply };

    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff3e0] via-[#ffe0b2] to-[#ffcc80] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* --- Logo et titre --- */}
      <div className="absolute top-10 text-center">
        <img
          src="/logo.png"
          alt="La Belle Assiette"
          className="w-24 mx-auto mb-3 drop-shadow-md"
        />
        <h1 className="text-3xl font-bold text-[#6b1b0f] font-serif">La Belle Assiette</h1>
        <p className="text-[#a6562b] italic text-lg">Cuisine française et méditerranéenne</p>
      </div>

      {/* --- Images décoratives --- */}
      <img
        src="/images/plat1.jpg"
        alt="Plat 1"
        className="absolute bottom-4 left-4 w-36 rounded-2xl shadow-lg opacity-90 border-4 border-white"
      />
      <img
        src="/images/plat2.jpg"
        alt="Plat 2"
        className="absolute bottom-4 right-4 w-36 rounded-2xl shadow-lg opacity-90 border-4 border-white"
      />

      {/* --- Chatbox principale --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl w-[400px] h-[500px] flex flex-col p-5 border border-[#e0b07e]"
      >
        {/* --- Messages --- */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-thin scrollbar-thumb-[#e8c39e] scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-[#f9e3c7] self-end text-right ml-auto text-[#5a2b00]"
                  : "bg-[#fff8ef] text-[#6b1b0f]"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* --- Zone d'entrée --- */}
        <div className="flex items-center bg-[#fff5eb] rounded-full shadow-inner p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Posez une question sur le menu..."
            className="flex-1 bg-transparent outline-none px-3 text-[#5a2b00]"
          />
          <button
            onClick={handleSend}
            className="bg-[#6b1b0f] hover:bg-[#8c2e18] text-white p-2 rounded-full"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
