
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Box, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { AppView } from '../types';

const STORAGE_KEY = 'tdg_tour_dismissed';

export function getTourDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setTourDismissed(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {}
}

interface Step {
  title: string;
  body: string;
  icon: React.ReactNode;
  action?: { label: string; view: AppView };
}

interface TutorialWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
  theme: 'dark' | 'light';
}

const TutorialWizard: React.FC<TutorialWizardProps> = ({ isOpen, onClose, onNavigate, currentView, theme }) => {
  const [step, setStep] = useState(0);
  const isDark = theme === 'dark';

  const steps: Step[] = [
    {
      title: 'Design your piece',
      body: 'Use the Builder to choose jewellery type, metal, stones and style—or explore Learn first if you’re new to the 4Cs and metals.',
      icon: <Sparkles size={28} className="opacity-80" />,
      action: { label: 'Open Builder', view: 'RingBuilder' }
    },
    {
      title: 'Save to your Vault',
      body: 'When you’re happy with your design, save it. It appears in your Vault (Portal), and we’ll send you a detailed quote.',
      icon: <Box size={28} className="opacity-80" />,
      action: { label: 'Open Vault', view: 'Portal' }
    },
    {
      title: 'Approve & pay deposit',
      body: 'Once we approve your proposal, you’ll see an “Approved — pay deposit” notice and a deposit link in your Vault. Use it to pay 50% and start production.',
      icon: <CreditCard size={28} className="opacity-80" />,
      action: { label: 'Open Vault', view: 'Portal' }
    },
    {
      title: 'We craft & you collect',
      body: 'We source your stone, cast and set your piece, then notify you when it’s ready. You can track progress and collect or arrange shipping.',
      icon: <CheckCircle size={28} className="opacity-80" />
    }
  ];

  const s = steps[step];
  const canNext = step < steps.length - 1;
  const canPrev = step > 0;

  const handleClose = () => {
    setTourDismissed();
    onClose();
  };

  const handleAction = () => {
    if (s.action) {
      onNavigate(s.action.view);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="How it works"
        className={`relative w-full max-w-md rounded-lg border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-black/10 text-black'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-current/10">
          <span className="text-[10px] uppercase tracking-widest opacity-70">How it works</span>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-current/10 transition-colors"
            aria-label="Close tour"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-8">
          <div className={`flex items-center justify-center w-14 h-14 rounded-full mb-6 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
            {s.icon}
          </div>
          <h3 className="text-lg font-semibold tracking-tight mb-2">{s.title}</h3>
          <p className="text-sm leading-relaxed opacity-80 mb-6">{s.body}</p>

          {s.action && (
            <button
              onClick={handleAction}
              className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all ${
                isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {s.action.label}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-current/10">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={!canPrev}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <span className="text-[10px] uppercase tracking-widest opacity-60">
            {step + 1} / {steps.length}
          </span>
          <button
            onClick={() => (canNext ? setStep(step + 1) : handleClose())}
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-90 hover:opacity-100"
          >
            {canNext ? 'Next' : 'Done'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialWizard;
