
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, ChevronRight, Phone, MessageSquare, ArrowRight, ClipboardList } from 'lucide-react';
import { AppView, Lead } from '../types';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  action?: string;
}

const MIA_AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop";

const Chatbot: React.FC<{ onNavigate: (v: AppView) => void, onLeadSubmit: (lead: Lead) => void }> = ({ onNavigate, onLeadSubmit }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: "🌟 Welcome to The Diamond Guy. I am Mia, your personal jewellery concierge. How can I assist you today?",
      options: ['How does it work?', 'Learning Hub', 'Ring Builder', 'Custom Design Request', 'Manufacturing Status']
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', details: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleOption = (opt: string) => {
    if (!opt.trim()) return;
    const userMsg: Message = { sender: 'user', text: opt };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: Message;
      const lowerOpt = opt.toLowerCase();
      
      if (opt === 'How does it work?') {
        botResponse = {
          sender: 'bot',
          text: "The Diamond Guy process is seamless and secure:\n\n1. DESIGN: Use our builder or message us for a bespoke brief.\n2. QUOTATION: Receive a detailed technical valuation.\n3. SOURCING: We source certified GIA/EGI stones specifically for your piece.\n4. CASTING: Our master jewellers cast and hand-set your piece in Cape Town.\n5. COMPLETION: After 3-4 weeks, collect from our private vault or receive fully insured global delivery.",
          options: ['Start Ring Builder', 'Precious Metals Info', 'Main Menu']
        };
      } else if (opt === 'Custom Design Request') {
        setShowLeadForm(true);
        botResponse = {
          sender: 'bot',
          text: "I've opened a custom request form for you. Please provide your details so our design team can contact you for a private consultation."
        };
      } else if (lowerOpt.includes('metals') || opt === 'Precious Metals') {
        botResponse = {
          sender: 'bot',
          text: "We specialise in high-purity alloys. Platinum is our most requested for its density. Our 18k White Gold is rhodium-plated for ultimate mirror-shine. Which metal suits your style?",
          options: ['Platinum vs White Gold', 'Durability Info', 'Main Menu']
        };
      } else {
        switch(opt) {
          case 'Learning Hub':
            botResponse = { 
              sender: 'bot', 
              text: "Knowledge is the brilliance behind every great stone. What would you like to explore?",
              options: ['The 4Cs', 'Precious Metals', 'Pricing Strategy', 'Natural vs Lab']
            };
            break;
          case 'Main Menu':
            botResponse = {
              sender: 'bot', 
              text: "How else can Mia assist you today?",
              options: ['How does it work?', 'Learning Hub', 'Ring Builder', 'Custom Design Request']
            };
            break;
          default:
            botResponse = { 
              sender: 'bot', 
              text: "I've noted your request. Would you like to explore our design builder or read our buying guides?",
              options: ['Ring Builder', 'Guides & Resources', 'Main Menu']
            };
        }
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  const submitLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: `LEAD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      requestType: 'Custom Design',
      description: leadData.details,
      date: new Date().toLocaleDateString(),
      status: 'New'
    };
    onLeadSubmit(newLead);
    setShowLeadForm(false);
    setMessages(prev => [...prev, { sender: 'bot', text: `Thank you ${leadData.name}, your request has been logged in our CRM. One of our master jewellers will contact you shortly.`, options: ['Main Menu'] }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] flex flex-col px-6 py-12">
      {/* Header same as before */}
      <div className="flex-grow overflow-y-auto space-y-8 mb-8 pr-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            {/* Message bubble same as before */}
            <div className={`max-w-[85%] flex gap-5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/5">
                {m.sender === 'bot' ? <img src={MIA_AVATAR} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white flex items-center justify-center text-black"><User size={16} /></div>}
              </div>
              <div className="space-y-4">
                <div className={`p-6 rounded-sm text-sm font-light leading-relaxed border ${m.sender === 'bot' ? 'bg-white/[0.03] border-white/5 text-gray-300' : 'bg-white text-black border-transparent font-medium'}`}>
                   {m.text}
                </div>
                {m.options && (
                  <div className="flex flex-wrap gap-2">
                    {m.options.map(o => (
                      <button key={o} onClick={() => handleOption(o)} className="text-[9px] uppercase tracking-[0.2em] border border-white/10 px-4 py-2 hover:bg-white hover:text-black transition-all">
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {showLeadForm && (
          <div className="glass p-8 rounded-sm space-y-6 border border-emerald-500/20 animate-fadeIn ml-14 max-w-lg">
             <div className="flex items-center gap-3 mb-4">
                <ClipboardList className="text-emerald-500" size={18} />
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-bold">Custom Request Form</h4>
             </div>
             <form onSubmit={submitLead} className="space-y-4">
                <input required type="text" placeholder="Full Name" className="w-full bg-black/40 border border-white/10 p-3 text-xs focus:outline-none" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} />
                <input required type="tel" placeholder="Phone Number" className="w-full bg-black/40 border border-white/10 p-3 text-xs focus:outline-none" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} />
                <input required type="email" placeholder="Email Address" className="w-full bg-black/40 border border-white/10 p-3 text-xs focus:outline-none" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} />
                <textarea required placeholder="Briefly describe your bespoke vision..." rows={3} className="w-full bg-black/40 border border-white/10 p-3 text-xs focus:outline-none resize-none" value={leadData.details} onChange={e => setLeadData({...leadData, details: e.target.value})} />
                <button className="w-full py-4 bg-emerald-500 text-white text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-emerald-600 transition-all">
                  Submit to CRM Pipeline
                </button>
             </form>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="border border-white/10 bg-white/[0.02] p-2 flex gap-4 rounded-sm">
        <input 
          type="text" 
          placeholder="Type your query..."
          className="flex-grow bg-transparent border-none px-6 py-4 text-sm font-light focus:outline-none"
          onKeyDown={(e) => { if (e.key === 'Enter') { handleOption((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }}
        />
        <button className="bg-white text-black px-8 py-4"><Send size={18} /></button>
      </div>
    </div>
  );
};

export default Chatbot;
