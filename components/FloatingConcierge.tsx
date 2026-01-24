
import React, { useState } from 'react';
import { MessageSquare, X, ArrowRight } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  onNavigate: (view: AppView) => void;
}

const FloatingConcierge: React.FC<Props> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-4 animate-fadeIn pointer-events-none">
      {isOpen && (
        <div className="w-80 bg-[#121212] border border-white/10 rounded-sm shadow-2xl p-8 space-y-6 animate-fadeIn pointer-events-auto">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" 
                    className="w-full h-full object-cover" 
                    alt="Mia" 
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121212]"></div>
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-[0.3em] font-bold">Mia</h4>
                <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-medium">Online Now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-40 hover:opacity-100 transition-all">
              <X size={16} />
            </button>
          </div>

          <p className="text-xs font-light leading-relaxed opacity-60">
            "Your master configuration is awaiting refinement. How should we proceed?"
          </p>

          <div className="grid gap-2">
            <QuickLink label="Finish Builder" onClick={() => { onNavigate('RingBuilder'); setIsOpen(false); }} />
            <QuickLink label="Private Vault" onClick={() => { onNavigate('Portal'); setIsOpen(false); }} />
            <QuickLink label="Educational Hub" onClick={() => { onNavigate('Learn'); setIsOpen(false); }} />
          </div>

          <button 
            onClick={() => { onNavigate('Chatbot'); setIsOpen(false); }}
            className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            Open Private Chat <ArrowRight size={14} />
          </button>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

const QuickLink = ({ label, onClick }: any) => (
  <button onClick={onClick} className="text-[9px] uppercase tracking-widest font-bold p-3 border border-white/5 hover:bg-white/5 text-left transition-all w-full">
    {label}
  </button>
);

export default FloatingConcierge;
