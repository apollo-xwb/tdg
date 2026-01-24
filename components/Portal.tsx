
import React, { useState } from 'react';
import { UserState, AppView, OrderStatus, JewelleryConfig } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { Heart, Box, MessageSquare, Diamond, FileText, Video, CreditCard, ChevronDown, ChevronUp, Download, Share2, Eye, Edit3, Send, Shield } from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  'Quoted': '#888888', 'Approved': '#3B82F6', 'Deposit Paid': '#F59E0B', 'Sourcing Stone': '#A855F7',
  'In Production': '#6366F1', 'Final Polish': '#6366F1', 'Ready': '#10B981', 'Collected': '#14B8A6'
};

interface PortalProps {
  userState: UserState;
  setView: (view: AppView) => void;
  onNudge: (id: string) => void;
  onEditDesign: (design: JewelleryConfig) => void;
}

const Portal: React.FC<PortalProps> = ({ userState, setView, onNudge, onEditDesign }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleShare = async (design: JewelleryConfig) => {
    const text = `Take a look at this bespoke ${design.type} from The Diamond Guy. Ref: ${design.id}`;
    if (navigator.share) {
      await navigator.share({ title: 'My Bespoke Brief', text, url: window.location.href });
    } else {
      prompt("Copy to nudge your partner:", window.location.href);
    }
    onNudge(design.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-24 animate-fadeIn">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-current/10 pb-20">
        <div className="space-y-4">
           <p className="text-[11px] uppercase tracking-[0.5em] opacity-40">Secured Client Vault</p>
           <h1 className="text-7xl font-thin tracking-tighter uppercase">Your Profile</h1>
        </div>
        <div className="flex items-center gap-16">
           <Stat label="Saved Masterpieces" val={userState.recentDesigns.length} />
           <Stat label="Live Crafting" val={userState.recentDesigns.filter(d => d.isApproved).length} />
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-24">
        <div className="lg:col-span-2 space-y-16">
          <h2 className="text-[11px] uppercase tracking-[0.6em] opacity-60 flex items-center gap-4 border-b border-white/5 pb-8 font-bold"><Heart size={16} /> Saved Proposals</h2>
          <div className="space-y-10">
            {userState.recentDesigns.length === 0 && (
              <p className="text-center py-20 opacity-30 uppercase tracking-widest text-[10px]">No designs saved in your vault yet.</p>
            )}
            {userState.recentDesigns.map((design) => {
              const isExp = expandedId === design.id;
              const rate = EXCHANGE_RATES[userState.currency]?.rate || 1;
              return (
                <div key={design.id} className="glass rounded-sm border border-current/5 overflow-hidden transition-all duration-500">
                  <div className="p-10 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setExpandedId(isExp ? null : design.id)}>
                    <div className="flex gap-12 items-center">
                       <img src={design.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} className="w-20 h-20 object-cover rounded-sm border border-white/5 shadow-lg" />
                       <div>
                          <h4 className="text-[13px] uppercase tracking-[0.4em] font-bold flex items-center gap-4">
                            {design.id} <span className="text-[8px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: STATUS_COLORS[design.status] }}>{design.status}</span>
                          </h4>
                          <p className="text-[10px] opacity-40 tracking-widest mt-1 uppercase">{design.type} • {design.metal || 'Loose Gem'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                          <p className="text-xl font-thin">{userState.currency} {Math.round((design.priceZAR ?? 0) / (rate || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                       </div>
                       {isExp ? <ChevronUp size={16} className="opacity-40"/> : <ChevronDown size={16} className="opacity-40"/>}
                    </div>
                  </div>
                  {isExp && (
                    <div className="px-10 pb-10 space-y-10 animate-fadeIn border-t border-white/5 pt-10">
                      <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <h5 className="text-[10px] uppercase opacity-40 font-bold mb-4">Master Specs</h5>
                           <Row label="Stone Type" val={design.stoneType} />
                           <Row label="Shape" val={design.shape || 'N/A'} />
                           <Row label="Metal" val={design.metal || 'N/A'} />
                           <Row label="Quality" val={design.qualityTier} />
                           {(design.videoLink || design.certLink || design.paymentLink) && (
                             <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                               <h5 className="text-[10px] uppercase opacity-40 font-bold mb-4">Links & Resources</h5>
                               {design.videoLink && (
                                 <a href={design.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[10px] uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity">
                                   <Video size={14}/> View Video
                                 </a>
                               )}
                               {design.certLink && (
                                 <a href={design.certLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[10px] uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity">
                                   <FileText size={14}/> View Certificate
                                 </a>
                               )}
                               {design.paymentLink && (
                                 <a href={design.paymentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 font-bold">
                                   <CreditCard size={14}/> Pay 50% Deposit
                                 </a>
                               )}
                             </div>
                           )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <Btn icon={<Download size={14}/>} label="Quotation" onClick={() => alert("Re-exporting proposal...")} />
                           <Btn icon={<Send size={14}/>} label="Nudge Partner" onClick={() => handleShare(design)} />
                           <Btn icon={<Edit3 size={14}/>} label="Edit Design" onClick={() => onEditDesign(design)} />
                           <Btn icon={<MessageSquare size={14}/>} label="Ask Mia" onClick={() => setView('Chatbot')} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-16">
           <h2 className="text-[11px] uppercase tracking-[0.6em] opacity-60 flex items-center gap-4 border-b border-current/5 pb-8 font-bold"><Box size={16} /> Live Crafting</h2>
           {!userState.recentDesigns.length && <p className="opacity-20 text-[10px] uppercase tracking-widest italic text-center py-20">No active crafting projects.</p>}
           {userState.recentDesigns.find(d => d.isApproved) && <Active design={userState.recentDesigns.find(d => d.isApproved)!} setView={setView} />}
        </div>
      </section>
    </div>
  );
};

const Row = ({ label, val }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 text-[10px] uppercase tracking-widest">
    <span className="opacity-40 font-medium">{label}</span>
    <span className="font-bold">{val}</span>
  </div>
);

const Btn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-6 border border-white/5 hover:bg-white/5 transition-all text-center gap-2">
    {icon} <span className="text-[8px] uppercase tracking-widest font-bold opacity-60">{label}</span>
  </button>
);

const Active = ({ design, setView }: any) => (
  <div className="glass p-12 rounded-sm space-y-12 border border-emerald-500/10 shadow-2xl relative overflow-hidden">
     <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500/20"></div>
     <div className="flex justify-between items-center border-b border-white/5 pb-6">
        <span className="text-xs uppercase tracking-widest font-bold">{design.id}</span>
        <span className="text-[9px] uppercase tracking-widest bg-emerald-500 text-white px-2 py-1 rounded-sm">Crafting</span>
     </div>
     <div className="space-y-6">
        {['Approved', 'Deposit Paid', 'Sourcing Stone', 'In Production', 'Ready'].map(s => (
          <div key={s} className={`flex items-center gap-4 text-[10px] uppercase tracking-widest ${design.status === s ? 'font-bold' : 'opacity-20'}`}>
             <div className={`w-2 h-2 rounded-full ${design.status === s ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-white/10'}`}></div> {s}
          </div>
        ))}
     </div>
     <button onClick={() => setView('Chatbot')} className="w-full py-5 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-100 transition-all">Contact Mia</button>
  </div>
);

const Stat = ({ label, val }: any) => (
  <div className="text-right">
    <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-2 font-bold">{label}</p>
    <h5 className="text-5xl font-thin tracking-tighter">{val}</h5>
  </div>
);

export default Portal;
