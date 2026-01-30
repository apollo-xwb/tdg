
import React, { useState, useMemo } from 'react';
import { AppView, CatalogProduct, Lead } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { MessageSquare, ChevronDown, X } from 'lucide-react';
import ProductModelViewer from './ProductModelViewer';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'type' | 'metal';

interface CollectionProps {
  catalogProducts: CatalogProduct[];
  addLead: (lead: Lead) => void;
  setView: (view: AppView) => void;
  currency?: string;
}

const Collection: React.FC<CollectionProps> = ({ catalogProducts, addLead, setView, currency = 'ZAR' }) => {
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [enquiryProduct, setEnquiryProduct] = useState<CatalogProduct | null>(null);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');

  const active = useMemo(() => catalogProducts.filter(p => p.isActive !== false), [catalogProducts]);

  const sorted = useMemo(() => {
    const list = [...active];
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        break;
      case 'price-asc':
        list.sort((a, b) => (a.priceZAR ?? 0) - (b.priceZAR ?? 0));
        break;
      case 'price-desc':
        list.sort((a, b) => (b.priceZAR ?? 0) - (a.priceZAR ?? 0));
        break;
      case 'type':
        list.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
        break;
      case 'metal':
        list.sort((a, b) => (a.metal || '').localeCompare(b.metal || ''));
        break;
      default:
        break;
    }
    return list;
  }, [active, sortBy]);

  const handleEnquireSubmit = () => {
    if (!enquiryProduct) return;
    const lead: Lead = {
      id: `COL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: enquiryName.trim() || 'Collection enquirer',
      email: enquiryEmail.trim() || '',
      phone: enquiryPhone.trim() || '',
      requestType: 'Collection Enquiry',
      description: `Enquiry about: ${enquiryProduct.title}. ${enquiryMessage.trim()}`.trim(),
      date: new Date().toLocaleDateString(),
      status: 'New',
      catalogProductId: enquiryProduct.id,
      source: 'Collection Enquiry'
    };
    addLead(lead);
    setEnquiryProduct(null);
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
          <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Curated designs</p>
          <h1 className="text-5xl font-thin tracking-tighter uppercase">Collection</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] uppercase opacity-68">Sort</span>
          <div className="relative group">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortKey)}
              className="appearance-none bg-transparent border border-current/20 pl-4 pr-8 py-2 text-[10px] uppercase tracking-widest focus:outline-none focus:border-current/40"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
              <option value="type">Type</option>
              <option value="metal">Metal</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
          </div>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="text-center py-24 opacity-60 uppercase tracking-widest text-[10px]">No designs in the collection yet. Check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map(p => (
            <div key={p.id} className="glass border border-current/5 rounded-sm overflow-hidden flex flex-col">
              <div className="aspect-square relative bg-black/20 min-h-[240px]">
                {p.modelUrl ? (
                  <ProductModelViewer src={p.modelUrl} alt={p.title} poster={p.imageUrls?.[0]} className="absolute inset-0 w-full h-full" />
                ) : (
                  <img
                    src={p.imageUrls?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-[11px] uppercase tracking-widest font-bold">{p.title}</h3>
                <p className="text-[9px] opacity-68 mt-1 line-clamp-2">{p.description || [p.type, p.metal, p.shape, p.stoneCategory].filter(Boolean).join(' • ')}</p>
                <p className="text-sm font-thin mt-4">{currency} {Math.round((p.priceZAR ?? 0) / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <button
                  onClick={() => setEnquiryProduct(p)}
                  className="mt-4 w-full py-3 border border-current/20 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Enquire on this design
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {enquiryProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn" onClick={() => setEnquiryProduct(null)}>
          <div className="glass border border-white/10 rounded-sm p-8 max-w-md w-full space-y-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="text-[11px] uppercase tracking-widest font-bold">Enquire: {enquiryProduct.title}</h3>
              <button onClick={() => setEnquiryProduct(null)} className="p-2 opacity-60 hover:opacity-100"><X size={18}/></button>
            </div>
            <p className="text-[9px] opacity-68">We’ll get in touch to discuss this design and next steps.</p>
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

export default Collection;
