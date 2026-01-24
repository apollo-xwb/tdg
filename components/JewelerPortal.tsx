
import React, { useState } from 'react';
import { UserState, JewelleryConfig, OrderStatus, Lead } from '../types';
import { Search, Edit3, Trash2, Phone, FileText, Plus, ChevronLeft, Save, X, Eye, Shield, Share2, Video, CreditCard } from 'lucide-react';
import { METAL_DATA, SETTING_DATA, SHAPE_DATA, QUALITY_TIERS, JEWELLERY_TYPES } from '../constants';

const STATUS_FLOW: OrderStatus[] = ['Quoted', 'Approved', 'Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'];

interface Props {
  userState: UserState;
  onUpdate: (designs: JewelleryConfig[]) => void;
  onLeadsUpdate: (leads: Lead[]) => void;
}

const JewelerPortal: React.FC<Props> = ({ userState, onUpdate, onLeadsUpdate }) => {
  const [tab, setTab] = useState<'Orders' | 'Leads' | 'NewQuote'>('Orders');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newQuote, setNewQuote] = useState<Partial<JewelleryConfig>>({
    id: `TDG-M-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    type: 'Engagement Ring', stoneType: 'Natural', metal: 'Platinum', shape: 'Round', carat: 1.0, qualityTier: 'Balance Size & Quality', status: 'Quoted', isApproved: false, date: new Date().toLocaleDateString()
  });

  const handleUpdate = (id: string, updates: Partial<JewelleryConfig>) => {
    const next = userState.recentDesigns.map(d => d.id === id ? { ...d, ...updates } : d);
    onUpdate(next);
  };

  const sendQuotationEmail = (design: JewelleryConfig) => {
    const subject = encodeURIComponent(`Bespoke Proposal ${design.id} - The Diamond Guy`);
    const body = encodeURIComponent(getQuotationEmailTemplate(design));
    window.location.href = `mailto:${design.email}?subject=${subject}&body=${body}`;
  };

  const sendPaymentLinkEmail = (design: JewelleryConfig) => {
    if (!design.paymentLink) {
      alert('Payment link is required');
      return;
    }
    const subject = encodeURIComponent(`Payment Link for ${design.id} - The Diamond Guy`);
    const body = encodeURIComponent(getPaymentLinkEmailTemplate(design));
    window.location.href = `mailto:${design.email}?subject=${subject}&body=${body}`;
  };

  const getQuotationEmailTemplate = (design: JewelleryConfig): string => {
    return `Dear ${design.firstName || 'Valued Client'},

We are delighted to present your bespoke proposal from The Diamond Guy.

PROPOSAL REFERENCE: ${design.id}

SPECIFICATIONS:
• Type: ${design.type}
• Metal: ${design.metal || 'N/A'}
• Stone: ${design.stoneCategory} ${design.shape || ''}
• Quality Tier: ${design.qualityTier}
• Carat: ${design.carat}
• Indicative Valuation: ZAR ${design.priceZAR.toLocaleString()}

${design.engraving ? `• Inscription: ${design.engraving}` : ''}

This proposal is valid for 7 days and subject to stone availability.

To view your full proposal and approve, please visit your Vault portal.

Best regards,
The Diamond Guy Team
Cape Town, South Africa

---
This is an automated quotation. For questions, please contact our concierge.`;
  };

  const getPaymentLinkEmailTemplate = (design: JewelleryConfig): string => {
    return `Dear ${design.firstName || 'Valued Client'},

Your proposal ${design.id} has been officially approved!

We are ready to begin crafting your bespoke piece. To proceed, please complete your 50% deposit payment using the link below:

PAYMENT LINK: ${design.paymentLink}

DEPOSIT AMOUNT: ZAR ${(design.priceZAR * 0.5).toLocaleString()}

Once your deposit is received, we will:
1. Source your specific stone
2. Begin the casting process
3. Provide regular updates on your piece's progress

Manufacturing timeline: 21-28 business days from deposit receipt.

${design.videoLink ? `\nVIDEO: ${design.videoLink}` : ''}
${design.certLink ? `\nCERTIFICATE: ${design.certLink}` : ''}

We look forward to creating your masterpiece.

Best regards,
The Diamond Guy Team
Cape Town, South Africa

---
For questions, please contact our concierge.`;
  };

  const filteredOrders = userState.recentDesigns.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeads = userState.leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFinishQuote = () => {
    const final: JewelleryConfig = { ...newQuote, priceZAR: 55000 } as JewelleryConfig;
    onUpdate([final, ...userState.recentDesigns]);
    setTab('Orders');
    alert(`Manually issued quote ${final.id} is now live.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-current/10 pb-12">
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.6em] text-emerald-500 font-bold">Jeweller Command Centre</p>
          <h1 className="text-5xl font-thin tracking-tighter uppercase">Operations Hub</h1>
        </div>
        <div className="flex gap-4">
          <TabBtn active={tab === 'Orders'} label={`Orders (${userState.recentDesigns.length})`} onClick={() => setTab('Orders')} />
          <TabBtn active={tab === 'Leads'} label={`CRM Leads (${userState.leads.length})`} onClick={() => setTab('Leads')} />
          <TabBtn active={tab === 'NewQuote'} label="Manual Quote" onClick={() => setTab('NewQuote')} icon={<Plus size={14}/>} />
        </div>
      </header>

      {tab !== 'NewQuote' && (
        <div className="flex gap-4">
          <Search className="opacity-20 mt-3" size={18} />
          <input type="text" placeholder="Search by Ref, Client Name, or Email..." className="bg-transparent border-b border-current/10 w-full py-4 text-sm focus:outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      )}

      <div className="space-y-6">
        {tab === 'Orders' && filteredOrders.length === 0 && <p className="text-center opacity-40 py-20 uppercase tracking-widest text-[10px]">No designs found.</p>}
        {tab === 'Orders' && filteredOrders.map(design => (
          <div key={design.id} className="glass border border-white/5 rounded-sm overflow-hidden">
             <div className="p-8 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setEditingId(editingId === design.id ? null : design.id)}>
                <div className="flex items-center gap-8">
                   <img src={design.imageUrl || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100'} className="w-12 h-12 object-cover rounded-sm border border-white/5" />
                   <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                        {design.id} {design.isDiscreet && <Shield className="text-emerald-500" size={14} />}
                      </h3>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">
                        {design.firstName} {design.lastName} • {design.type}
                      </p>
                   </div>
                </div>
                <div className="flex items-center gap-10">
                   <span className="text-[10px] uppercase font-bold px-4 py-2 border border-white/5">{design.status}</span>
                   <Edit3 size={16} className="opacity-40" />
                </div>
             </div>
             {editingId === design.id && (
               <div className="p-8 border-t border-white/5 bg-white/[0.01] space-y-8 animate-fadeIn">
                  <div className="grid md:grid-cols-3 gap-12">
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-40 font-bold">Client Context</p>
                        <p className="text-xs">{design.email}</p>
                        <p className="text-[9px] uppercase opacity-40 leading-relaxed font-light">Specs: {design.metal} • {design.shape} • {design.qualityTier}</p>
                        {design.status === 'Approved' && !design.isApproved && (
                          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-sm">
                            <p className="text-[9px] uppercase tracking-widest text-blue-400 font-bold mb-2">Client Approved - Awaiting Jeweler Approval</p>
                            {!design.paymentLink ? (
                              <p className="text-[8px] text-yellow-400 mb-2">⚠️ Payment link required before approval</p>
                            ) : null}
                            <button 
                              onClick={() => {
                                if (!design.paymentLink) {
                                  alert('Please add a payment link before approving.');
                                  return;
                                }
                                handleUpdate(design.id, {isApproved: true, status: 'Deposit Paid'});
                                sendPaymentLinkEmail(design);
                              }} 
                              disabled={!design.paymentLink}
                              className={`w-full py-2 text-white text-[9px] uppercase tracking-widest font-bold hover:bg-blue-600 ${
                                design.paymentLink ? 'bg-blue-500' : 'bg-gray-500 opacity-50 cursor-not-allowed'
                              }`}
                            >
                              Approve & Send Payment Link
                            </button>
                          </div>
                        )}
                        {design.isApproved && design.status === 'Deposit Paid' && (
                          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-sm">
                            <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Officially Approved</p>
                            <p className="text-[8px] opacity-60 mt-1">Payment link sent to client</p>
                          </div>
                        )}
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-40 font-bold">Quotation Specs</p>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Metal</label>
                           <select value={design.metal || ''} onChange={e => handleUpdate(design.id, {metal: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(METAL_DATA).map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Shape</label>
                           <select value={design.shape || ''} onChange={e => handleUpdate(design.id, {shape: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(SHAPE_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Quality Tier</label>
                           <select value={design.qualityTier || ''} onChange={e => handleUpdate(design.id, {qualityTier: e.target.value as any})} className="w-full bg-black/50 border border-white/10 p-2 text-[10px] uppercase tracking-widest">
                              {Object.keys(QUALITY_TIERS).map(q => <option key={q} value={q}>{q}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Carat</label>
                           <input 
                              type="number" 
                              step="0.01"
                              value={design.carat || ''} 
                              onChange={e => handleUpdate(design.id, {carat: parseFloat(e.target.value) || 0})}
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Price (ZAR)</label>
                           <input 
                              type="number" 
                              value={design.priceZAR || ''} 
                              onChange={e => handleUpdate(design.id, {priceZAR: parseInt(e.target.value) || 0})}
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-40 font-bold">Status & Links</p>
                        <select value={design.status} onChange={e => handleUpdate(design.id, {status: e.target.value as OrderStatus})} className="w-full bg-black/50 border border-white/10 p-3 text-[10px] uppercase tracking-widest">
                           {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="space-y-2 mt-4">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Video Link</label>
                           <input 
                              type="text" 
                              value={design.videoLink || ''} 
                              onChange={e => handleUpdate(design.id, {videoLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Certificate Link</label>
                           <input 
                              type="text" 
                              value={design.certLink || ''} 
                              onChange={e => handleUpdate(design.id, {certLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[8px] uppercase opacity-40 font-bold block">Payment Link *</label>
                           <input 
                              type="text" 
                              value={design.paymentLink || ''} 
                              onChange={e => handleUpdate(design.id, {paymentLink: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-black/50 border border-white/10 p-2 text-[10px] focus:outline-none focus:border-white/30"
                           />
                           <p className="text-[7px] opacity-30">Required for approval</p>
                        </div>
                        <button onClick={() => sendQuotationEmail(design)} className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 mt-4">
                           Send Quotation Email
                        </button>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[9px] uppercase opacity-40 font-bold">Actions</p>
                        <button className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5">Send Update Email</button>
                        {design.videoLink && (
                          <a href={design.videoLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2">
                            <Video size={12}/> View Video
                          </a>
                        )}
                        {design.certLink && (
                          <a href={design.certLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-white/10 text-[9px] uppercase tracking-widest hover:bg-white/5 flex items-center justify-center gap-2">
                            <FileText size={12}/> View Certificate
                          </a>
                        )}
                        {design.paymentLink && (
                          <a href={design.paymentLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] uppercase tracking-widest hover:bg-emerald-500/20 flex items-center justify-center gap-2">
                            <CreditCard size={12}/> Payment Link
                          </a>
                        )}
                     </div>
                  </div>
               </div>
             )}
          </div>
        ))}
        {tab === 'Leads' && filteredLeads.map(lead => (
          <div key={lead.id} className={`glass p-10 border border-current/5 flex flex-col md:flex-row justify-between gap-12 items-center ${lead.nudgedByClient ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''}`}>
            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <h4 className="text-[11px] uppercase tracking-widest font-bold">{lead.name} • {lead.date}</h4>
                  {lead.nudgedByClient && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1"><Share2 size={10}/> CLIENT NUDGE</span>}
               </div>
               <p className="text-xs opacity-60 max-w-lg leading-relaxed font-light">{lead.description}</p>
               <div className="flex gap-10 text-[9px] opacity-40 uppercase tracking-widest font-medium">
                  <span className="flex items-center gap-2"><Phone size={12}/> {lead.phone}</span>
                  <span className="flex items-center gap-2"><FileText size={12}/> {lead.email}</span>
               </div>
            </div>
            <button className="px-8 py-3 bg-white text-black text-[9px] uppercase tracking-widest font-bold hover:bg-gray-200">Initiate Pipeline</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const TabBtn = ({ active, label, onClick, icon }: any) => (
  <button onClick={onClick} className={`px-8 py-4 text-[10px] uppercase tracking-widest border transition-all flex items-center gap-2 ${active ? 'bg-white text-black border-white' : 'border-current/10 opacity-40'}`}>
    {icon} {label}
  </button>
);

export default JewelerPortal;
