
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { AppView, UserState, JewelleryConfig, Lead, CatalogProduct, EmailFlow, JewelerSettings } from './types';
import { fetchDesigns, fetchLeads, fetchCatalogProducts, fetchEmailFlows, fetchJewelerSettings, upsertDesign, upsertDesigns, upsertLead, upsertLeads, subscribeDesigns, subscribeLeads, subscribeCatalogProducts, subscribeEmailFlows, getSession, onAuthStateChange, setEffectiveJewelerId, supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import RingBuilder from './components/RingBuilder';
import Learn from './components/Learn';
import Chatbot from './components/Chatbot';
import Portal from './components/Portal';
import Resources from './components/Resources';
import FloatingConcierge from './components/FloatingConcierge';

const Blog = lazy(() => import('./components/Blog'));
import JewelerPortal from './components/JewelerPortal';
import Collection from './components/Collection';
import ProductPage from './components/ProductPage';
import Checkout from './components/Checkout';
import ThankYou from './components/ThankYou';
import Explore from './components/Explore';
import OrderTracking from './components/OrderTracking';
import Terms from './components/Terms';
import TutorialWizard from './components/TutorialWizard';
import BookConsultation from './components/BookConsultation';
import About from './components/About';
import { LOGO_URL, TDG_ADDRESS } from './constants';
import { loadProductsFromCsv } from './data/productsFromCsv';
import { mergeCatalog } from './lib/catalogMerge';
import RingSizeGuideModal from './components/RingSizeGuideModal';
import PasswordRecoveryModal from './components/PasswordRecoveryModal';
import DevPricingLab from './components/DevPricingLab';
import DevPricingProposal from './components/DevPricingProposal';

const defaultState: UserState = {
  diamondIQ: [],
  recentDesigns: [],
  leads: [],
  currency: 'ZAR',
  theme: 'dark',
  builderDraft: {},
  wishlistProductIds: [],
  compareProductIds: []
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('Home');
  const [tourOpen, setTourOpen] = useState(false);
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('diamond_guy_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          recentDesigns: parsed.recentDesigns ?? [],
          leads: parsed.leads ?? [],
          wishlistProductIds: parsed.wishlistProductIds ?? [],
          compareProductIds: parsed.compareProductIds ?? [],
        };
      } catch {
        return { ...defaultState };
      }
    }
    return { ...defaultState };
  });
  const [syncedOnce, setSyncedOnce] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [emailFlows, setEmailFlows] = useState<EmailFlow[]>([]);
  const [jewelerSettings, setJewelerSettings] = useState<JewelerSettings | null>(null);
  const [showRingSizeGuide, setShowRingSizeGuide] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [devPricingEnabled, setDevPricingEnabled] = useState(false);

  const refreshJewelerSettings = useCallback(async () => {
    const s = await fetchJewelerSettings();
    setJewelerSettings(s);
  }, []);

  // Auth: init session, set effective jeweler for RLS, then load from Supabase
  useEffect(() => {
    let cancelled = false;
    const applySession = (user: User | null) => {
      setSessionUser(user);
      setEffectiveJewelerId(user?.email ?? '');
    };
    getSession().then(({ data }) => {
      if (cancelled) return;
      const user = data?.session?.user ?? null;
      applySession(user);
      // Load from DB after session so RLS uses correct jeweler_id
      Promise.all([fetchDesigns(), fetchLeads(), fetchCatalogProducts(), fetchEmailFlows(), fetchJewelerSettings()]).then(([designs, leads, catalog, flows, settings]) => {
        if (cancelled) return;
        setUserState(prev => ({
          ...prev,
          recentDesigns: designs.length ? designs : prev.recentDesigns,
          leads: leads.length ? leads : prev.leads
        }));
        setCatalogProducts(mergeCatalog(loadProductsFromCsv(), catalog));
        setEmailFlows(flows);
        setJewelerSettings(settings as JewelerSettings | null);
        setSyncedOnce(true);
      });
    });
    const unsub = onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY') setShowPasswordRecovery(true);
      applySession(session?.user ?? null);
      // Refetch so UI shows the correct tenant (or anon scope) immediately
      Promise.all([fetchDesigns(), fetchLeads(), fetchCatalogProducts(), fetchEmailFlows(), fetchJewelerSettings()]).then(([designs, leads, catalog, flows, settings]) => {
        if (cancelled) return;
        setUserState(prev => ({ ...prev, recentDesigns: designs, leads }));
        setCatalogProducts(mergeCatalog(loadProductsFromCsv(), catalog));
        setEmailFlows(flows);
        setJewelerSettings(settings as JewelerSettings | null);
      });
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  // Realtime: when designs, leads, or catalog change, update state
  useEffect(() => {
    const unsubDesigns = subscribeDesigns(designs => {
      setUserState(prev => ({ ...prev, recentDesigns: designs }));
    });
    const unsubLeads = subscribeLeads(leads => {
      setUserState(prev => ({ ...prev, leads }));
    });
    const unsubCatalog = subscribeCatalogProducts(supabaseCatalog => {
      setCatalogProducts(mergeCatalog(loadProductsFromCsv(), supabaseCatalog));
    });
    const unsubFlows = subscribeEmailFlows(setEmailFlows);
    return () => {
      unsubDesigns();
      unsubLeads();
      unsubCatalog();
      unsubFlows();
    };
  }, []);

  // Persist theme + local-only prefs; keep a simple theme class on body.
  useEffect(() => {
    localStorage.setItem('diamond_guy_v4', JSON.stringify(userState));
    if (typeof document !== 'undefined') {
      document.body.classList.remove('dark', 'light');
      document.body.classList.add(userState.theme);
    }
  }, [userState.theme]);

  const saveDesign = useCallback(async (design: JewelleryConfig) => {
    const withExplore = { ...design, showInExplore: design.showInExplore !== false };
    setUserState(prev => ({
      ...prev,
      recentDesigns: [withExplore, ...prev.recentDesigns].slice(0, 50),
      builderDraft: {}
    }));
    await upsertDesign(withExplore);
  }, []);

  const updateDraft = useCallback((draft: Partial<JewelleryConfig>) => {
    setUserState(prev => ({ ...prev, builderDraft: draft }));
  }, []);

  const addLead = useCallback(async (lead: Lead) => {
    setUserState(prev => ({ ...prev, leads: [lead, ...prev.leads].slice(0, 100) }));
    await upsertLead(lead);
  }, []);

  const updateAllDesigns = useCallback(async (designs: JewelleryConfig[]) => {
    setUserState(prev => ({ ...prev, recentDesigns: designs }));
    await upsertDesigns(designs);
  }, []);

  const handleOrderPlaced = useCallback(async (order: { design: JewelleryConfig; lead: Lead }) => {
    const { design, lead } = order;
    setUserState(prev => ({
      ...prev,
      recentDesigns: [design, ...prev.recentDesigns].slice(0, 50),
      leads: [lead, ...prev.leads].slice(0, 100)
    }));
    await upsertDesign(design);
    await upsertLead(lead);
    // Email sequence: order_placed flow would be triggered by backend/webhook to send thank-you + follow-ups to customer
  }, []);

  const handlePartnerNudge = (configId: string) => {
    const design = userState.recentDesigns.find(d => d.id === configId);
    if (!design) return;

    const newLead: Lead = {
      id: `NUDGE-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      name: `${design.firstName} ${design.lastName} (Nudge)`,
      phone: 'Via Client Share',
      email: design.email || '',
      requestType: 'Partner Nudge',
      description: `Client sent a partner nudge for design ${configId}.`,
      date: new Date().toLocaleDateString(),
      status: 'New',
      nudgedByClient: true,
      source: 'Partner Nudge'
    };
    addLead(newLead);
  };

  const handleEditDesign = (design: JewelleryConfig) => {
    setUserState(prev => ({ ...prev, builderDraft: design }));
    setCurrentView('RingBuilder');
  };

  const toggleWishlist = useCallback((productId: string) => {
    setUserState(prev => {
      const current = prev.wishlistProductIds ?? [];
      const exists = current.includes(productId);
      const next = exists ? current.filter(id => id !== productId) : [...current, productId];
      return { ...prev, wishlistProductIds: next };
    });
  }, []);

  const toggleCompare = useCallback((productId: string) => {
    setUserState(prev => {
      const current = prev.compareProductIds ?? [];
      // If already selected, remove it.
      if (current.includes(productId)) {
        return { ...prev, compareProductIds: current.filter(id => id !== productId) };
      }
      // Add new; cap at 2 items for comparison.
      if (current.length >= 2) {
        const [, second] = current;
        return { ...prev, compareProductIds: [second, productId] };
      }
      return { ...prev, compareProductIds: [...current, productId] };
    });
  }, []);

  const clearCompare = useCallback(() => {
    setUserState(prev => ({ ...prev, compareProductIds: [] }));
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');

  // Scroll to top when navigating to a new page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView, location.pathname]);
  const navView: AppView = isBlog ? 'Blog' : (location.pathname.startsWith('/collection') ? 'Collection' : currentView);

  // Dev-only pricing lab access: requires localStorage flag + dev admin email.
  const isDevAdmin = (() => {
    if (!sessionUser?.email) return false;
    const raw = import.meta.env.VITE_DEV_PRICING_ADMINS || '';
    if (!raw.trim()) return false;
    const allowed = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    return allowed.includes(sessionUser.email.toLowerCase());
  })();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const flag = window.localStorage.getItem('tdg_dev_pricing_enabled');
      setDevPricingEnabled(flag === '1');
    } catch {
      setDevPricingEnabled(false);
    }
  }, [location.pathname]);

  // In the jeweler Operations Hub, hide the top nav by default.
  useEffect(() => {
    if (currentView === 'JewelerPortal') {
      setNavVisible(false);
    } else {
      setNavVisible(true);
    }
  }, [currentView]);

  const handleNavTo = (view: AppView) => {
    if (view === 'Blog') navigate('/blog');
    else if (view === 'Collection') { navigate('/collection'); setCurrentView('Collection'); }
    else { navigate('/'); setCurrentView(view); }
  };

  const mainPt = isBlog || currentView !== 'Home' ? 'pt-24' : 'pt-0';
  const defaultLogo = (jewelerSettings?.logoUrl && String(jewelerSettings.logoUrl).trim()) ? jewelerSettings.logoUrl! : LOGO_URL;
  const logoNavbar = (jewelerSettings?.logoNavbar && String(jewelerSettings.logoNavbar).trim()) ? jewelerSettings.logoNavbar! : defaultLogo;
  const logoFooter = (jewelerSettings?.logoFooter && String(jewelerSettings.logoFooter).trim()) ? jewelerSettings.logoFooter! : defaultLogo;
  const logoQuotes = (jewelerSettings?.logoQuotes && String(jewelerSettings.logoQuotes).trim()) ? jewelerSettings.logoQuotes! : defaultLogo;
  const logoVault = (jewelerSettings?.logoVault && String(jewelerSettings.logoVault).trim()) ? jewelerSettings.logoVault! : defaultLogo;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500`}>
      {navVisible && !location.pathname.startsWith('/dev/pricing') && (
        <Navbar
          currentView={navView}
          setView={handleNavTo}
          theme={userState.theme}
          toggleTheme={() => setUserState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
          currency={userState.currency}
          setCurrency={(curr) => setUserState(prev => ({ ...prev, currency: curr }))}
          onOpenTour={() => setTourOpen(true)}
          onOpenRingSizeGuide={() => setShowRingSizeGuide(true)}
          sessionUser={sessionUser}
          logoUrl={logoNavbar}
          forceDarkNav={currentView === 'Home'}
        />
      )}
      <main className={`flex-grow pb-12 ${mainPt}`}>
        <Routes>
          <Route path="/blog/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest opacity-50">Loading…</span></div>}><Blog theme={userState.theme} onNavigateTo={handleNavTo} /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><span className="text-[10px] uppercase tracking-widest opacity-50">Loading…</span></div>}><Blog theme={userState.theme} onNavigateTo={handleNavTo} /></Suspense>} />
          <Route
            path="/collection"
            element={
              <Collection
                catalogProducts={catalogProducts}
                addLead={addLead}
                setView={setCurrentView}
                currency={userState.currency}
                theme={userState.theme}
                wishlistProductIds={userState.wishlistProductIds ?? []}
                compareProductIds={userState.compareProductIds ?? []}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
                onClearCompare={clearCompare}
              />
            }
          />
          <Route
            path="/collection/:productId"
            element={
              <ProductPage
                catalogProducts={catalogProducts}
                setView={setCurrentView}
                currency={userState.currency}
                theme={userState.theme}
                wishlistProductIds={userState.wishlistProductIds ?? []}
                compareProductIds={userState.compareProductIds ?? []}
                onToggleWishlist={toggleWishlist}
                onToggleCompare={toggleCompare}
              />
            }
          />
          <Route path="/checkout" element={<Checkout setView={setCurrentView} currency={userState.currency} theme={userState.theme} onOrderPlaced={handleOrderPlaced} />} />
          <Route path="/thank-you" element={<ThankYou setView={setCurrentView} currency={userState.currency} theme={userState.theme} />} />
          {isDevAdmin && devPricingEnabled && (
            <>
              <Route path="/dev/pricing" element={<DevPricingLab />} />
              <Route path="/dev/pricing/proposal" element={<DevPricingProposal />} />
            </>
          )}
          <Route path="*" element={
            <>
              {currentView === 'Home' && <Home theme={userState.theme} onStart={() => setCurrentView('RingBuilder')} onLearn={() => setCurrentView('Learn')} onNavigate={handleNavTo} />}
              {currentView === 'RingBuilder' && <RingBuilder userState={userState} onSave={saveDesign} onUpdateDraft={updateDraft} sessionUser={sessionUser} hasAuth={!!supabase} logoUrl={logoQuotes} onNavigateToExplore={() => handleNavTo('Explore')} />}
              {currentView === 'Learn' && <Learn onNavigate={setCurrentView} theme={userState.theme} />}
              {currentView === 'Explore' && <Explore designs={userState.recentDesigns} addLead={addLead} setView={setCurrentView} currency={userState.currency} />}
              {currentView === 'Resources' && <Resources logoUrl={logoVault} />}
              {currentView === 'Chatbot' && <Chatbot onNavigate={setCurrentView} onLeadSubmit={addLead} theme={userState.theme} />}
              {currentView === 'Portal' && (
                <Portal
                  userState={userState}
                  setView={setCurrentView}
                  onNudge={handlePartnerNudge}
                  onEditDesign={handleEditDesign}
                  hasAuth={!!supabase}
                  sessionUser={sessionUser}
                  wishlistProducts={catalogProducts.filter(p => (userState.wishlistProductIds ?? []).includes(p.id))}
                  onToggleWishlist={toggleWishlist}
                />
              )}
              {currentView === 'JewelerPortal' && (
                <JewelerPortal
                  userState={userState}
                  onUpdate={updateAllDesigns}
                  onLeadsUpdate={(leads) => { setUserState(prev => ({ ...prev, leads })); upsertLeads(leads); }}
                  catalogProducts={catalogProducts}
                  onCatalogUpdate={setCatalogProducts}
                  emailFlows={emailFlows}
                  onEmailFlowsUpdate={setEmailFlows}
                  jewelerSettings={jewelerSettings}
                  onJewelerSettingsRefresh={refreshJewelerSettings}
                  sessionUser={sessionUser}
                  onShowMainNav={() => setNavVisible(true)}
                />
              )}
              {currentView === 'Track' && <OrderTracking designs={userState.recentDesigns} sessionUser={sessionUser} hasAuth={!!supabase} currency={userState.currency} onNavigate={handleNavTo} googleReviewUrl={jewelerSettings?.googleReviewUrl ?? undefined} />}
              {currentView === 'Book' && <BookConsultation theme={userState.theme} onNavigate={handleNavTo} openingHours={jewelerSettings?.openingHours ?? undefined} address={jewelerSettings?.address} />}
              {currentView === 'Terms' && <Terms content={jewelerSettings?.termsAndConditions} />}
              {currentView === 'About' && <About theme={userState.theme} content={jewelerSettings?.aboutUs} />}
            </>
          } />
        </Routes>
      </main>

      <div className="opacity-0 hover:opacity-100 transition-opacity fixed bottom-0 left-0 p-2 z-[60]">
        <button onClick={() => { handleNavTo('JewelerPortal'); }} className="text-[6px] uppercase tracking-widest text-current opacity-20">Admin CRM</button>
      </div>

      {!location.pathname.startsWith('/dev/pricing') && (
        <Footer
          theme={userState.theme}
          onNavigate={handleNavTo}
          onOpenTour={() => setTourOpen(true)}
          onOpenRingSizeGuide={() => setShowRingSizeGuide(true)}
          hours={jewelerSettings?.openingHours ?? undefined}
          logoUrl={logoFooter}
          address={jewelerSettings?.address ?? TDG_ADDRESS}
        />
      )}
      {!location.pathname.startsWith('/dev/pricing') && (
        <>
          <RingSizeGuideModal
            isOpen={showRingSizeGuide}
            onClose={() => setShowRingSizeGuide(false)}
            theme={userState.theme}
          />
          <PasswordRecoveryModal
            isOpen={showPasswordRecovery}
            onClose={() => setShowPasswordRecovery(false)}
            theme={userState.theme}
          />
          <FloatingConcierge onNavigate={handleNavTo} theme={userState.theme} />
        </>
      )}
      <TutorialWizard
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        onNavigate={handleNavTo}
        currentView={currentView}
        theme={userState.theme}
      />
    </div>
  );
};

export default App;
