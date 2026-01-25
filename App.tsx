
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { AppView, UserState, JewelleryConfig, Lead } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import RingBuilder from './components/RingBuilder';
import Learn from './components/Learn';
import Chatbot from './components/Chatbot';
import Portal from './components/Portal';
import Resources from './components/Resources';
import Blog from './components/Blog';
import FloatingConcierge from './components/FloatingConcierge';
import JewelerPortal from './components/JewelerPortal';
import Terms from './components/Terms';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('Home');
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('diamond_guy_v4');
    if (saved) return JSON.parse(saved);
    return {
      diamondIQ: [],
      recentDesigns: [],
      leads: [],
      currency: 'ZAR',
      theme: 'dark',
      builderDraft: {}
    };
  });

  useEffect(() => {
    localStorage.setItem('diamond_guy_v4', JSON.stringify(userState));
    document.body.className = userState.theme;
  }, [userState]);

  const saveDesign = (design: JewelleryConfig) => {
    setUserState(prev => ({
      ...prev,
      recentDesigns: [design, ...prev.recentDesigns].slice(0, 50),
      builderDraft: {} // Clear draft after saving
    }));
  };

  const updateDraft = useCallback((draft: Partial<JewelleryConfig>) => {
    setUserState(prev => ({ ...prev, builderDraft: draft }));
  }, []);

  const addLead = (lead: Lead) => {
    setUserState(prev => ({
      ...prev,
      leads: [lead, ...prev.leads].slice(0, 100)
    }));
  };

  const updateAllDesigns = (designs: JewelleryConfig[]) => {
    setUserState(prev => ({ ...prev, recentDesigns: designs }));
  };

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
      nudgedByClient: true
    };
    addLead(newLead);
  };

  const handleEditDesign = (design: JewelleryConfig) => {
    setUserState(prev => ({ ...prev, builderDraft: design }));
    setCurrentView('RingBuilder');
  };

  const location = useLocation();
  const navigate = useNavigate();
  const isBlog = location.pathname === '/blog' || location.pathname.startsWith('/blog/');
  const navView: AppView = isBlog ? 'Blog' : currentView;

  const handleNavTo = (view: AppView) => {
    if (view === 'Blog') {
      navigate('/blog');
    } else {
      navigate('/');
      setCurrentView(view);
    }
  };

  const mainPt = isBlog || currentView !== 'Home' ? 'pt-24' : 'pt-0';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500`}>
      <Navbar
        currentView={navView}
        setView={handleNavTo}
        theme={userState.theme}
        toggleTheme={() => setUserState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))}
        currency={userState.currency}
        setCurrency={(curr) => setUserState(prev => ({ ...prev, currency: curr }))}
      />
      <main className={`flex-grow pb-12 ${mainPt}`}>
        <Routes>
          <Route path="/blog/:slug" element={<Blog theme={userState.theme} onNavigateTo={handleNavTo} />} />
          <Route path="/blog" element={<Blog theme={userState.theme} onNavigateTo={handleNavTo} />} />
          <Route path="*" element={
            <>
              {currentView === 'Home' && <Home onStart={() => setCurrentView('RingBuilder')} onLearn={() => setCurrentView('Learn')} />}
              {currentView === 'RingBuilder' && <RingBuilder userState={userState} onSave={saveDesign} onUpdateDraft={updateDraft} />}
              {currentView === 'Learn' && <Learn onNavigate={setCurrentView} theme={userState.theme} />}
              {currentView === 'Resources' && <Resources />}
              {currentView === 'Chatbot' && <Chatbot onNavigate={setCurrentView} onLeadSubmit={addLead} />}
              {currentView === 'Portal' && <Portal userState={userState} setView={setCurrentView} onNudge={handlePartnerNudge} onEditDesign={handleEditDesign} />}
              {currentView === 'JewelerPortal' && <JewelerPortal userState={userState} onUpdate={updateAllDesigns} onLeadsUpdate={(leads) => setUserState(prev => ({ ...prev, leads }))} />}
              {currentView === 'Terms' && <Terms />}
            </>
          } />
        </Routes>
      </main>

      <div className="opacity-0 hover:opacity-100 transition-opacity fixed bottom-0 left-0 p-2 z-[60]">
        <button onClick={() => { handleNavTo('JewelerPortal'); }} className="text-[6px] uppercase tracking-widest text-current opacity-20">Admin CRM</button>
      </div>

      <Footer theme={userState.theme} onNavigate={handleNavTo} />
      <FloatingConcierge onNavigate={handleNavTo} />
    </div>
  );
};

export default App;
