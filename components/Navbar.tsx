
import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { NAV_ITEMS, EXCHANGE_RATES } from '../constants';
import { AppView } from '../types';
import { Moon, Sun, Menu, X, HelpCircle, User as UserIcon, Ruler } from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: string;
  setCurrency: (curr: any) => void;
  onOpenTour?: () => void;
  onOpenRingSizeGuide?: () => void;
  sessionUser?: User | null;
  /** Site logo URL (navbar, etc.). Falls back to default if omitted. */
  logoUrl?: string;
  forceDarkNav?: boolean;
}

function displayName(user: User): string {
  const m = user?.user_metadata;
  if (m?.full_name) return m.full_name;
  if (m?.name) return m.name;
  if (user?.email) return user.email.split('@')[0];
  return 'Account';
}

const DEFAULT_LOGO = 'https://www.thediamondguy.co.za/wp-content/uploads/2019/08/the-diamond-guy-retina-logo-02.png';

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, theme, toggleTheme, currency, setCurrency, onOpenTour, onOpenRingSizeGuide, sessionUser = null, logoUrl, forceDarkNav = false }) => {
  const isDark = forceDarkNav || theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const logoSrc = logoUrl || DEFAULT_LOGO;
  
  const handleNav = (id: AppView) => {
    setView(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 xl:px-8 py-5 flex items-center justify-between glass transition-all ${isDark ? 'text-white' : 'text-black'}`}>
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => handleNav('Home')}
        >
          <img 
            src={logoSrc} 
            alt="Logo" 
            className={`h-7 xl:h-8 transition-all object-contain object-left ${isDark ? 'logo-invert' : 'logo-no-invert'}`}
          />
        </div>

        {/* Desktop Navigation — only from 1280px; hamburger below that (including 1024px) */}
        <div className="hidden xl:flex items-center gap-10">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as AppView)}
              className={`text-[10px] uppercase tracking-[0.3em] transition-all hover:opacity-100 ${
                currentView === item.id ? 'opacity-100 border-b border-current pb-1 font-semibold' : 'opacity-65'
              } ${item.id === 'RingBuilder' ? '[text-shadow:0_0_10px_currentColor,0_0_18px_currentColor]' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {sessionUser && (
            <button
              type="button"
              onClick={() => handleNav('Portal')}
              className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-78 hover:opacity-100 transition-opacity cursor-pointer"
              title="Go to your vault"
            >
              <UserIcon size={14} /> {displayName(sessionUser)}
            </button>
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
          {onOpenRingSizeGuide && (
            <button
              onClick={() => { onOpenRingSizeGuide(); setIsMenuOpen(false); }}
              className="p-2 rounded-full hover:bg-current/10 transition-colors"
              title="Ring size guide"
              aria-label="Ring size guide"
            >
              <Ruler size={18} />
            </button>
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

          {/* Hamburger — visible below 1280px (so 1024px uses menu) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden p-2 text-current"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay — scrollable, grouped */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-40 xl:hidden flex flex-col pt-24 pb-6 animate-fadeIn ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F9F9F9] text-black'}`}>
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 overflow-y-auto overscroll-contain px-6">
              <div className="flex flex-col gap-6 pb-12">
              {/* Shortcuts */}
              <div className="flex flex-wrap gap-2">
                {onOpenTour && (
                  <button
                    onClick={() => { onOpenTour(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-full border border-current/20 text-[10px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100 hover:bg-current/5 transition-all"
                  >
                    <HelpCircle size={16} /> How it works
                  </button>
                )}
                {onOpenRingSizeGuide && (
                  <button
                    onClick={() => { onOpenRingSizeGuide(); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 py-2.5 px-4 rounded-full border border-current/20 text-[10px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100 hover:bg-current/5 transition-all"
                  >
                    <Ruler size={16} /> Ring size guide
                  </button>
                )}
              </div>
              {/* Browse */}
              <nav aria-label="Browse">
                <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-2 font-medium">Browse</p>
                <div className="flex flex-col gap-0.5">
                  {NAV_ITEMS.filter((i) => ['Home', 'About', 'RingBuilder', 'Learn', 'Collection', 'Explore', 'Blog'].includes(i.id)).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id as AppView)}
                      className={`text-left py-3 px-1 text-[11px] uppercase tracking-[0.2em] rounded-sm -mx-1 ${
                        currentView === item.id ? 'font-bold opacity-100 bg-current/5' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                      } ${item.id === 'RingBuilder' ? '[text-shadow:0_0_12px_currentColor,0_0_24px_currentColor]' : ''}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>
              {/* Visit & support */}
              <nav aria-label="Visit and support">
                <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-2 font-medium">Visit & support</p>
                <div className="flex flex-col gap-0.5">
                  {NAV_ITEMS.filter((i) => ['Resources', 'Chatbot', 'Track', 'Book'].includes(i.id)).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id as AppView)}
                      className={`text-left py-3 px-1 text-[11px] uppercase tracking-[0.2em] rounded-sm -mx-1 ${
                        currentView === item.id ? 'font-bold opacity-100 bg-current/5' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </nav>
              {/* Your vault */}
              {NAV_ITEMS.some((i) => i.id === 'Portal') && (
                <nav aria-label="Your account">
                  <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-2 font-medium">Your vault</p>
                  <div className="flex flex-col gap-0.5">
                    {NAV_ITEMS.filter((i) => i.id === 'Portal').map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id as AppView)}
                        className={`text-left py-3 px-1 text-[11px] uppercase tracking-[0.2em] rounded-sm -mx-1 ${
                          currentView === item.id ? 'font-bold opacity-100 bg-current/5' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </nav>
              )}
              </div>
            </div>
            {/* Fade at bottom when content overflows */}
            <div className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t ${isDark ? 'from-[#121212]' : 'from-[#F9F9F9]'} to-transparent`} aria-hidden />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
