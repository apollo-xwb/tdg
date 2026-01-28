
import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { NAV_ITEMS, EXCHANGE_RATES } from '../constants';
import { AppView } from '../types';
import { Moon, Sun, Menu, X, HelpCircle, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: string;
  setCurrency: (curr: any) => void;
  onOpenTour?: () => void;
  sessionUser?: User | null;
  /** Site logo URL (navbar, etc.). Falls back to default if omitted. */
  logoUrl?: string;
}

function displayName(user: User): string {
  const m = user?.user_metadata;
  if (m?.full_name) return m.full_name;
  if (m?.name) return m.name;
  if (user?.email) return user.email.split('@')[0];
  return 'Account';
}

const DEFAULT_LOGO = 'https://www.thediamondguy.co.za/wp-content/uploads/2019/08/the-diamond-guy-retina-logo-02.png';

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, theme, toggleTheme, currency, setCurrency, onOpenTour, sessionUser = null, logoUrl, forceDarkNav = false }) => {
  const isDark = forceDarkNav || theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoSrc = logoUrl || DEFAULT_LOGO;
  
  const handleNav = (id: AppView) => {
    setView(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-8 py-5 flex items-center justify-between glass transition-all ${isDark ? 'text-white' : 'text-black'}`}>
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => handleNav('Home')}
        >
          <img 
            src={logoSrc} 
            alt="Logo" 
            className={`h-7 lg:h-8 transition-all object-contain object-left ${isDark ? 'logo-invert' : 'logo-no-invert'}`}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as AppView)}
              className={`text-[10px] uppercase tracking-[0.3em] transition-all hover:opacity-100 ${
                currentView === item.id ? 'opacity-100 border-b border-current pb-1 font-semibold' : 'opacity-65'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {sessionUser && (
            <span className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-78">
              <UserIcon size={14} /> {displayName(sessionUser)}
            </span>
          )}
          {onOpenTour && (
            <>
              <button
                onClick={() => { onOpenTour(); setIsMenuOpen(false); }}
                className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70 hover:opacity-100 transition-opacity"
                title="How it works"
              >
                <HelpCircle size={14} /> How it works
              </button>
              <button
                onClick={() => { onOpenTour(); setIsMenuOpen(false); }}
                className="sm:hidden p-2 rounded-full hover:bg-current/10 transition-colors"
                title="How it works"
                aria-label="How it works"
              >
                <HelpCircle size={20} />
              </button>
            </>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm">
            <span className="text-xs">{EXCHANGE_RATES[currency].flag}</span>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-[9px] tracking-tighter uppercase focus:outline-none cursor-pointer"
            >
              {Object.keys(EXCHANGE_RATES).map(c => (
                <option key={c} value={c} className={isDark ? "bg-[#121212]" : "bg-white"}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-current/10 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-current"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-40 lg:hidden pt-32 px-10 transition-all animate-fadeIn ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F9F9F9] text-black'}`}>
          <div className="flex flex-col gap-10">
            {onOpenTour && (
              <button
                onClick={() => { onOpenTour(); setIsMenuOpen(false); }}
                className="flex items-center gap-3 text-2xl uppercase tracking-[0.2em] text-left pb-4 border-b border-current/10 opacity-80"
              >
                <HelpCircle size={24} /> How it works
              </button>
            )}
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id as AppView)}
                className={`text-2xl uppercase tracking-[0.2em] text-left pb-4 border-b border-current/10 ${
                  currentView === item.id ? 'font-bold opacity-100' : 'opacity-65'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
