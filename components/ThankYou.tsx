import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppView, CatalogProduct } from '../types';
import { EXCHANGE_RATES } from '../constants';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface ThankYouState {
  designId: string;
  product: CatalogProduct;
  priceZAR: number;
  firstName: string;
  lastName: string;
}

interface ThankYouProps {
  setView: (view: AppView) => void;
  currency?: string;
  theme?: 'dark' | 'light';
}

const ThankYou: React.FC<ThankYouProps> = ({ setView, currency = 'ZAR', theme = 'dark' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ThankYouState | null;

  const rate = EXCHANGE_RATES[currency]?.rate ?? 1;
  const isDark = theme === 'dark';

  const handleTrack = () => {
    navigate('/');
    setView('Track');
  };

  const handleCollection = () => {
    navigate('/collection');
    setView('Collection');
  };

  const handleHome = () => {
    navigate('/');
    setView('Home');
  };

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <CheckCircle size={64} className="text-emerald-500" />
        <h1 className="text-2xl font-thin uppercase tracking-tight">Thank you</h1>
        <p className="text-sm opacity-70">Your order has been received.</p>
        <button onClick={handleHome} className="underline text-[10px] uppercase tracking-widest">
          Return home
        </button>
      </div>
    );
  }

  const { designId, product, priceZAR, firstName, lastName } = state;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-lg w-full text-center space-y-10 animate-fadeIn">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-bold mb-2">
            Order confirmed
          </p>
          <h1 className="text-4xl font-thin tracking-tighter uppercase">Thank you, {firstName}</h1>
          <p className="mt-4 text-sm opacity-80">
            We&apos;ve received your order and will be in touch shortly to confirm details and next steps.
          </p>
        </div>

        <div className={`p-8 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4 justify-center mb-4">
            <Package size={24} className="opacity-60" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Order reference</span>
          </div>
          <p className="text-2xl font-mono tracking-wider">{designId}</p>
          <p className="mt-2 text-sm opacity-70">{product.title}</p>
          <p className="mt-1 text-lg font-light">
            {currency} {Math.round(priceZAR / rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-70">
            What happens next?
          </p>
          <ul className="text-sm opacity-80 space-y-2 text-left max-w-sm mx-auto">
            <li>• We&apos;ll email you within 24 hours to confirm your order</li>
            <li>• A 50% deposit may be required to begin production</li>
            <li>• Manufacturing typically takes 3–4 weeks</li>
            <li>• Track your order anytime via the Track page</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button
            onClick={handleTrack}
            className="flex items-center justify-center gap-2 py-4 px-8 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-100 transition-colors"
          >
            Track order <ArrowRight size={14} />
          </button>
          <button
            onClick={handleCollection}
            className="flex items-center justify-center gap-2 py-4 px-8 border border-current/20 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-colors"
          >
            Continue shopping
          </button>
        </div>

        <button onClick={handleHome} className="text-[9px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
          Return to home
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
