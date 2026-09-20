import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Languages, HelpCircle, ShieldAlert, BookOpen, Volume2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  lang?: string;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: 'bot',
      text: "Namaste! I am your AI Disaster Safety & Emergency Response Assistant. How can I assist you with disaster preparation, first aid, shelter info, or government schemes today? You can type in English, Telugu (తెలుగు), or Hindi (हिंदी).",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: 'en'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'en' | 'te' | 'hi'>('en');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: selectedLang
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      // Call Express Gemini API endpoint
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, language: selectedLang })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply || "I am here to guide you during emergencies. Stay safe and move to higher ground if in flood risk zones.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error("Chat service unavailable");
      }
    } catch (err) {
      // Fallback local response generator if server endpoint unavailable
      let replyText = "";
      const q = userText.toLowerCase();

      if (selectedLang === 'te') {
        if (q.includes("వరద") || q.includes("flood")) {
          replyText = "వరద సమయంలో ఎత్తైన ప్రాంతాలకు వెళ్లండి. విద్యుత్ తీగలకు దూరంగా ఉండండి. అత్యవసర హెల్ప్‌లైన్: 112 లేదా 108 ని సంప్రదించండి.";
        } else if (q.includes("పథకం") || q.includes("scheme")) {
          replyText = "ప్రధాన మంత్రి ఫసల్ బీమా యోజన (PMFBY) మరియు స్టేట్ డిజాస్టర్ రెస్పాన్స్ ఫండ్ (SDRF) ద్వారా నష్టపరిహారం పొందవచ్చు.";
        } else {
          replyText = "సురక్షితంగా ఉండండి! అత్యవసర వివరాల కోసం 112 కు కాల్ చేయండి. పునరావాస కేంద్రాల వివరాలు నావిగేషన్ విభాగంలో చూడవచ్చు.";
        }
      } else if (selectedLang === 'hi') {
        if (q.includes("बाढ़") || q.includes("flood")) {
          replyText = "बाढ़ के समय ऊंचे स्थानों पर जाएं। बिजली के तारों और खंभों से दूर रहें। आपातकालीन हेल्पलाइन 112 या 108 डायल करें।";
        } else if (q.includes("योजना") || q.includes("scheme")) {
          replyText = "आप प्रधानमंत्री फसल बीमा योजना (PMFBY) और राज्य आपदा प्रतिक्रिया कोष (SDRF) के तहत मुआवजे का दावा कर सकते हैं।";
        } else {
          replyText = "नमस्ते! आपातकालीन सहायता के लिए 112 पर कॉल करें। नजदीकी राहत शिविरों की जानकारी ऐप में देखें।";
        }
      } else {
        if (q.includes("flood") || q.includes("water")) {
          replyText = "During floods: Move to higher floors or elevated shelters immediately. Avoid walking through moving water and keep emergency transceivers charged.";
        } else if (q.includes("scheme") || q.includes("compensation")) {
          replyText = "You can claim relief under PM Fasal Bima Yojana (PMFBY) for crops, and SDRF grants for residential property damage. Upload your photos in Damage Assessment.";
        } else if (q.includes("first aid") || q.includes("medical")) {
          replyText = "First Aid Steps: Clean wounds with antiseptic, apply pressure bandages for bleeding, keep burn areas cool and dry, and call 108 for emergency ambulance response.";
        } else {
          replyText = "I am monitor-synced with the AI-Based Disaster Prediction and Emergency Response Management System. I can help with safety checklists, shelter locations, weather explanations, and government relief schemes!";
        }
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    "What should I do during a severe flood warning?",
    "How do I apply for government disaster compensation?",
    "Where is the nearest safe emergency shelter?",
    "What are essential first aid steps for cyclone injuries?"
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[520px]" id="ai_chatbot_root">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-1.5">
              <span>AI DISASTER SAFETY CHATBOT</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Multilingual Emergency Assistant (English, Telugu, Hindi)
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-2 py-0.5 rounded transition ${selectedLang === 'en' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
          >
            EN
          </button>
          <button
            onClick={() => setSelectedLang('te')}
            className={`px-2 py-0.5 rounded transition ${selectedLang === 'te' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setSelectedLang('hi')}
            className={`px-2 py-0.5 rounded transition ${selectedLang === 'hi' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400'}`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center shrink-0 text-xs">
                🤖
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-xl p-3 text-xs font-mono leading-relaxed shadow-md ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              <p>{m.text}</p>
              <span className="text-[9px] text-slate-400 block mt-1 text-right">
                {m.timestamp}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">
                U
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 p-2 rounded-lg w-32 border border-slate-800">
            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>AI is typing...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="pt-2 pb-2 flex flex-wrap gap-1.5 border-t border-slate-800">
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => { setInputQuery(q); }}
            className="text-[10px] font-mono bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition text-left truncate max-w-[220px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Query Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            selectedLang === 'te' ? "అత్యవసర ప్రశ్నను టైప్ చేయండి..." :
            selectedLang === 'hi' ? "आपातकालीन प्रश्न पूछें..." :
            "Ask AI assistant about disaster prep, safety, schemes..."
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
}
