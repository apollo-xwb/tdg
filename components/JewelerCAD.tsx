import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Copy, Code, FileText, Image, Layout, Sparkles, Upload } from 'lucide-react';
import RingPlayground3D, {
  DEFAULT_PARAMS,
  RING_SIZE_TO_MM,
  CARAT_TO_MM,
  CAD_METAL_OPTIONS,
  type RingPlaygroundParams,
} from './RingPlayground3D';
import CustomSelect from './CustomSelect';

const CAD_SYSTEM_PROMPT = `You are a professional-grade, manufacturing-accurate jewelry CAD generator built exclusively for working jewelers.

Your ONLY job is to produce ready-to-cast, dimensionally precise OpenSCAD code (parametric, commented, with all variables at the top) + a full professional spec sheet + client-ready pitch deck.

STRICT RULES (never break these):
- Every single dimension must be in REAL mm, accurate to 0.1 mm.
- Use the real diamond/gem size tables provided.
- Always include 0.20–0.30 mm girdle seat clearance, 0.8–1.2 mm prong thickness, proper prong height (stone height × 0.75–0.85), and under-gallery relief for casting.
- At the very top of the code add a comment: "Scale STL by 1.018 for 18k gold before printing".
- Stone placeholders are cylinders (for preview) with %color("cyan") so they show but don't export.
- All code must be copy-paste ready into OpenSCAD (latest version) and render cleanly with $fn=120 minimum.
- Never guess sizes. If critical data is missing, state it in a short note.

STANDARD REFERENCE TABLES:
Round Brilliant Diamond mm ↔ Carat (GIA approx):
0.25 ct → 4.1 mm | 0.50 ct → 5.1 mm | 0.75 ct → 5.9 mm | 1.00 ct → 6.5 mm | 1.25 ct → 7.0 mm | 1.50 ct → 7.4 mm | 2.00 ct → 8.2 mm | 2.50 ct → 8.8 mm | 3.00 ct → 9.4 mm

Ring size (inner diameter mm): Size 5 → 15.6 | 6 → 16.5 | 7 → 17.3 | 8 → 18.1 | 9 → 19.0 | 10 → 19.8 | 11 → 20.6 | 12 → 21.4 | 13 → 22.2

Prong rules: 4-prong round: prong base 1.0–1.2 mm wide, tip 0.6–0.8 mm. Height above stone girdle: 0.6–0.8 × stone radius. Always add small notch/girdle grab.

MATERIALS (offer these): 18k Yellow Gold, 18k White Gold, 18k Rose Gold, Platinum 950, 14k Yellow/White for cost.

OUTPUT FORMAT (follow exactly). Return the response in this exact structure using these section headers so they can be parsed:

---SECTION 1 OPENSCAD---
(full OpenSCAD code only, variables at top, no markdown code fence)
---SECTION 2 SPEC---
(markdown table: Piece name, Metal, Finger size, Center stone carat|mm|cut, Side stones, Total diamond weight, Band width, Head height, Total height, Estimated metal weight g, Casting notes)
---SECTION 3 PREVIEW IMAGES---
1. Front view on finger: (one sentence image prompt)
2. 45° angled view studio: (one sentence image prompt)
3. Top-down macro setting: (one sentence image prompt)
---SECTION 4 PITCH DECK---
Slide 1 | Title | Body text | Image prompt
Slide 2 | ... (6 to 8 slides total)
(end with ---END---)`;

function parseCADResponse(raw: string): {
  openScad: string;
  spec: string;
  previewPrompts: string[];
  pitchSlides: { title: string; body: string; imagePrompt: string }[];
} {
  const openScad = (raw.match(/---SECTION 1 OPENSCAD---\s*([\s\S]*?)---SECTION 2 SPEC---/)?.[1] ?? '').trim();
  const spec = (raw.match(/---SECTION 2 SPEC---\s*([\s\S]*?)---SECTION 3 PREVIEW IMAGES---/)?.[1] ?? '').trim();
  const previewBlock = (raw.match(/---SECTION 3 PREVIEW IMAGES---\s*([\s\S]*?)---SECTION 4 PITCH DECK---/)?.[1] ?? '').trim();
  const pitchBlock = (raw.match(/---SECTION 4 PITCH DECK---\s*([\s\S]*?)(---END---|$)/)?.[1] ?? '').trim();

  const previewPrompts: string[] = [];
  previewBlock.split(/\n/).forEach(line => {
    const m = line.match(/^\d+\.\s*(.+?)(?:\s*:\s*)?(.+)$/);
    if (m) previewPrompts.push((m[2] || m[1]).trim());
    else if (line.trim()) previewPrompts.push(line.trim());
  });

  const pitchSlides: { title: string; body: string; imagePrompt: string }[] = [];
  pitchBlock.split(/\n/).forEach(line => {
    const parts = line.split(/\s*\|\s*/).map(p => p.trim());
    if (parts.length >= 3 && parts[0].toLowerCase().startsWith('slide'))
      pitchSlides.push({ title: parts[1] || '', body: parts[2] || '', imagePrompt: parts[3] || '' });
    else if (parts.length >= 3)
      pitchSlides.push({ title: parts[0] || '', body: parts[1] || '', imagePrompt: parts[2] || '' });
  });

  return { openScad, spec, previewPrompts, pitchSlides };
}

/** Extract numeric vars from OpenSCAD code for playground */
function parseOpenSCADVars(code: string): Partial<RingPlaygroundParams> {
  const vars: Partial<RingPlaygroundParams> = {};
  const patterns: { key: keyof RingPlaygroundParams; pattern: RegExp; scale?: number }[] = [
    { key: 'ringInnerDiaMm', pattern: /ring_inner_dia\s*=\s*([\d.]+)/ },
    { key: 'bandWidthMm', pattern: /band_width\s*=\s*([\d.]+)/ },
    { key: 'bandThicknessMm', pattern: /(?:band_thickness|band_thick)\s*=\s*([\d.]+)/ },
    { key: 'centerStoneDiaMm', pattern: /(?:center_dia|center_stone_dia)\s*=\s*([\d.]+)/ },
    { key: 'headHeightMm', pattern: /(?:head_height|head_height_mm)\s*=\s*([\d.]+)/ },
    { key: 'sideStoneCount', pattern: /(?:side_stone_count|side_count)\s*=\s*(\d+)/ },
    { key: 'sideStoneDiaMm', pattern: /(?:side_dia|side_stone_dia)\s*=\s*([\d.]+)/ },
  ];
  patterns.forEach(({ key, pattern }) => {
    const m = code.match(pattern);
    if (m) {
      const v = key === 'sideStoneCount' ? parseInt(m[1], 10) : parseFloat(m[1]);
      if (v != null && !Number.isNaN(v)) (vars as any)[key] = v;
    }
  });
  if (vars.centerStoneDiaMm != null && vars.headHeightMm == null)
    vars.headHeightMm = vars.centerStoneDiaMm * 0.65;
  return vars;
}

interface JewelerCADProps {
  jewelerName?: string;
  theme?: 'dark' | 'light';
}

export default function JewelerCAD({ jewelerName = 'Jeweler', theme = 'dark' }: JewelerCADProps) {
  const [brief, setBrief] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [fingerSize, setFingerSize] = useState<number>(7);
  const [centerCarat, setCenterCarat] = useState<number>(1);
  const [sideCount, setSideCount] = useState(0);
  const [sideCarat, setSideCarat] = useState(0.25);
  const [metal, setMetal] = useState('18k Yellow Gold');
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openScadCode, setOpenScadCode] = useState('');
  const [specMarkdown, setSpecMarkdown] = useState('');
  const [previewPrompts, setPreviewPrompts] = useState<string[]>([]);
  const [pitchSlides, setPitchSlides] = useState<{ title: string; body: string; imagePrompt: string }[]>([]);
  const [playgroundParams, setPlaygroundParams] = useState<RingPlaygroundParams>(() => ({
    ...DEFAULT_PARAMS,
    ringInnerDiaMm: RING_SIZE_TO_MM[7] ?? 17.3,
    centerStoneDiaMm: CARAT_TO_MM[1] ?? 6.5,
    headHeightMm: 4.2,
    sideStoneCount: 0,
    metalColor: CAD_METAL_OPTIONS[0].color,
    showStones: true,
  }));

  const applyVarsToPlayground = useCallback(() => {
    if (!openScadCode.trim()) return;
    const parsed = parseOpenSCADVars(openScadCode);
    setPlaygroundParams(prev => ({
      ...prev,
      ...parsed,
      centerStoneHeightMm: parsed.centerStoneDiaMm != null ? parsed.centerStoneDiaMm * 0.6 : prev.centerStoneHeightMm,
    }));
  }, [openScadCode]);

  const handleGenerate = async () => {
    if (!brief.trim()) {
      setError('Please enter a ring brief (description, or reference details).');
      return;
    }
    if (!process.env.API_KEY) {
      setError('Missing Gemini API key. Configure API_KEY in your environment.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userPrompt = [
        `Brief: ${brief}`,
        `Finger size: ${fingerSize} (inner Ø ${RING_SIZE_TO_MM[fingerSize] ?? 17.3} mm)`,
        `Center stone: ${centerCarat} ct (${CARAT_TO_MM[centerCarat] ?? 6.5} mm)`,
        sideCount > 0 ? `Side stones: ${sideCount} × ${sideCarat} ct each` : 'Side stones: none',
        `Metal: ${metal}`,
        specialRequests.trim() ? `Special: ${specialRequests}` : '',
      ].filter(Boolean).join('\n');

      const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: userPrompt }];
      if (referenceImage.startsWith('data:')) {
        const m = referenceImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
        if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }],
        config: { systemInstruction: CAD_SYSTEM_PROMPT },
      });

      const raw = (response as any).text?.trim?.() || '';
      const parsed = parseCADResponse(raw);
      setOpenScadCode(parsed.openScad || raw);
      setSpecMarkdown(parsed.spec);
      setPreviewPrompts(parsed.previewPrompts);
      setPitchSlides(parsed.pitchSlides);

      const vars = parseOpenSCADVars(parsed.openScad);
      const metalColorFromForm = CAD_METAL_OPTIONS.find(m => metal.toLowerCase().includes(m.id.replace(/_/g, ' ')))?.color ?? (metal.toLowerCase().includes('platinum') ? CAD_METAL_OPTIONS[3].color : CAD_METAL_OPTIONS[0].color);
      setPlaygroundParams(prev => ({
        ...prev,
        ...vars,
        centerStoneHeightMm: (vars.centerStoneDiaMm ?? prev.centerStoneDiaMm) * 0.6,
        metalColor: metalColorFromForm,
      }));
    } catch (e) {
      console.error('CAD generate error', e);
      setError('Failed to generate CAD. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const inputClass = `w-full bg-black/50 border border-white/10 p-2 text-[12px] focus:outline-none focus:border-emerald-500/50 ${!isDark ? 'bg-white/80 border-black/10 text-black' : ''}`;
  const labelClass = `text-[11px] uppercase tracking-wider font-bold block mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl">
      <div className="glass border border-white/10 rounded-xl p-8 space-y-6">
        <p className={`text-[11px] uppercase tracking-[0.35em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
          Ready for your ring brief, {jewelerName}. Finger size, stones, metal, and any reference image or library piece?
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className={labelClass}>Ring brief (description or reference)</label>
            <textarea
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="e.g. Solitaire round brilliant, 4-prong, comfort-fit band. Or: use reference image below."
              rows={4}
              className={`${inputClass} resize-y`}
            />
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className={labelClass}>Finger size (US)</label>
                <CustomSelect
                  options={[5, 6, 7, 8, 9, 10, 11, 12, 13].map(s => ({
                    value: String(s),
                    label: `Size ${s} (${RING_SIZE_TO_MM[s]} mm)`,
                  }))}
                  value={String(fingerSize)}
                  onChange={v => setFingerSize(Number(v))}
                  theme={isDark ? 'dark' : 'light'}
                  className="min-w-[160px]"
                />
              </div>
              <div>
                <label className={labelClass}>Center stone (ct)</label>
                <CustomSelect
                  options={[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3].map(c => ({
                    value: String(c),
                    label: `${c} ct (${CARAT_TO_MM[c]} mm)`,
                  }))}
                  value={String(centerCarat)}
                  onChange={v => setCenterCarat(Number(v))}
                  theme={isDark ? 'dark' : 'light'}
                  className="min-w-[180px]"
                />
              </div>
              <div>
                <label className={labelClass}>Side stones</label>
                <CustomSelect
                  options={[0, 2, 3].map(n => ({
                    value: String(n),
                    label: n === 0 ? 'None' : `${n} stones`,
                  }))}
                  value={String(sideCount)}
                  onChange={v => setSideCount(Number(v))}
                  theme={isDark ? 'dark' : 'light'}
                  className="min-w-[140px]"
                />
              </div>
              {sideCount > 0 && (
                <div>
                  <label className={labelClass}>Side each (ct)</label>
                  <CustomSelect
                    options={[0.1, 0.15, 0.2, 0.25, 0.3].map(c => ({
                      value: String(c),
                      label: `${c} ct`,
                    }))}
                    value={String(sideCarat)}
                    onChange={v => setSideCarat(Number(v))}
                    theme={isDark ? 'dark' : 'light'}
                  />
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Metal</label>
              <CustomSelect
                options={[
                  '18k Yellow Gold',
                  '18k White Gold',
                  '18k Rose Gold',
                  'Platinum 950',
                  '14k Yellow Gold',
                  '14k White Gold',
                ].map(m => ({ value: m, label: m }))}
                value={metal}
                onChange={setMetal}
                theme={isDark ? 'dark' : 'light'}
              />
            </div>
            <div>
              <label className={labelClass}>Special requests</label>
              <input value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="e.g. cathedral, hidden halo" className={inputClass} />
            </div>
          </div>
          <div className="space-y-4">
            <label className={labelClass}>Reference image (optional)</label>
            <div
              className={`border-2 border-dashed rounded-xl p-4 text-center min-h-[120px] flex flex-col items-center justify-center ${referenceImage ? 'border-white/25 bg-white/5' : isDark ? 'border-white/12 hover:border-white/40' : 'border-black/12 hover:border-black/30'}`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="cad-ref-upload"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => setReferenceImage(String(r.result));
                  r.readAsDataURL(f);
                  e.target.value = '';
                }}
              />
              {referenceImage ? (
                <>
                  <img src={referenceImage} alt="Reference" className="max-h-28 object-contain rounded" />
                  <button type="button" onClick={() => setReferenceImage('')} className="mt-2 text-[10px] uppercase opacity-70 hover:opacity-100">Remove</button>
                </>
              ) : (
                <label htmlFor="cad-ref-upload" className="cursor-pointer flex flex-col items-center gap-2 text-[10px] uppercase tracking-wider opacity-70">
                  <Upload size={20} />
                  <span>Drop or click to upload</span>
                </label>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[11px] uppercase tracking-widest font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={14} /> {loading ? 'Generating…' : 'Generate OpenSCAD + Spec + Pitch Deck'}
        </button>
      </div>

      {(openScadCode || specMarkdown.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2"><Code size={14} /> OpenSCAD Code</h3>
              <div className="flex gap-2">
                <button type="button" onClick={applyVarsToPlayground} className="px-3 py-1.5 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5">
                  Sync vars to 3D
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(openScadCode)}
                  className="px-3 py-1.5 border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/5 flex items-center gap-1"
                >
                  <Copy size={12} /> Copy
                </button>
              </div>
            </div>
            <textarea
              value={openScadCode}
              onChange={e => setOpenScadCode(e.target.value)}
              rows={16}
              className="w-full bg-black/60 border border-white/10 p-3 text-[11px] font-mono resize-y focus:outline-none focus:border-emerald-500/50"
              spellCheck={false}
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
              <Layout size={14} /> 3D Playground
            </h3>
            <div className="flex flex-wrap gap-3 mb-2">
              <div>
                <label className="text-[9px] uppercase opacity-70 block">Metal</label>
                <CustomSelect
                  options={CAD_METAL_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
                  value={CAD_METAL_OPTIONS.find(m => m.color === playgroundParams.metalColor)?.id ?? '18k_yellow'}
                  onChange={v => {
                    const opt = CAD_METAL_OPTIONS.find(o => o.id === v);
                    if (opt) setPlaygroundParams(p => ({ ...p, metalColor: opt.color }));
                  }}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  compact
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[9px] uppercase opacity-70">Stones visible</label>
                <input type="checkbox" checked={playgroundParams.showStones} onChange={e => setPlaygroundParams(p => ({ ...p, showStones: e.target.checked }))} />
              </div>
              <div>
                <label className="text-[9px] uppercase opacity-70 block">Inner Ø (mm)</label>
                <input type="number" step={0.1} value={playgroundParams.ringInnerDiaMm} onChange={e => setPlaygroundParams(p => ({ ...p, ringInnerDiaMm: parseFloat(e.target.value) || 17.3 }))} className="w-20 bg-black/50 border border-white/10 p-1.5 text-[10px]" />
              </div>
              <div>
                <label className="text-[9px] uppercase opacity-70 block">Center stone (mm)</label>
                <input type="number" step={0.1} value={playgroundParams.centerStoneDiaMm} onChange={e => setPlaygroundParams(p => ({ ...p, centerStoneDiaMm: parseFloat(e.target.value) || 6.5 }))} className="w-20 bg-black/50 border border-white/10 p-1.5 text-[10px]" />
              </div>
            </div>
            <RingPlayground3D params={playgroundParams} className="w-full h-[280px]" theme={theme} />
          </div>
        </div>
      )}

      {specMarkdown.length > 0 && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2"><FileText size={14} /> Spec Sheet</h3>
          <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed bg-black/30 p-4 rounded-lg overflow-x-auto">
            {specMarkdown}
          </pre>
        </div>
      )}

      {previewPrompts.length > 0 && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2"><Image size={14} /> 3D Preview Image Prompts</h3>
          <ul className="list-decimal list-inside space-y-2 text-[12px] opacity-90">
            {previewPrompts.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {pitchSlides.length > 0 && (
        <div className="glass border border-white/10 rounded-xl p-6 space-y-6">
          <h3 className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2"><Layout size={14} /> Client Pitch Deck</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pitchSlides.map((slide, i) => (
              <div key={i} className="border border-white/10 rounded-lg p-4 bg-black/30 space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400/90">Slide {i + 1}: {slide.title}</p>
                <p className="text-[11px] leading-relaxed">{slide.body}</p>
                {slide.imagePrompt && <p className="text-[10px] opacity-70 italic">{slide.imagePrompt}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
