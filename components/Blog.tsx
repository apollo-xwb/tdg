import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BLOG_ARTICLES,
  BLOG_CATEGORIES,
  getArticleBySlug,
  type BlogArticle,
  type BlogCategory,
  type BodyBlock
} from '../data/blogArticles';
import { getBlogImage } from '../data/blogAssets';
import { AppView } from '../types';
import RingSizeTable from './RingSizeTable';
import RingSizeVisualizer from './RingSizeVisualizer';
import {
  ArrowLeft,
  Clock,
  Ruler,
  Calculator,
  Palette,
  MessageCircle,
  BookOpen,
  Search,
  ChevronRight
} from 'lucide-react';

const SITE_TITLE = 'The Diamond Guy | Luxury Jewelry Configurator';
const SITE_DESCRIPTION = 'Custom engagement rings and fine jewellery. Design your perfect piece with our configurator. Ethically sourced. Certified. Cape Town.';

interface BlogProps {
  theme: 'dark' | 'light';
  onNavigateTo: (view: AppView) => void;
}

export default function Blog({ theme, onNavigateTo }: BlogProps) {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BlogCategory | 'All'>('All');

  const article = slug ? getArticleBySlug(slug) : null;

  // ——— SEO: document title and meta ———
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (article) {
      const prevTitle = document.title;
      const prevDesc = meta?.getAttribute('content') || '';
      document.title = `${article.title} | The Diamond Guy`;
      if (meta) meta.setAttribute('content', article.metaDescription);
      return () => {
        document.title = prevTitle;
        if (meta) meta.setAttribute('content', prevDesc);
      };
    }
    if (slug) return; // 404: leave as-is
    document.title = 'Blog | The Diamond Guy';
    if (meta) meta.setAttribute('content', 'Expert guides on engagement rings, diamonds, metals, and buying. Tools, tips, and SEO-focused articles to help you choose with confidence.');
    return () => {
      document.title = SITE_TITLE;
      if (meta) meta.setAttribute('content', SITE_DESCRIPTION);
    };
  }, [article, slug]);

  const filtered = useMemo(() => {
    let list = BLOG_ARTICLES;
    if (categoryFilter !== 'All')
      list = list.filter(a => a.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categoryFilter, search]);

  // ——— Article view ———
  if (article) {
    return (
      <ArticleView
        article={article}
        isDark={isDark}
        onBack={() => navigate('/blog')}
        onNavigateTo={onNavigateTo}
      />
    );
  }

  // ——— 404: unknown slug ———
  if (slug) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-medium tracking-tight mb-4">Article not found</h2>
        <p className="opacity-60 mb-8">The page you’re looking for doesn’t exist or has been moved.</p>
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16 animate-fadeIn">
      <header className="text-center space-y-6 mb-14">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">Expert Guides & Tools</p>
        <h1 className="text-4xl lg:text-6xl font-thin tracking-tighter uppercase">The Diamond Guy Blog</h1>
        <p className="max-w-xl mx-auto opacity-50 font-light leading-relaxed text-sm">
          SEO-focused guides on engagement rings, diamonds, metals, and buying—with practical tools and tips to help you choose with confidence.
        </p>
      </header>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 text-sm border bg-transparent placeholder:opacity-40 focus:outline-none focus:ring-1 ${
              isDark ? 'border-white/10 focus:ring-white/30' : 'border-black/10 focus:ring-black/20'
            }`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
              categoryFilter === 'All'
                ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                : 'border-current/20 opacity-60 hover:opacity-100'
            }`}
          >
            All
          </button>
          {BLOG_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest border transition-all ${
                categoryFilter === c.id
                  ? isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                  : 'border-current/20 opacity-60 hover:opacity-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Article grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(a => (
          <article
            key={a.slug}
            onClick={() => navigate(`/blog/${a.slug}`)}
            className={`group cursor-pointer border transition-all duration-300 overflow-hidden ${
              isDark ? 'border-white/10 hover:border-white/25' : 'border-black/10 hover:border-black/25'
            }`}
          >
            <div className={`aspect-[4/3] flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <BookOpen className="w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="p-5 lg:p-6 space-y-3">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest opacity-50">
                <span>{a.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.readTimeMinutes} min</span>
              </div>
              <h2 className="text-lg lg:text-xl font-medium tracking-tight group-hover:opacity-80 transition-opacity line-clamp-2">
                {a.title}
              </h2>
              <p className="text-sm opacity-60 line-clamp-2">{a.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">
                Read more <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-16 opacity-50">No articles match your filters. Try a different search or category.</p>
      )}
    </div>
  );
}

// ——— Embedded ring size tool (table + visualizer when a size is selected) ———
function BlogRingSizeTool() {
  const [selected, setSelected] = useState<{ diameterMM: string; circumferenceMM: string } | null>(null);
  return (
    <div className="my-10 space-y-6">
      <p className="text-sm font-medium opacity-80">Use the table below to find your size. Tap or click a row to see the actual ring diameter.</p>
      <RingSizeTable onSelectRow={(row) => setSelected(row)} />
      {selected && (
        <div className="flex flex-col items-center pt-4 border-t border-current/10">
          <RingSizeVisualizer
            diameterMM={parseFloat(selected.diameterMM)}
            circumferenceMM={parseFloat(selected.circumferenceMM)}
          />
        </div>
      )}
    </div>
  );
}

// ——— Article view ———
function ArticleView({
  article,
  isDark,
  onBack,
  onNavigateTo
}: {
  article: BlogArticle;
  isDark: boolean;
  onBack: () => void;
  onNavigateTo: (v: AppView) => void;
}) {

  // JSON-LD Article schema
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      datePublished: article.publishedAt,
      author: { '@type': 'Organization', name: 'The Diamond Guy' }
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [article]);

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12 animate-fadeIn">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity mb-10"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to blog
      </button>

      <header className="space-y-4 mb-12">
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-widest opacity-50">
          <span>{article.category}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTimeMinutes} min read</span>
          <span>·</span>
          <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
        </div>
        <h1 className="text-3xl lg:text-4xl font-medium tracking-tight">{article.title}</h1>
        <p className="text-lg opacity-60">{article.excerpt}</p>
      </header>

      <div className="prose-custom space-y-6">
        {article.body.map((block, i) => (
          <Block key={i} block={block} isDark={isDark} onNavigateTo={onNavigateTo} />
        ))}
      </div>

      <footer className="mt-16 pt-10 border-t border-current/10">
        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-6">Ready to design yours?</p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigateTo('RingBuilder')}
            className={`px-6 py-3 border border-current text-[10px] uppercase tracking-widest transition-all ${isDark ? 'hover:bg-white hover:text-black' : 'hover:bg-black hover:text-white'}`}
          >
            Start the ring builder
          </button>
          <button
            onClick={() => onNavigateTo('Chatbot')}
            className="px-6 py-3 border border-current/30 text-[10px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-all"
          >
            Ask the Concierge
          </button>
        </div>
      </footer>
    </div>
  );
}

// ——— Render a single body block ———
function Block({
  block,
  isDark,
  onNavigateTo
}: {
  block: BodyBlock;
  isDark: boolean;
  onNavigateTo: (v: AppView) => void;
}) {
  const hoverInv = isDark ? 'hover:bg-white hover:text-black' : 'hover:bg-black hover:text-white';
  const solidInv = isDark ? 'bg-white text-black' : 'bg-black text-white';
  if (block.type === 'p') {
    return <p className="leading-relaxed opacity-90">{block.content}</p>;
  }
  if (block.type === 'h2') {
    return <h2 className="text-xl lg:text-2xl font-medium tracking-tight mt-10 mb-4 first:mt-0">{block.content}</h2>;
  }
  if (block.type === 'h3') {
    return <h3 className="text-lg font-medium tracking-tight mt-8 mb-3">{block.content}</h3>;
  }
  if (block.type === 'ul') {
    return (
      <ul className="list-disc list-inside space-y-2 opacity-90 pl-2">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'ol') {
    return (
      <ol className="list-decimal list-inside space-y-2 opacity-90 pl-2">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    );
  }
  if (block.type === 'tool') {
    const conf: Record<string, { icon: React.ReactNode; label: string; view: AppView }> = {
      'ring-size': { icon: <Ruler className="w-5 h-5" />, label: 'See ring size guide', view: 'Resources' },
      budget: { icon: <Calculator className="w-5 h-5" />, label: 'Explore in the builder', view: 'RingBuilder' },
      configurator: { icon: <Palette className="w-5 h-5" />, label: 'Start the ring builder', view: 'RingBuilder' },
      concierge: { icon: <MessageCircle className="w-5 h-5" />, label: 'Chat with Concierge', view: 'Chatbot' }
    };
    const c = conf[block.id] || { icon: <BookOpen className="w-5 h-5" />, label: 'Learn more', view: 'Resources' as AppView };
    return (
      <div className={`my-8 p-6 border ${isDark ? 'border-white/15 bg-white/5' : 'border-black/10 bg-black/5'}`}>
        {block.title && <p className="font-medium mb-3">{block.title}</p>}
        <button
          onClick={() => onNavigateTo(c.view)}
          className={`inline-flex items-center gap-3 px-5 py-2.5 border border-current text-[10px] uppercase tracking-widest transition-all ${hoverInv}`}
        >
          {c.icon}
          {c.label}
        </button>
      </div>
    );
  }
  if (block.type === 'cta') {
    const viewMap: Record<string, AppView> = {
      RingBuilder: 'RingBuilder',
      Chatbot: 'Chatbot',
      Resources: 'Resources'
    };
    const v = viewMap[block.to] || 'RingBuilder';
    return (
      <div className="my-6">
        <button
          onClick={() => onNavigateTo(v)}
          className={`inline-flex items-center gap-2 px-6 py-3 text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity ${solidInv}`}
        >
          {block.label} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }
  if (block.type === 'image') {
    const src = getBlogImage(block.id);
    if (!src) return null;
    return (
      <figure className="my-8">
        <img src={src} alt={block.caption || block.id} className="w-full max-w-md mx-auto object-contain" />
        {block.caption && <figcaption className="text-center text-sm opacity-60 mt-2">{block.caption}</figcaption>}
      </figure>
    );
  }
  if (block.type === 'ringSizeTool') {
    return <BlogRingSizeTool />;
  }
  return null;
}
