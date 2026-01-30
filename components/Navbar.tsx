import React, { useState, useRef, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { NAV_ITEMS, EXCHANGE_RATES } from '../constants';
import { AppView } from '../types';
import { signOut } from '../lib/supabase';
import { Moon, Sun, Menu, X, HelpCircle, User as UserIcon, Ruler, ChevronDown, LogOut, PenTool, LogIn, Home, BookOpen, Gem, GraduationCap, LayoutGrid, Compass, FileText, FolderOpen, MessageSquare, Package, Calendar } from 'lucide-react';

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const logoSrc = logoUrl || DEFAULT_LOGO;

  useEffect(() => {
    const onOutside = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);
  
  const handleNav = (id: AppView) => {
    setView(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 xl:px-8 py-5 flex items-center justify-between glass transition-all ${isDark ? 'text-white' : 'text-black'} ${isMenuOpen ? 'xl:flex hidden' : ''}`}>
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
            <div ref={userMenuRef} className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-78 hover:opacity-100 transition-opacity cursor-pointer"
                title="Account"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <UserIcon size={14} /> {displayName(sessionUser)} <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className={`absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-sm border shadow-lg ${isDark ? 'bg-[#1a1a1a] border-white/20' : 'bg-white border-black/10'}`}>
                  <button type="button" onClick={() => { handleNav('Portal'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-current/5">
                    <UserIcon size={12} /> Vault
                  </button>
                  <button type="button" onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-current/5 opacity-80">
                    <LogOut size={12} /> Sign out
                  </button>
                </div>
              )}
            </div>
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

      {/* Mobile Navigation Overlay — logo, greeting, shortcuts, then browse grid */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-50 xl:hidden flex flex-col animate-fadeIn ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F9F9F9] text-black'}`}>
          {/* Header: logo + close */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-5">
            <img src={logoSrc} alt="Logo" className={`h-7 object-contain object-left ${isDark ? 'logo-invert' : 'logo-no-invert'}`} />
            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-current/10 transition-colors" aria-label="Close menu">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 overflow-y-auto overscroll-contain px-5 pb-6">
              <div className="flex flex-col gap-8 pb-12">
                {/* Greeting */}
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] font-medium">
                    Welcome{sessionUser ? ` ${displayName(sessionUser)},` : ','}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] opacity-70 mt-0.5">Let&apos;s get started...</p>
                </div>
                {/* Shortcuts — above Browse */}
                <div className="flex flex-wrap gap-2">
                  {onOpenTour && (
                    <button onClick={() => { onOpenTour(); setIsMenuOpen(false); }} className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-current/20 text-[10px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100 hover:bg-current/5 transition-all">
                      <HelpCircle size={16} /> How it works
                    </button>
                  )}
                  {onOpenRingSizeGuide && (
                    <button onClick={() => { onOpenRingSizeGuide(); setIsMenuOpen(false); }} className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-current/20 text-[10px] uppercase tracking-[0.2em] opacity-80 hover:opacity-100 hover:bg-current/5 transition-all">
                      <Ruler size={16} /> Ring size guide
                    </button>
                  )}
                </div>
                {/* Browse — 2x2 grid of large rounded buttons */}
                <nav aria-label="Browse">
                  <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-3 font-medium">Browse</p>
                  <div className="grid grid-cols-2 gap-3">
                    {NAV_ITEMS.filter((i) => ['Home', 'About', 'RingBuilder', 'Learn', 'Collection', 'Explore', 'Blog'].includes(i.id)).map((item) => {
                      const Icon = { Home, About: BookOpen, RingBuilder: PenTool, Learn: GraduationCap, Collection: LayoutGrid, Explore: Compass, Blog: FileText }[item.id] ?? Home;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id as AppView)}
                          className={`flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl transition-all min-h-[100px] ${
                            isDark ? 'bg-white/10 hover:bg-white/18 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
                          } ${currentView === item.id ? (isDark ? 'ring-2 ring-white/40' : 'ring-2 ring-black/30') : ''} ${item.id === 'RingBuilder' ? '[text-shadow:0_0_12px_currentColor,0_0_24px_currentColor]' : ''}`}
                        >
                          <Icon size={28} strokeWidth={1.5} className={isDark ? 'text-white' : 'text-black'} />
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
                {/* Visit & support — same visual style */}
                <nav aria-label="Visit and support">
                  <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-3 font-medium">Visit & support</p>
                  <div className="grid grid-cols-2 gap-3">
                    {NAV_ITEMS.filter((i) => ['Resources', 'Chatbot', 'Track', 'Book'].includes(i.id)).map((item) => {
                      const Icon = { Resources: FolderOpen, Chatbot: MessageSquare, Track: Package, Book: Calendar }[item.id] ?? FileText;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id as AppView)}
                          className={`flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl transition-all min-h-[100px] ${
                            isDark ? 'bg-white/10 hover:bg-white/18 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
                          } ${currentView === item.id ? (isDark ? 'ring-2 ring-white/40' : 'ring-2 ring-black/30') : ''}`}
                        >
                          <Icon size={28} strokeWidth={1.5} className={isDark ? 'text-white' : 'text-black'} />
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </nav>
                {/* Your vault */}
                {NAV_ITEMS.some((i) => i.id === 'Portal') && (
                  <nav aria-label="Your vault">
                    <p className="text-[9px] uppercase tracking-[0.35em] opacity-50 mb-3 font-medium">Your vault</p>
                    <div className="grid grid-cols-2 gap-3">
                      {NAV_ITEMS.filter((i) => i.id === 'Portal').map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNav(item.id as AppView)}
                          className={`flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl transition-all min-h-[100px] ${
                            isDark ? 'bg-white/10 hover:bg-white/18 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
                          } ${currentView === item.id ? (isDark ? 'ring-2 ring-white/40' : 'ring-2 ring-black/30') : ''}`}
                        >
                          <LogIn size={28} strokeWidth={1.5} className={isDark ? 'text-white' : 'text-black'} />
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">{item.label}</span>
                        </button>
                      ))}
                      {sessionUser && (
                        <button
                          onClick={() => { signOut(); setIsMenuOpen(false); }}
                          className={`flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl transition-all min-h-[100px] ${
                            isDark ? 'bg-white/10 hover:bg-white/18 border border-white/10' : 'bg-black/5 hover:bg-black/10 border border-black/10'
                          }`}
                        >
                          <LogOut size={28} strokeWidth={1.5} className={isDark ? 'text-white' : 'text-black'} />
                          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Sign out</span>
                        </button>
                      )}
                    </div>
                  </nav>
                )}
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-12 pointer-events-none bg-gradient-to-t ${isDark ? 'from-[#121212]' : 'from-[#F9F9F9]'} to-transparent`} aria-hidden />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
