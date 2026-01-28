
import React, { useState } from 'react';
import type { JewelleryConfig, OrderStatus } from '../types';
import { Search, Package, Gem, Truck, CheckCircle, FileText, Video, Star } from 'lucide-react';
import { EXCHANGE_RATES } from '../constants';

const ORDER_STATUS_FLOW: OrderStatus[] = ['Quoted', 'Approved', 'Deposit Paid', 'Sourcing Stone', 'In Production', 'Final Polish', 'Ready', 'Collected'];

function formatMilestone(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

interface OrderTrackingProps {
  designs: JewelleryConfig[];
  sessionUser?: { email?: string } | null;
  hasAuth?: boolean;
  currency?: string;
  onNavigate?: (view: 'Portal' | 'Chatbot') => void;
  googleReviewUrl?: string | null;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  designs,
  sessionUser = null,
  hasAuth = false,
  currency = 'ZAR',
  onNavigate,
  googleReviewUrl
}) => {
  const [orderId, setOrderId] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  const mine = sessionUser?.email
    ? designs.filter(d => (d.email || '').toLowerCase() === sessionUser.email!.toLowerCase())
    : designs;
  const design = orderId.trim()
    ? mine.find(d => d.id.toUpperCase() === orderId.trim().toUpperCase())
    : null;

  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;

  const trackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!orderId.trim()) return;
    const found = mine.find(d => d.id.toUpperCase() === orderId.trim().toUpperCase());
    if (!found) setLookupError('We couldn’t find that order. Check the ID or sign in to your Vault.');
  };

  const currentIdx = design ? Math.max(0, ORDER_STATUS_FLOW.indexOf(design.status)) : -1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-thin tracking-tight uppercase mb-4">Track Your Brilliance</h2>
        <p className="text-gray-400 font-light max-w-lg mx-auto">
          Enter your Order ID from your design summary or email.
          {hasAuth && !sessionUser && onNavigate && (
            <> <button type="button" onClick={() => onNavigate('Chatbot')} className="underline hover:opacity-90">Sign in</button> to see your orders.</>
          )}
        </p>
      </div>

      <form onSubmit={trackOrder} className="flex gap-4 mb-10 max-w-xl mx-auto">
        <input
          type="text"
          value={orderId}
          onChange={(e) => { setOrderId(e.target.value); setLookupError(null); }}
          placeholder="e.g. TDG-M-XXXXX"
          className="flex-grow bg-white/5 border border-white/10 px-6 py-4 rounded-sm text-sm uppercase tracking-widest focus:outline-none focus:border-white transition-all"
        />
        <button type="submit" className="bg-white text-black px-8 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold hover:bg-gray-200 transition-all">
          <Search size={16} /> Track
        </button>
      </form>

      {lookupError && (
        <p className="text-center text-amber-400/90 text-sm max-w-xl mx-auto mb-10">{lookupError}</p>
      )}

      {design && (
        <div className="animate-fadeIn bg-white/5 border border-white/10 p-8 md:p-12 rounded-sm">
          <div className="flex flex-wrap justify-between items-start gap-6 mb-10 border-b border-white/10 pb-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Order reference</p>
              <h3 className="text-xl font-light uppercase tracking-wider">{design.id}</h3>
              <p className="text-[10px] opacity-70 mt-1 uppercase">{design.type} • {design.metal || '—'}</p>
              {(design.firstName || design.lastName) && (
                <p className="text-[10px] opacity-60 mt-0.5">{[design.firstName, design.lastName].filter(Boolean).join(' ')}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
              <span className="text-xs uppercase tracking-widest bg-white text-black px-3 py-1.5 font-medium rounded-sm">
                {design.status}
              </span>
              <p className="text-sm font-thin mt-2">{currency} {Math.round((design.priceZAR ?? 0) / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          <div className="space-y-6 relative">
            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/10 z-0" />
            {ORDER_STATUS_FLOW.map((step, i) => {
              const completed = currentIdx >= 0 && i <= currentIdx;
              const isCurrent = i === currentIdx;
              const icon = i <= 1 ? Package : i <= 4 ? Gem : i <= 6 ? CheckCircle : Truck;
              return (
                <div key={step} className="flex items-center gap-8 relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                      completed ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-[#121212] border-white/20 text-gray-600'
                    }`}
                  >
                    {icon === Package && <Package size={18} />}
                    {icon === Gem && <Gem size={18} />}
                    {icon === CheckCircle && <CheckCircle size={18} />}
                    {icon === Truck && <Truck size={18} />}
                  </div>
                  <div>
                    <h4 className={`text-sm uppercase tracking-widest ${completed ? 'text-white' : 'text-gray-600'}`}>
                      {step}
                      {isCurrent && <span className="ml-2 text-[10px] opacity-70">(current)</span>}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-tighter">
                      {completed ? (i < currentIdx ? 'Done' : 'In progress') : 'Pending'}
                    </p>
                    {design.milestoneDates?.[step] && (
                      <p className="text-[10px] text-gray-500 mt-0.5">{formatMilestone(design.milestoneDates[step])}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {(design.certLink || design.videoLink) && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Documents</p>
              <div className="flex flex-wrap gap-3">
                {design.certLink && (
                  <a href={design.certLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5">
                    <FileText size={14} /> Certificate
                  </a>
                )}
                {design.videoLink && (
                  <a href={design.videoLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5">
                    <Video size={14} /> Video
                  </a>
                )}
              </div>
            </div>
          )}

          {googleReviewUrl && (design.status === 'Collected' || design.status === 'Ready') && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm font-light mb-3">Loved your piece? Leave us a review.</p>
              <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-semibold hover:bg-gray-200">
                <Star size={14} /> Leave a Google review
              </a>
            </div>
          )}

          {onNavigate && (
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap gap-4">
              <button type="button" onClick={() => onNavigate('Portal')} className="text-[10px] uppercase tracking-widest opacity-78 hover:opacity-100">
                View in Vault
              </button>
              <button type="button" onClick={() => onNavigate('Chatbot')} className="text-[10px] uppercase tracking-widest opacity-78 hover:opacity-100">
                Contact Concierge
              </button>
            </div>
          )}
        </div>
      )}

      {sessionUser && mine.length > 0 && !design && !orderId.trim() && (
        <div className="text-center">
          <p className="text-[10px] uppercase opacity-68 mb-4">Your orders</p>
          <div className="flex flex-wrap justify-center gap-2">
            {mine.slice(0, 8).map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setOrderId(d.id); setLookupError(null); }}
                className="px-4 py-2 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white/5"
              >
                {d.id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
