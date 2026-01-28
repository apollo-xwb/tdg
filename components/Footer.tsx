
import React from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { AppView } from '../types';
import type { OpeningHoursEntry } from '../types';
import { DONTPAYRETAIL, GIA_LOGO, EGI_LOGO, NAV_ITEMS } from '../constants';
import { OpeningHoursCountdown, OpeningHoursBlock, AddressBlock, PhoneBlock } from './OpeningHours';

const DEFAULT_LOGO = 'https://www.thediamondguy.co.za/wp-content/uploads/2019/08/the-diamond-guy-retina-logo-02.png';

const Footer: React.FC<{ theme: 'dark' | 'light'; onNavigate: (v: AppView) => void; onOpenTour?: () => void; hours?: OpeningHoursEntry[] | null; logoUrl?: string }> = ({ theme, onNavigate, onOpenTour, hours, logoUrl }) => {
  const isDark = theme === 'dark';
  const logoSrc = logoUrl || DEFAULT_LOGO;
  return (
    <footer className={`flex-shrink-0 py-16 px-4 sm:px-6 lg:px-8 border-t transition-all ${isDark ? 'bg-black border-white/5 text-white' : 'bg-white border-black/5 text-black'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-4">
            <img 
              src={logoSrc} 
              alt="Logo" 
              className={`h-6 transition-all object-contain ${isDark ? 'logo-invert' : 'logo-no-invert'}`}
            />
            <p className="text-[9px] uppercase tracking-[0.35em] opacity-72 max-w-xs leading-relaxed">
              {DONTPAYRETAIL}. We pioneer it. Custom only. No inventory—under retail. Ethically sourced. Certified.
            </p>
            <div className="flex gap-6 opacity-50">
              <a href="#" className="hover:opacity-100 transition-opacity"><Instagram size={16} /></a>
              <a href="#" className="hover:opacity-100 transition-opacity"><Facebook size={16} /></a>
              <a href="#" className="hover:opacity-100 transition-opacity"><Mail size={16} /></a>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <img src={GIA_LOGO} alt="GIA" className="h-8 object-contain opacity-60" />
              <img src={EGI_LOGO} alt="EGL" className="h-8 object-contain opacity-60" />
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-70 mb-3">Shortcuts</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {onOpenTour && (
                <button onClick={onOpenTour} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">How it works</button>
              )}
              {NAV_ITEMS.map(n => (
                <button key={n.id} onClick={() => onNavigate(n.id as AppView)} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">
                  {n.label}
                </button>
              ))}
              <button onClick={() => onNavigate('Terms')} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">Terms</button>
            </div>
          </div>

          <div className="space-y-3">
            <OpeningHoursBlock hours={hours} />
            <OpeningHoursCountdown hours={hours} />
          </div>

          <div className="space-y-3">
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-70">Visit</p>
            <AddressBlock />
            <PhoneBlock />
          </div>
        </div>

        <div className="pt-8 border-t border-current/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="opacity-65 text-[9px] uppercase tracking-[0.4em]">© 2026 THE DIAMOND GUY PRECIOUS METALS</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <button onClick={() => onNavigate('Blog')} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">Blog</button>
            <button onClick={() => onNavigate('Terms')} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">Terms & Conditions</button>
            <button onClick={() => onNavigate('Resources')} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">Security & Trust</button>
            <button onClick={() => onNavigate('Chatbot')} className="text-[9px] uppercase tracking-widest opacity-65 hover:opacity-100 transition-all">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
