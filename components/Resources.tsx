import React, { useState, useEffect } from 'react';
import { Download, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { getJewelerEmail } from '../lib/supabase';
import { fetchVaultGuides } from '../lib/supabase';
import type { VaultGuide } from '../types';

import weddingPdfUrl from '../src/Downloads/Wedding_Planner_Download_Instructions.pdf?url';
import ringGuidePdfUrl from '../src/Downloads/Engagement_Ring_Guide.pdf?url';

const DEFAULT_GUIDES: { id: string; title: string; desc: string; url: string; filename: string; tags: string[]; icon: 'calendar' | 'shield' }[] = [
  {
    id: 'default-wedding',
    title: 'The Bespoke Wedding Planning Template',
    desc: 'A comprehensive master template for the modern couple. From venue logistics to guest-list management, structured by industry experts.',
    url: weddingPdfUrl,
    filename: 'Wedding_Planner_Download_Instructions.pdf',
    tags: ['Planning', 'PDF', 'Download'],
    icon: 'calendar',
  },
  {
    id: 'default-ring',
    title: 'The Ultimate Ring Buying Dossier',
    desc: 'Confidential market insights on diamond pricing, stone selection secrets, and a checklist for ensuring the perfect fit and quality.',
    url: ringGuidePdfUrl,
    filename: 'Engagement_Ring_Guide.pdf',
    tags: ['Educational', 'PDF', 'Ring Guide'],
    icon: 'shield',
  },
];

const Resources: React.FC<{ logoUrl?: string }> = ({ logoUrl }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [guides, setGuides] = useState<VaultGuide[]>([]);
  const defaultLogo = 'https://www.thediamondguy.co.za/wp-content/uploads/2019/08/the-diamond-guy-retina-logo-02.png';
  const logoSrc = logoUrl || defaultLogo;

  useEffect(() => {
    const jewelerId = getJewelerEmail();
    fetchVaultGuides(jewelerId || undefined).then(setGuides);
  }, []);

  const handleDownloadUrl = (url: string, filename: string, id: string) => {
    setDownloading(id);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download';
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloading(null), 800);
  };

  const defaultItems = DEFAULT_GUIDES.map((g) => ({
    id: g.id,
    title: g.title,
    desc: g.desc,
    url: g.url,
    filename: g.filename,
    tags: g.tags,
    icon: g.icon,
  }));
  const customItems = guides.map((g) => ({
    id: g.id,
    title: g.title,
    desc: g.description,
    url: g.downloadUrl,
    filename: g.suggestedFilename || 'download',
    tags: g.tags.length ? g.tags : ['PDF'],
    icon: 'shield' as const,
  }));
  const items = [...defaultItems, ...customItems];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-fadeIn space-y-24">
      <header className="text-center space-y-8">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-68">Knowledge is Luxury</p>
        <h1 className="text-5xl lg:text-7xl font-thin tracking-tighter uppercase">The Digital Vault</h1>
        <p className="max-w-xl mx-auto opacity-75 font-light leading-relaxed">
          Access our exclusive collection of dossiers and planning tools, designed to simplify the complex world of fine jewelry and matrimonial prep.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        {items.map((item) => (
          <ResourceCard
            key={item.id}
            title={item.title}
            desc={item.desc}
            icon={item.icon === 'calendar' ? <Calendar size={48} strokeWidth={0.5} /> : <ShieldCheck size={48} strokeWidth={0.5} />}
            isDownloading={downloading === item.id}
            onDownload={() => handleDownloadUrl(item.url, item.filename, item.id)}
            tags={item.tags}
          />
        ))}
      </div>

      <section className="glass p-12 lg:p-20 rounded-sm border border-current/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
           <img src={logoSrc} alt="" className="w-full h-full object-contain scale-150 logo-invert" />
        </div>
        <div className="max-w-2xl space-y-10 relative z-10">
           <h2 className="text-3xl lg:text-4xl font-thin tracking-tighter uppercase">Need a Tailored Brief?</h2>
           <p className="opacity-75 leading-relaxed font-light">
             If our standard guides don't cover your specific requirements, our concierge is available to compile a custom market report for your specific stone interest.
           </p>
           <button className="px-10 py-5 bg-white text-black text-[10px] uppercase tracking-[0.5em] font-bold hover:bg-gray-200 transition-all flex items-center gap-4">
              Consult with Concierge <ArrowRight size={14} />
           </button>
        </div>
      </section>
    </div>
  );
};

const ResourceCard = ({ title, desc, icon, isDownloading, onDownload, tags }: any) => (
  <div className="group flex flex-col h-full glass border border-current/5 hover:border-current/20 transition-all duration-500 rounded-sm overflow-hidden p-10 lg:p-12 space-y-10">
    <div className="flex justify-between items-start">
      <div className="text-current opacity-20 group-hover:opacity-100 transition-opacity duration-700">
        {icon}
      </div>
      <div className="flex gap-2">
        {tags.map((t: string) => (
          <span key={t} className="text-[8px] uppercase tracking-widest border border-current/10 px-2 py-1 opacity-40">{t}</span>
        ))}
      </div>
    </div>

    <div className="space-y-6 flex-grow">
      <h3 className="text-2xl lg:text-3xl font-thin tracking-tight uppercase leading-tight">{title}</h3>
      <p className="text-sm opacity-72 font-light leading-relaxed">{desc}</p>
    </div>

    <button 
      onClick={onDownload}
      disabled={isDownloading}
      className={`w-full py-5 border flex items-center justify-center gap-4 transition-all uppercase tracking-[0.4em] text-[10px] ${
        isDownloading 
        ? 'bg-current/5 border-current/20 opacity-50 cursor-not-allowed' 
        : 'border-current/10 hover:bg-current hover:text-white group-hover:border-current'
      }`}
    >
      {isDownloading ? (
        <>Preparing Asset...</>
      ) : (
        <>
          <Download size={14} /> Request Access & Download
        </>
      )}
    </button>
  </div>
);

export default Resources;
