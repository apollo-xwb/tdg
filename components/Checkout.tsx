import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppView, CatalogProduct, Lead, JewelleryConfig, OrderStatus } from '../types';
import { EXCHANGE_RATES } from '../constants';
import CustomSelect from './CustomSelect';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';

interface CheckoutState {
  product: CatalogProduct;
  variantIndex: number;
  priceZAR: number;
  metal?: string;
  shape?: string;
  ringSize?: string;
  ringSizeStandard?: string;
  engraving?: string;
}

interface CheckoutProps {
  setView: (view: AppView) => void;
  currency?: string;
  theme?: 'dark' | 'light';
  onOrderPlaced: (order: { design: JewelleryConfig; lead: Lead }) => void | Promise<void>;
}

const Checkout: React.FC<CheckoutProps> = ({ setView, currency = 'ZAR', theme = 'dark', onOrderPlaced }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState | null;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;
  const isDark = theme === 'dark';

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state?.product) return;
    setError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);

    try {
      const designId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const leadId = `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const now = new Date().toISOString();
      const product = state.product;
      const priceZAR = state.priceZAR;

      const design: JewelleryConfig = {
        id: designId,
        type: (product.type as JewelleryConfig['type']) || 'Engagement Ring',
        stoneType: 'Natural',
        metal: (state.metal as JewelleryConfig['metal']) || 'Platinum',
        settingStyle: 'Solitaire',
        stoneCategory: 'Diamond',
        shape: (state.shape as JewelleryConfig['shape']) || 'Round',
        carat: 0,
        budget: 0,
        engraving: state.engraving || '',
        priceZAR,
        date: new Date().toLocaleDateString(),
        status: 'Quoted',
        isApproved: false,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        catalogProductId: product.id,
        showInExplore: false,
      };
      if (state.ringSize) design.ringSize = state.ringSize;
      if (state.ringSizeStandard) design.ringSizeStandard = state.ringSizeStandard;

      const lead: Lead = {
        id: leadId,
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        phone: phone.trim(),
        requestType: 'Pre-config Order',
        description: `Order: ${product.title}${state.metal || state.shape ? ` (${[state.metal, state.shape].filter(Boolean).join(' / ')})` : ''}. ZAR ${priceZAR.toLocaleString()}. ${notes.trim() ? `Notes: ${notes}` : ''}`.trim(),
        date: new Date().toLocaleDateString(),
        status: 'Won',
        catalogProductId: product.id,
        source: 'Pre-config Order',
        orderAmountZAR: priceZAR,
      };

      await onOrderPlaced({ design, lead });
      navigate('/thank-you', { state: { designId, product: product, priceZAR, firstName: firstName.trim(), lastName: lastName.trim() } });
      setView('ThankYou');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  if (!state?.product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[10px] uppercase tracking-widest opacity-60">No checkout data. Start from a product.</p>
        <button onClick={() => { navigate('/collection'); setView('Collection'); }} className="underline">
          Back to Collection
        </button>
      </div>
    );
  }

  const product = state.product;
  const displayImage = product.variants?.[state.variantIndex]?.imageUrl || product.imageUrls?.[0];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12 animate-fadeIn">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-opacity mb-12"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Lock size={18} className="opacity-70" />
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-80">Secure checkout</p>
        </div>

        <div className="glass border border-current/10 rounded-2xl p-8 mb-8">
          <div className="flex gap-6 items-center mb-6">
            <img
              src={displayImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200'}
              alt={product.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest">{product.title}</h2>
              {(state.metal || state.shape) && (
                <p className="text-[10px] opacity-70 mt-0.5">{[state.metal, state.shape].filter(Boolean).join(' / ')}</p>
              )}
              <p className="text-lg font-light mt-1">
                {currency} {Math.round(state.priceZAR / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">First name *</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Last name *</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Delivery address (optional)</label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={2}
              className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-[0.3em] opacity-70 mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Special requests, delivery preferences..."
              className={`w-full p-4 border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                isDark ? 'bg-white/5 border-white/20 text-white placeholder:opacity-50' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard size={20} /> {submitting ? 'Placing order...' : 'Place order'}
          </button>

          <p className="text-[9px] opacity-60 text-center">
            By placing your order you agree to our terms. A 50% deposit may be required. We&apos;ll contact you to confirm.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
