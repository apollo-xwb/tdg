import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CatalogProduct, CatalogProductVariant, Lead } from '../types';
import CustomSelect from './CustomSelect';

function getEffectiveVariant(p: CatalogProduct, idx: number): CatalogProductVariant | null {
  const v = p.variants;
  if (!v?.length) return null;
  return v[Math.max(0, Math.min(idx, v.length - 1))];
}

interface ProductEnquiryModalProps {
  product: CatalogProduct;
  variantIndex: number;
  onClose: () => void;
  onSubmit: (lead: Lead) => void;
  onViewChat: () => void;
  theme?: 'dark' | 'light';
}

const ProductEnquiryModal: React.FC<ProductEnquiryModalProps> = ({
  product,
  variantIndex,
  onClose,
  onSubmit,
  onViewChat,
  theme = 'dark'
}) => {
  const [idx, setIdx] = useState(variantIndex);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const variant = getEffectiveVariant(product, idx);
  const metals = [...new Set((product.variants ?? []).map(v => v.metal).filter(Boolean))];
  const shapes = [...new Set((product.variants ?? []).map(v => v.shape).filter(Boolean))];
  const hasVariants = (product.variants?.length ?? 0) > 1;
  const isDark = theme === 'dark';

  const handleSubmit = () => {
    const variantInfo = variant ? ` (${[variant.metal, variant.shape].filter(Boolean).join(' / ')})` : '';
    const lead: Lead = {
      id: `COL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: name.trim() || 'Collection enquirer',
      email: email.trim() || '',
      phone: phone.trim() || '',
      requestType: 'Collection Enquiry',
      description: `Enquiry about: ${product.title}${variantInfo}. ${message.trim()}`.trim(),
      date: new Date().toLocaleDateString(),
      status: 'New',
      catalogProductId: product.id,
      source: 'Collection Enquiry'
    };
    onSubmit(lead);
    onClose();
    onViewChat();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn" onClick={onClose}>
      <div className={`border rounded-2xl p-8 max-w-md w-full space-y-6 animate-fadeIn ${isDark ? 'glass border-white/10 bg-neutral-900' : 'bg-white border-gray-200'}`} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h3 className="text-[11px] uppercase tracking-widest font-bold">Enquire: {product.title}</h3>
          <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100"><X size={18} /></button>
        </div>
        {hasVariants && (
          <div className="flex flex-wrap gap-3">
            {metals.length > 1 && (
              <div className="min-w-[120px]">
                <label className="text-[8px] uppercase tracking-widest opacity-60 block mb-1">Metal</label>
                <CustomSelect
                  options={metals.map(m => ({ value: m, label: m }))}
                  value={variant?.metal ?? ''}
                  onChange={metal => {
                    const shape = variant?.shape ?? '';
                    const i = product.variants!.findIndex(v => v.metal === metal && (shape ? v.shape === shape : true));
                    setIdx(i >= 0 ? i : 0);
                  }}
                  theme={theme}
                />
              </div>
            )}
            {shapes.length > 1 && (
              <div className="min-w-[120px]">
                <label className="text-[8px] uppercase tracking-widest opacity-60 block mb-1">Shape</label>
                <CustomSelect
                  options={shapes.map(s => ({ value: s, label: s }))}
                  value={variant?.shape ?? ''}
                  onChange={shape => {
                    const metal = variant?.metal ?? '';
                    const i = product.variants!.findIndex(v => v.shape === shape && (metal ? v.metal === metal : true));
                    setIdx(i >= 0 ? i : 0);
                  }}
                  theme={theme}
                />
              </div>
            )}
          </div>
        )}
        <p className="text-[9px] opacity-68">We'll get in touch to discuss this design and next steps.</p>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          className={`w-full p-3 text-[10px] border focus:outline-none focus:ring-1 ${isDark ? 'bg-white/5 border-white/20 placeholder:text-white/40' : 'bg-gray-50 border-gray-200 placeholder:text-gray-500'}`}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={`w-full p-3 text-[10px] border focus:outline-none focus:ring-1 ${isDark ? 'bg-white/5 border-white/20 placeholder:text-white/40' : 'bg-gray-50 border-gray-200 placeholder:text-gray-500'}`}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className={`w-full p-3 text-[10px] border focus:outline-none focus:ring-1 ${isDark ? 'bg-white/5 border-white/20 placeholder:text-white/40' : 'bg-gray-50 border-gray-200 placeholder:text-gray-500'}`}
        />
        <textarea
          placeholder="Message (optional)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={2}
          className={`w-full p-3 text-[10px] border focus:outline-none focus:ring-1 resize-none ${isDark ? 'bg-white/5 border-white/20 placeholder:text-white/40' : 'bg-gray-50 border-gray-200 placeholder:text-gray-500'}`}
        />
        <button onClick={handleSubmit} className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 rounded-lg">
          Send enquiry
        </button>
      </div>
    </div>
  );
};

export default ProductEnquiryModal;
