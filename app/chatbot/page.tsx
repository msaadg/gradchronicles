'use client';
import { useState } from "react";
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Send, Search, FileText, Compass, BookOpen } from "lucide-react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MOCK_MESSAGES = [
  {
    sender: "user",
    text: "What are the main topics covered in CS101 midterm?",
    time: "2 hours ago"
  },
  {
    sender: "bot",
    text: "The midterm covers topics like data structures, recursion, and sorting algorithms.",
    time: "2 hours ago",
    source: {
      title: "CS101 Midterm Notes",
      description: "Recursion is an important concept in midterms. Here are some example questions..."
    }
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  
  const handleViewDoc = () => {
    router.push('/document/0d81d1ec-63d5-49ed-aba6-2074b35a8f8e');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-tr from-white via-[#f5f0ff] to-[#f6f6f7]">
      <Navbar isLoggedIn={true} />
      <main className="bg-[#fbf8f8] flex-grow flex items-center justify-center page-container pb-0 pt-12 px-6">
        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-card flex flex-col min-h-[560px] overflow-hidden animate-fade-in">
            <div className="flex-1 px-6 py-6 overflow-y-auto custom-scrollbar bg-white flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in gap-3`}>
                  {msg.sender === "bot" && (
                    <Image src="/chatbot.png" className="w-8 h-8 rounded-full mt-2" alt="Bot" 
                    width={300}
                    height={300}/>
                  )}
                  <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2">
                      {msg.sender === "user" && (
                        <Image src="/avatar1.png" className="w-8 h-8 rounded-full order-2" alt="User"
                        width={300}
                        height={300} />
                      )}
                      <span className={`font-semibold text-sm ${msg.sender === "bot" ? "text-black" : "text-black"}`}>
                        {msg.sender === "user" ? "You" : "Chatbot"}
                      </span>
                      <span className="text-xs text-brand-purple">{msg.time}</span>
                    </div>
                    <div className={`mt-1 rounded-xl px-5 py-3 text-base ${msg.sender === "user" 
                      ? "bg-brand-purple text-white shadow-lg"
                      : "bg-white text-gray-900 border border-gray-200 shadow"}`}>
                      <div className="text-sm">{msg.text}</div>
                    </div>
                    {msg.sender === "bot" && msg.source && (
                      <div className="mt-2 w-full">
                        <div className="mt-4 text-xs font-semibold text-brand-purple">SHOW SOURCES</div>
                        <div className="text-sm text-black mt-1">{msg.source.title}</div>
                        <div className="text-xs text-black mt-1">{msg.source.description}</div>
                        <button
                            onClick={handleViewDoc}
                            className="mt-2 flex items-center gap-1 bg-brand-purple text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-purple-dark transition">
                            <BookOpen className="w-4 h-4" /> View Document
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start animate-pulse mt-2 gap-3">
                  <Image src="/lovable-uploads/1b34b279-e8d9-4525-b7b6-54954be60966.png" className="w-8 h-8 rounded-full" alt="Bot" />
                  <div className="bg-gray-200 rounded-xl px-5 py-3 text-brand-purple">Chatbot is typing...</div>
                </div>
              )}
            </div>
            <form
              className="flex gap-3 items-end p-6 border-t border-gray-100 bg-[#faf9fb]"
              onSubmit={e => {
                e.preventDefault();
                if (input.trim()) {
                  setMessages([...messages, { sender: "user", text: input, time: "now" }]);
                  setInput("");
                  setIsTyping(true);
                  setTimeout(() => setIsTyping(false), 1200);
                }
              }}
            >
              <input
                placeholder="Ask a question about your course..."
                className="flex-1 bg-[#f7f7f8] border border-gray-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 text-base"
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
              />
              <button
                className="flex items-center gap-2 bg-brand-purple text-white px-5 py-3 font-semibold rounded-full shadow hover:bg-brand-purple-dark transition"
                type="submit"
                disabled={!input.trim()}
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <aside className="w-full lg:w-[30%] flex flex-col gap-6">
          <h3 className="text-2xl font-bold text-black">How Can I Help You?</h3>
            <div className="flex flex-col gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 shadow-sm flex flex-col">
                <div className="flex items-center gap-3">
                  <Search className="w-6 h-6 text-brand-purple" />
                  <div className="font-semibold text-base text-black">Find Relevant Documents</div>
                </div>
                <div className="text-black text-sm mt-2">
                  Ask questions, and I will find the most relevant documents for you.
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 shadow-sm flex flex-col">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-brand-purple" />
                  <div className="font-semibold text-base text-black">Get Instant Answers</div>
                </div>
                <div className="text-black text-sm mt-2">
                  I’ll provide quick answers based on uploaded course materials.
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 shadow-sm flex flex-col">
                <div className="flex items-center gap-3">
                  <Compass className="w-6 h-6 text-brand-purple" />
                  <div className="font-semibold text-base text-black">Cite Sources</div>
                </div>
                <div className="text-black text-sm mt-2">
                  Every answer includes references to the documents I used.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chatbot;
