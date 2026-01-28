
import React, { useState, useMemo } from 'react';
import { AppView, JewelleryConfig, Lead } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { MessageSquare, X, Gem } from 'lucide-react';

type SortKey = 'newest' | 'type' | 'metal' | 'price';

interface ExploreProps {
  designs: JewelleryConfig[];
  addLead: (lead: Lead) => void;
  setView: (view: AppView) => void;
  currency?: string;
}

const Explore: React.FC<ExploreProps> = ({ designs, addLead, setView, currency = 'ZAR' }) => {
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [enquiryDesign, setEnquiryDesign] = useState<JewelleryConfig | null>(null);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');

  const feed = useMemo(
    () => designs.filter(d => d.showInExplore !== false),
    [designs]
  );

  const sorted = useMemo(() => {
    const list = [...feed];
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        break;
      case 'type':
        list.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        break;
      case 'metal':
        list.sort((a, b) => (a.metal || '').localeCompare(b.metal || ''));
        break;
      case 'price':
        list.sort((a, b) => (a.priceZAR ?? 0) - (b.priceZAR ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [feed, sortBy]);

  const handleEnquireSubmit = () => {
    if (!enquiryDesign) return;
    const lead: Lead = {
      id: `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: enquiryName.trim() || 'Explore enquirer',
      email: enquiryEmail.trim() || '',
      phone: enquiryPhone.trim() || '',
      requestType: 'Explore',
      description: `Enquiry about design ${enquiryDesign.id}: ${[enquiryDesign.type, enquiryDesign.metal, enquiryDesign.shape, enquiryDesign.carat].filter(Boolean).join(' • ')}. ${enquiryMessage.trim()}`.trim(),
      date: new Date().toLocaleDateString(),
      status: 'New',
      linkedDesignId: enquiryDesign.id,
      source: 'Explore'
    };
    addLead(lead);
    setEnquiryDesign(null);
    setEnquiryName('');
    setEnquiryEmail('');
    setEnquiryPhone('');
    setEnquiryMessage('');
    setView('Chatbot');
  };

  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-current/10 pb-12">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Builder creations</p>
          <h1 className="text-5xl font-thin tracking-tighter uppercase">Explore</h1>
          <p className="text-[10px] opacity-68 max-w-lg">Pieces created in the builder. Enquire on any design to start your own.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] uppercase opacity-68">Sort</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="bg-transparent border border-current/20 pl-4 pr-8 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:border-current/40"
          >
            <option value="newest">Newest</option>
            <option value="type">Type</option>
            <option value="metal">Metal</option>
            <option value="price">Price</option>
          </select>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="text-center py-24">
          <Gem className="mx-auto opacity-30 mb-6" size={48} />
          <p className="opacity-60 uppercase tracking-widest text-[10px]">No designs in Explore yet.</p>
          <p className="text-[9px] opacity-50 mt-2 max-w-md mx-auto">Pieces created in the Builder will appear here so others can browse and enquire.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map(d => (
            <div key={d.id} className="glass border border-current/5 rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-square relative bg-black/20">
                <img
                  src={d.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 text-[8px] uppercase tracking-widest bg-black/60 px-2 py-1 rounded">{d.type}</span>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <p className="text-[9px] opacity-78 uppercase tracking-tight">
                  {[d.metal, d.shape, d.carat && `${d.carat} ct`, d.qualityTier].filter(Boolean).join(' • ')}
                </p>
                {d.stoneCategory && d.stoneCategory !== 'None' && (
                  <p className="text-[8px] opacity-60 mt-0.5">{d.stoneCategory}{d.stoneType && d.stoneType !== 'N/A' ? ` ${d.stoneType}` : ''}</p>
                )}
                {d.priceZAR != null && d.priceZAR > 0 && (
                  <p className="text-sm font-thin mt-2">{currency} {Math.round((d.priceZAR ?? 0) / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                )}
                <button
                  onClick={() => setEnquiryDesign(d)}
                  className="mt-4 w-full py-3 border border-current/20 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Enquire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {enquiryDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn" onClick={() => setEnquiryDesign(null)}>
          <div className="glass border border-white/10 rounded-sm p-8 max-w-md w-full space-y-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-[11px] uppercase tracking-widest font-bold">Enquire about this design</h3>
                <p className="text-[9px] opacity-68 mt-1">{enquiryDesign.type} • {enquiryDesign.metal} • {enquiryDesign.shape}{enquiryDesign.carat ? ` • ${enquiryDesign.carat} ct` : ''}</p>
              </div>
              <button onClick={() => setEnquiryDesign(null)} className="p-2 opacity-60 hover:opacity-100 flex-shrink-0"><X size={18}/></button>
            </div>
            <p className="text-[9px] opacity-68">We’ll get in touch to discuss this piece and next steps.</p>
            <input type="text" placeholder="Name" value={enquiryName} onChange={e => setEnquiryName(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <input type="email" placeholder="Email" value={enquiryEmail} onChange={e => setEnquiryEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <input type="tel" placeholder="Phone" value={enquiryPhone} onChange={e => setEnquiryPhone(e.target.value)} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30" />
            <textarea placeholder="Message (optional)" value={enquiryMessage} onChange={e => setEnquiryMessage(e.target.value)} rows={2} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] focus:outline-none focus:border-white/30 resize-none" />
            <button onClick={handleEnquireSubmit} className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200">
              Send enquiry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
