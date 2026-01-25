/**
 * SEO-optimised blog articles for The Diamond Guy.
 * Keywords and topics chosen for high search volume and commercial intent.
 */

export type BlogCategory = 'Buying' | 'Diamonds' | 'Metals' | 'Care' | 'Engagement' | 'Guide' | 'Stones';

export type BodyBlock =
  | { type: 'p'; content: string }
  | { type: 'h2'; content: string }
  | { type: 'h3'; content: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'tool'; id: 'ring-size' | 'budget' | 'configurator' | 'concierge'; title?: string }
  | { type: 'cta'; to: 'RingBuilder' | 'Chatbot' | 'Resources'; label: string }
  | { type: 'image'; id: string; caption?: string }
  | { type: 'ringSizeTool' };

export interface BlogArticle {
  slug: string;
  title: string;
  metaDescription: string;
  category: BlogCategory;
  publishedAt: string;
  readTimeMinutes: number;
  excerpt: string;
  body: BodyBlock[];
}

export const BLOG_CATEGORIES: { id: BlogCategory; label: string }[] = [
  { id: 'Buying', label: 'Buying' },
  { id: 'Diamonds', label: 'Diamonds' },
  { id: 'Metals', label: 'Metals' },
  { id: 'Care', label: 'Care' },
  { id: 'Engagement', label: 'Engagement' },
  { id: 'Guide', label: 'Guides' },
  { id: 'Stones', label: 'Stones' }
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'how-much-does-an-engagement-ring-cost',
    title: 'How Much Does an Engagement Ring Cost? (2025 Guide)',
    metaDescription: 'Engagement ring cost in 2025: realistic budgets, what you get at each price, and how to avoid overpaying. South Africa & international.',
    category: 'Buying',
    publishedAt: '2025-01-15',
    readTimeMinutes: 12,
    excerpt: 'What you should realistically expect to spend on an engagement ring—and what you get at every price point.',
    body: [
      { type: 'p', content: 'Engagement ring cost is one of the most-searched questions for soon-to-be engaged couples. The short answer: it depends on stone type, metal, and design—but you can get a beautiful, ethically sourced ring from around R15,000 to R500,000+ depending on your priorities.' },
      { type: 'h2', content: 'Average engagement ring cost' },
      { type: 'p', content: 'In South Africa and globally, reported “averages” (e.g. 2–3 months’ salary) are marketing myths, not rules. A better approach: set a budget you’re comfortable with, then maximise value within it.' },
      { type: 'ul', items: ['Lab-grown diamond solitaire (e.g. 0.5–0.7 ct): roughly R25,000–R60,000', 'Natural diamond solitaire (0.5–0.7 ct, G–H, VS): roughly R80,000–R180,000', 'Moissanite or gemstone: from roughly R15,000', 'Platinum and halos add R10,000–R25,000+ to the setting'] },
      { type: 'h2', content: 'Quality tiers: what you get at each level' },
      { type: 'p', content: 'Many jewellers frame options as "maximise size," "balance," or "super high quality." These describe the trade-off between carat and the 4Cs. Maximise size prioritises carat and accepts lower colour and clarity; super high quality prioritises near-flawless stones and tends to cap carat for a given budget.' },
      { type: 'image', id: 'Maximize Size', caption: 'Maximise size: more carat, slight warmth or inclusions; great for yellow gold.' },
      { type: 'image', id: 'Balance Size & Quality', caption: 'Balance: eye-clean, near colourless; the most popular choice for engagement rings.' },
      { type: 'image', id: 'Super High Quality', caption: 'Super high quality: ultra white, no visible imperfections; the pinnacle of brilliance.' },
      { type: 'h2', content: 'What drives the price?' },
      { type: 'p', content: 'Stone type (natural vs lab vs moissanite), carat and the 4Cs, metal (platinum vs gold vs silver), and setting style (solitaire, halo, pave) all affect cost. Custom, no-inventory jewellers often beat retail for the same specs. Always compare like-for-like: the same 4Cs, cert, and metal.' },
      { type: 'tool', id: 'budget', title: 'Get a ballpark for your budget' },
      { type: 'cta', to: 'RingBuilder', label: 'Start your design' }
    ]
  },
  {
    slug: 'lab-grown-vs-natural-diamond',
    title: 'Lab-Grown vs Natural Diamond: Which Is Better?',
    metaDescription: 'Lab vs natural diamond: durability, value, ethics, and which holds its value. An honest 2025 comparison to help you decide.',
    category: 'Diamonds',
    publishedAt: '2025-01-14',
    readTimeMinutes: 7,
    excerpt: 'Chemically identical, optically the same—but different in origin, price, and resale. Here’s how to choose.',
    body: [
      { type: 'p', content: 'Lab-grown and natural diamonds share the same crystal structure, hardness (10 on the Mohs scale), and sparkle. The main differences: origin, price, and how the market treats them over time.' },
      { type: 'h2', content: 'Key differences' },
      { type: 'ul', items: ['Natural: mined; lab: grown in weeks in a controlled environment', 'Lab typically 50–70% less than natural for the same 4Cs', 'Natural has a resale and “emotional asset” narrative; lab is newer to secondary markets', 'Both are “real” diamonds; only specialised equipment can tell them apart'] },
      { type: 'h2', content: 'When to choose lab' },
      { type: 'p', content: 'Lab is ideal if you want a larger or higher-clarity stone for your budget, prioritise ethics and traceability, and treat the ring as sentiment rather than investment.' },
      { type: 'h2', content: 'When to choose natural' },
      { type: 'p', content: 'Natural suits buyers who value geological rarity, tradition, and potential for long-term value retention—understanding that most jewellery is not bought as an investment.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare lab and natural in the builder' }
    ]
  },
  {
    slug: 'how-to-measure-ring-size-at-home',
    title: 'How to Measure Ring Size at Home (Free & Accurate)',
    metaDescription: 'Measure your ring size at home with string, paper, or a printable ring sizer. UK, US, EU size charts and when to get professionally sized.',
    category: 'Guide',
    publishedAt: '2025-01-13',
    readTimeMinutes: 14,
    excerpt: 'Simple ways to find your ring size at home—and when it’s worth a quick professional check.',
    body: [
      { type: 'p', content: 'Getting the right ring size at home is possible with a few household items or a free printable sizer. An incorrectly sized engagement or wedding ring leads to resizing, extra cost, and waiting. This guide walks you through the most reliable at-home methods, how to use conversion charts, and when to see a jeweller for a definitive measurement.' },
      { type: 'h2', content: 'Why ring size matters' },
      { type: 'p', content: "A ring that's too tight is uncomfortable and can be difficult to remove; one that's too loose risks slipping off and getting lost. Engagement and wedding rings are often worn daily for decades, so a good fit from the start saves hassle and protects your investment. Sizing errors are among the top reasons rings come back to jewellers." },
      { type: 'h2', content: 'String or paper method' },
      { type: 'p', content: "This method uses the finger's circumference. You need a non-stretch string (floss or thin cord) or a strip of paper about 1 cm wide, a ruler, and a ring size conversion chart." },
      { type: 'ol', items: ['Wrap the string or paper around the base of the finger where the ring will sit. Finger size can vary between the base and the knuckle.', 'Mark where the string or paper overlaps. Use a pen or your fingernail to make a clear mark.', 'Lay it flat and measure the length between the mark and the start in millimetres. This is the circumference.', 'Use a ring size chart to convert circumference (or diameter: circumference ÷ π) to your size in UK/SA, US, or EU.'] },
      { type: 'p', content: 'Do this two or three times and take the average. Fingers can swell with heat or time of day; measuring in the evening can help you avoid a size that is too tight when your fingers are at their largest.' },
      { type: 'h2', content: 'Use an existing ring' },
      { type: 'p', content: "If you have a ring that already fits the intended finger well, you can match it to a chart. Measure the inner diameter of the ring (the distance from one inside edge to the other, in mm) using a ruler or callipers. Wide bands (e.g. 4 mm or more) often feel tighter than thin bands; if the ring you're sizing for will have a wide band, consider going up half to a full size." },
      { type: 'h2', content: 'UK/SA vs US vs EU: which chart to use' },
      { type: 'p', content: 'UK and South African sizing usually align: letter sizes from A to Z, with half sizes. US and Canadian use a numeric scale (typically 0–13 for women). EU sizes are based on inner circumference in mm (e.g. 52, 54, 56). Always confirm which standard your jeweller uses. A size 6 in the US is not the same as a 6 in the UK. When in doubt, provide your measurement in mm—that is universal.' },
      { type: 'h2', content: 'Interactive ring size conversion tool' },
      { type: 'p', content: 'Use the table below to look up your size. Search by UK, US, or EU size, or by diameter or circumference in mm. Tap or click a row to see the actual ring diameter visualised.' },
      { type: 'ringSizeTool' },
      { type: 'h2', content: 'When to get professionally sized' },
      { type: 'p', content: "For engagement and wedding rings, we recommend a final check with a jeweller. They use calibrated ring sizers and can account for knuckle size, band width, and how you like a ring to fit. If you're proposing in secret, the at-home methods plus the tool above will get you close. Ordering slightly large is often safer than slightly small—resizing down is usually straightforward; sizing up can be limited by the design." },
      { type: 'tool', id: 'ring-size', title: 'Need a printable sizer or more help?' },
      { type: 'cta', to: 'Chatbot', label: 'Ask for a printable sizer' }
    ]
  },
  {
    slug: 'best-diamond-shape-for-short-fingers',
    title: 'Best Diamond Shape for Short Fingers (Style Guide)',
    metaDescription: 'Which diamond shape lengthens short fingers? Oval, marquise, and emerald cuts—plus settings and bands that help.',
    category: 'Diamonds',
    publishedAt: '2025-01-12',
    readTimeMinutes: 13,
    excerpt: 'Shapes and settings that make fingers appear longer—and what to avoid.',
    body: [
      { type: 'p', content: 'Elongated shapes and the right setting can make short fingers look longer. Ovals, marquise, emerald, and pear (worn with the point toward the nail) create a vertical line that adds length. This guide covers the best diamond shapes for short fingers, which settings and bands help, and what to avoid so the ring flatters her hand.' },
      { type: 'h2', content: 'Why shape matters for short fingers' },
      { type: 'p', content: 'Short or petite fingers can be overwhelmed by very large or very round stones. Shapes that draw the eye along the finger rather than across it—elongated ovals, marquise, emerald, and pear—create an illusion of length. Round and cushion can still work; the key is proportion: a slightly smaller carat or a thinner band often looks better than a chunky, high-set round.' },
      { type: 'h2', content: 'Best shapes for short fingers' },
      { type: 'h3', content: 'Oval' },
      { type: 'p', content: 'Oval is one of the top choices for lengthening. It elongates the finger and is very on-trend. Ovals also tend to look larger per carat than rounds, so you can often choose a slightly smaller stone and still get strong presence. Watch for bow-tie (a darker band across the middle) in poorer cuts.' },
      { type: 'image', id: 'Oval', caption: 'Oval diamonds create a flattering elongated line on the finger.' },
      { type: 'h3', content: 'Marquise' },
      { type: 'p', content: 'The boat-shaped marquise offers strong elongation and drama. It maximises surface area for its carat weight, so it can look large and bold. The pointed ends need a setting that protects them; a V-tip or bezel is common. Marquise is less common than oval, so it stands out for someone who wants a distinct look.' },
      { type: 'image', id: 'Marquise', caption: 'Marquise cuts add length and a bold, distinctive silhouette.' },
      { type: 'h3', content: 'Emerald' },
      { type: 'p', content: 'Emerald-cut diamonds have clean, linear facets and a hall-of-mirrors effect. The elongated rectangular shape slims and lengthens the finger. Step-cuts show more clarity and colour than brilliant cuts, so many buyers choose VS2 or better. Emerald reads as classic and refined.' },
      { type: 'image', id: 'Emerald', caption: 'Emerald-cut diamonds offer clean lines and a slimming effect.' },
      { type: 'h3', content: 'Pear' },
      { type: 'p', content: 'Pear (teardrop) combines the brilliance of a round with the length of a marquise. Worn with the point toward the nail, it extends the finger. The rounded end is less prone to snagging than a full marquise. Pears can show bow-tie; choose a well-cut stone and view it in different lights.' },
      { type: 'image', id: 'Pear', caption: 'Pear shapes extend the finger when worn with the point toward the nail.' },
      { type: 'h2', content: 'Settings and bands that help' },
      { type: 'p', content: 'A slim band (1.5–2.5 mm) keeps focus on the stone and avoids shortening the finger. A higher setting can add presence without going huge on carat. Round and cushion are fine too—opt for a slightly smaller stone or lower profile so the ring does not overwhelm. Avoid very wide bands or chunky shoulders if the goal is to lengthen.' },
      { type: 'h2', content: 'What to avoid' },
      { type: 'p', content: 'Very large round or cushion stones on a short finger can look top-heavy. A very wide band can shorten the finger further. There are no hard rules—if she loves rounds, a well-proportioned round in a thin band can still work. The best shape is the one she will love and wear with confidence.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try oval and emerald in the builder' }
    ]
  },
  {
    slug: 'engagement-ring-budget-calculator',
    title: 'Engagement Ring Budget Calculator: How to Set Yours',
    metaDescription: 'How to set an engagement ring budget you can afford. Rules of thumb, calculators, and what to prioritise at every price point.',
    category: 'Buying',
    publishedAt: '2025-01-11',
    readTimeMinutes: 6,
    excerpt: 'A practical way to set a ring budget—without outdated “rules” or guilt.',
    body: [
      { type: 'p', content: 'Forget “two or three months’ salary”—those rules were ad campaigns. A better method: decide what you’re comfortable spending, then allocate it across stone, metal, and design.' },
      { type: 'h2', content: 'Steps to set your budget' },
      { type: 'ol', items: ['Review your savings and what you can put aside without stress.', 'Include resizing, insurance, and (optional) wedding band in the total.', 'Decide your priorities: max carat, higher colour/clarity, or a premium metal.'] },
      { type: 'h2', content: 'Allocation by priority' },
      { type: 'p', content: 'If size matters most: lab-grown or moissanite, and consider slightly lower colour/clarity. If quality matters: natural or lab with better 4Cs and a simpler setting. If metal matters: platinum or 18k and a classic solitaire.' },
      { type: 'tool', id: 'budget', title: 'See what you can get for your budget' },
      { type: 'cta', to: 'RingBuilder', label: 'Design within your budget' }
    ]
  },
  {
    slug: 'what-is-good-clarity-for-engagement-ring',
    title: 'What Is a Good Clarity for an Engagement Ring?',
    metaDescription: 'Best clarity for engagement rings: VS2, VS1, SI1 explained. When to go higher or lower to get the best value.',
    category: 'Diamonds',
    publishedAt: '2025-01-10',
    readTimeMinutes: 6,
    excerpt: 'VS2 and SI1 are the sweet spots for most buyers. Here’s why—and when to move up or down.',
    body: [
      { type: 'p', content: 'Clarity grades run from FL (flawless) to I3. For engagement rings, VS2, VS1, and SI1 are the most common “good” choices: eye-clean for almost everyone, without paying for imperfections you can’t see.' },
      { type: 'h2', content: 'Clarity grades in plain English' },
      { type: 'ul', items: ['FL/IF: No inclusions under 10× — rarely necessary for most', 'VVS1–VVS2: Very hard to see — a luxury upgrade', 'VS1–VS2: “Eye-clean” for nearly everyone — the sweet spot', 'SI1–SI2: Often eye-clean; check the specific stone', 'I1 and below: Inclusions often visible — only if budget is tight and you accept trade-offs'] },
      { type: 'h2', content: 'Shape and size matter' },
      { type: 'p', content: 'Larger stones and certain cuts (emerald, asscher) show inclusions more. For rounds and ovals under 1.5 ct, SI1 is often a great value; for step-cuts or bigger stones, VS2 or better is safer.' },
      { type: 'cta', to: 'RingBuilder', label: 'See clarity options in the builder' }
    ]
  },
  {
    slug: 'moissanite-vs-diamond',
    title: 'Moissanite vs Diamond: Durability, Sparkle & Cost',
    metaDescription: 'Moissanite vs diamond: hardness, brilliance, price, and which is right for an engagement ring. Honest 2025 comparison.',
    category: 'Stones',
    publishedAt: '2025-01-09',
    readTimeMinutes: 6,
    excerpt: 'Moissanite offers more fire and a lower price. Here’s how it compares to diamond in looks and wear.',
    body: [
      { type: 'p', content: 'Moissanite is a lab-created silicon carbide gem. It’s very hard (9.25 Mohs), has more fire (rainbow flashes) than diamond, and typically costs a fraction of a diamond of similar size.' },
      { type: 'h2', content: 'Moissanite vs diamond at a glance' },
      { type: 'ul', items: ['Hardness: Moissanite 9.25; Diamond 10 — both suitable for daily wear', 'Brilliance: Moissanite can look more “fiery”; diamond can appear whiter and more classic', 'Cost: Moissanite often 80–90% less than natural diamond for equivalent visual size', 'Colour: Some moissanite has a faint grey or yellow in certain light; newer grades are near colourless'] },
      { type: 'h2', content: 'Who should choose moissanite?' },
      { type: 'p', content: 'Ideal if you want maximum size and sparkle on a budget, prefer a lab-created option, or like its distinctive fire. Choose diamond if you want the classic look, the hardest possible stone, or a natural origin.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare moissanite and diamond in the builder' }
    ]
  },
  {
    slug: 'platinum-vs-white-gold-engagement-ring',
    title: 'Platinum vs White Gold for Engagement Rings',
    metaDescription: 'Platinum vs white gold: durability, cost, rhodium plating, and which is better for an engagement ring. South Africa pricing.',
    category: 'Metals',
    publishedAt: '2025-01-08',
    readTimeMinutes: 6,
    excerpt: 'Durability, upkeep, and cost—so you can choose between platinum and white gold with confidence.',
    body: [
      { type: 'p', content: 'Platinum and white gold both give a silvery look, but they differ in durability, maintenance, and price. For many, the choice comes down to budget and how much upkeep they want.' },
      { type: 'h2', content: 'Platinum' },
      { type: 'ul', items: ['Naturally white; no plating', 'Denser and more durable; develops a soft patina over time', 'Hypoallergenic; good for sensitive skin', 'Typically 40–60% more than white gold'] },
      { type: 'h2', content: 'White gold' },
      { type: 'ul', items: ['Alloy plus rhodium plating for a bright white; plating can wear every few years', 'Lighter and usually cheaper than platinum', 'Replating is straightforward and relatively low cost', '18k is purer and softer; 14k is harder and more durable'] },
      { type: 'h2', content: 'Which to choose' },
      { type: 'p', content: 'Platinum suits heirloom-minded buyers and those who prefer no replating. White gold suits those prioritising upfront cost and who don’t mind occasional replating to keep the bright finish.' },
      { type: 'cta', to: 'RingBuilder', label: 'See platinum and white gold options' }
    ]
  },
  {
    slug: 'how-to-buy-a-diamond',
    title: 'How to Buy a Diamond: A Step-by-Step Guide (2025)',
    metaDescription: 'How to buy a diamond: the 4Cs, certifications, where to buy, and mistakes to avoid. A clear, practical buying guide.',
    category: 'Guide',
    publishedAt: '2025-01-07',
    readTimeMinutes: 14,
    excerpt: 'From the 4Cs to certifications and where to buy—everything you need to buy a diamond with confidence.',
    body: [
      { type: 'p', content: 'Buying a diamond doesn’t have to be overwhelming. Focus on the 4Cs (cut, colour, clarity, carat), a reliable report (GIA or IGI), and a seller that lets you see the stone (or high-res video) before committing.' },
      { type: 'h2', content: '1. Learn the 4Cs' },
      { type: 'p', content: 'Cut affects sparkle most; prioritise Excellent or Very Good for rounds. Colour D–G is “colourless” to “near colourless”; clarity VS2 or SI1 is usually eye-clean. Carat is weight— bigger isn’t always better if cut suffers.' },
      { type: 'h2', content: '2. Get a lab report' },
      { type: 'p', content: 'GIA and IGI are trusted. The report should match the stone (e.g. laser inscription). Avoid sellers who can’t or won’t provide a certificate.' },
      { type: 'h2', content: '3. Decide: natural, lab, or alternative' },
      { type: 'p', content: 'Natural costs more and has rarity and resale narratives. Lab offers the same look for less. Moissanite and coloured gems are alternatives if you want something different.' },
      { type: 'h2', content: '4. Where to buy' },
      { type: 'p', content: 'Reputable independents, custom jewellers, and trusted online vendors often beat big-box retail. Compare like-for-like (4Cs + cert) and check reviews and return policies.' },
      { type: 'h3', content: 'Ring size' },
      { type: 'p', content: 'If you need to convert or check a ring size (UK, US, EU, or mm), use the tool below. For engagement rings, a final check with a jeweller is still recommended.' },
      { type: 'ringSizeTool' },
      { type: 'tool', id: 'concierge', title: 'Unsure? Ask our Concierge' },
      { type: 'cta', to: 'RingBuilder', label: 'Start designing your ring' }
    ]
  },
  {
    slug: 'what-is-gia-certified-diamond',
    title: 'What Is a GIA Certified Diamond? (And Why It Matters)',
    metaDescription: 'What GIA certification means, how to read a GIA report, and why GIA diamonds are trusted. IGI vs GIA vs EGL explained.',
    category: 'Diamonds',
    publishedAt: '2025-01-06',
    readTimeMinutes: 5,
    excerpt: 'GIA set the global standard for diamond grading. Here’s what a GIA certificate tells you—and how it compares to others.',
    body: [
      { type: 'p', content: 'GIA (Gemological Institute of America) is the leading independent lab for diamond grading. A GIA report describes the 4Cs and other features; it does not “approve” a diamond, but it gives you a consistent, trusted baseline.' },
      { type: 'h2', content: 'What’s on a GIA report' },
      { type: 'ul', items: ['Shape, dimensions, carat weight', 'Cut, colour, clarity grades', 'Fluorescence (if any)', 'Inscription number matching the stone', 'A clarity plot and comments on notable characteristics'] },
      { type: 'h2', content: 'GIA vs IGI vs EGL' },
      { type: 'p', content: 'GIA is generally the strictest and most widely recognised. IGI is also respected, especially for lab-grown. EGL International can be looser; an “EGL” grade may not align with GIA—always compare the actual grades, not just “certified”.' },
      { type: 'h2', content: 'Do you need GIA?' },
      { type: 'p', content: 'For natural diamonds, GIA (or an equivalent like AGS) is a strong choice. For lab-grown, GIA or IGI both work. Avoid unbranded or in-house “certificates” that aren’t from an independent lab.' },
      { type: 'cta', to: 'Resources', label: 'Download our diamond guide' }
    ]
  },
  {
    slug: 'round-vs-oval-diamond',
    title: 'Round vs Oval Diamond: Which Is Right for You?',
    metaDescription: 'Round vs oval diamond: sparkle, finger coverage, price, and style. Compare the two most popular engagement ring shapes.',
    category: 'Diamonds',
    publishedAt: '2025-01-05',
    readTimeMinutes: 11,
    excerpt: 'Rounds lead in sparkle; ovals lead in finger coverage and trend. How to choose.',
    body: [
      { type: 'p', content: 'Round brilliant and oval are the two most popular engagement diamond shapes. Rounds are cut for maximum brilliance; ovals offer elongation and often look larger per carat.' },
      { type: 'h2', content: 'Round brilliant' },
      { type: 'p', content: 'The round brilliant is engineered for maximum sparkle and fire. It is the most researched cut and remains the best-seller for engagement rings. It is classic and versatile and holds value well. More rough is lost in cutting than with ovals, so rounds often cost 15–20% more per carat for similar quality.' },
      { type: 'image', id: 'Round', caption: 'Round brilliants are cut for maximum sparkle and fire.' },
      { type: 'ul', items: ['Maximum sparkle and fire; the most researched cut', 'Classic and versatile; holds value well', 'More rough is lost in cutting, so often 15–20% more per carat than ovals'] },
      { type: 'h2', content: 'Oval' },
      { type: 'p', content: 'Oval diamonds elongate the finger and can look larger than a same-carat round. They have a softer, more modern feel and are very on-trend. Watch for bow-tie (a darker band across the middle) in poorer cuts—choose a well-cut stone and view it in different lights.' },
      { type: 'image', id: 'Oval', caption: 'Ovals elongate the finger and often look larger per carat.' },
      { type: 'ul', items: ['Elongates the finger; can look larger than a same-carat round', 'Softer, more “modern” feel; very on-trend', 'Watch for bow-tie (darker band across the middle)—choose a well-cut stone'] },
      { type: 'h2', content: 'How to choose' },
      { type: 'p', content: 'Choose round if you want the most sparkle and a timeless look. Choose oval if you like elongation, a contemporary style, or want to maximise perceived size on a budget.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare round and oval in the builder' }
    ]
  },
  {
    slug: 'engagement-ring-buying-guide',
    title: 'Engagement Ring Buying Guide 2025: From Budget to Proposal',
    metaDescription: 'Complete engagement ring buying guide: budget, 4Cs, metals, settings, sizing, and where to buy. Everything in one place.',
    category: 'Guide',
    publishedAt: '2025-01-04',
    readTimeMinutes: 16,
    excerpt: 'One guide to take you from “I want to propose” to a ring she’ll love—without overwhelm.',
    body: [
      { type: 'p', content: 'This guide walks you through the main decisions: budget, stone type and 4Cs, metal, setting, and where to buy. Use it as a checklist so nothing important gets missed.' },
      { type: 'h2', content: '1. Set a budget' },
      { type: 'p', content: 'Pick a number you’re comfortable with. Include the setting, and optionally insurance, resizing, and a wedding band. Ignore old “rules” about months of salary.' },
      { type: 'h2', content: '2. Stone: natural, lab, or alternative' },
      { type: 'p', content: 'Natural: traditional, higher cost. Lab: same look, lower cost, traceable. Moissanite or sapphire: different look and often lower cost. Your budget and her taste will narrow this.' },
      { type: 'h2', content: '3. The 4Cs and shape' },
      { type: 'p', content: 'Cut matters most for sparkle. Colour G–H and clarity VS2–SI1 are common sweet spots. Carat is size; shape affects style and how large it looks. Try a few in the builder or in person.' },
      { type: 'h2', content: '4. Metal and setting' },
      { type: 'p', content: 'Platinum and white, yellow, or rose gold are the main choices. Solitaire, halo, pave, and three-stone are the most popular settings. Match the metal to her existing jewellery and lifestyle.' },
      { type: 'h2', content: '5. Sizing and buying' },
      { type: 'p', content: 'Get her size if you can (or borrow a ring). If you are proposing in secret, use the ring size conversion tool below to look up UK, US, or EU sizes and to see the actual ring diameter. Ordering slightly large is often safer than too small—resizing down is usually straightforward.' },
      { type: 'ringSizeTool' },
      { type: 'p', content: 'Buy from a jeweller with clear certs, a good return/resize policy, and reviews. Custom pieces often need 3–6 weeks.' },
      { type: 'tool', id: 'configurator', title: 'Design your ring step by step' },
      { type: 'cta', to: 'RingBuilder', label: 'Start the ring builder' }
    ]
  },
  {
    slug: 'diamond-carat-size-chart',
    title: 'Diamond Carat Size Chart: MM, Weight & How Big It Looks',
    metaDescription: 'Diamond carat size chart: carat to mm, how big each carat looks on the hand, and what to expect at 0.5, 1, 1.5, 2 carat.',
    category: 'Diamonds',
    publishedAt: '2025-01-03',
    readTimeMinutes: 6,
    excerpt: 'Carat, mm, and “how big it looks” on the finger—all in one place.',
    body: [
      { type: 'p', content: 'Carat is weight (1 ct = 0.2 g), not length. Two 1 ct stones can look different if one has a shallow cut or a different shape. Use mm and proportions to judge visual size.' },
      { type: 'h2', content: 'Approximate diameters (round brilliant)' },
      { type: 'ul', items: ['0.5 ct ≈ 5.1 mm', '0.75 ct ≈ 5.8 mm', '1.0 ct ≈ 6.5 mm', '1.5 ct ≈ 7.4 mm', '2.0 ct ≈ 8.2 mm', '3.0 ct ≈ 9.3 mm'] },
      { type: 'h2', content: 'How big it looks' },
      { type: 'p', content: 'On a size 6 finger, 1 ct is a noticeable solitaire; 1.5–2 ct read “large” to most people. Elongated shapes (oval, marquise) often look larger than rounds at the same carat. Consider her hand size and band width.' },
      { type: 'h2', content: 'Price jumps' },
      { type: 'p', content: 'Prices rise at “magic” sizes: 0.5, 1.0, 1.5, 2.0 ct. A 0.9 ct can cost meaningfully less than a 1.0 ct with similar specs—often a good value if you’re okay with slightly under the round number.' },
      { type: 'cta', to: 'RingBuilder', label: 'See carat options in the builder' }
    ]
  },
  {
    slug: 'when-to-get-engaged',
    title: 'When to Get Engaged: How Long to Date Before Proposing',
    metaDescription: 'When to get engaged: how long to date, signs you’re ready, and what experts say. No magic number—just practical guidance.',
    category: 'Engagement',
    publishedAt: '2025-01-02',
    readTimeMinutes: 5,
    excerpt: 'There’s no universal “right” time—but there are signs you’re ready and factors to consider.',
    body: [
      { type: 'p', content: 'Studies often cite 1–2 years of dating before engagement, but the right timing depends on your age, life stage, and how well you’ve discussed the future. What matters more: alignment on marriage, kids, finances, and where you’ll live.' },
      { type: 'h2', content: 'Signs you might be ready' },
      { type: 'ul', items: ['You’ve had honest talks about marriage, kids, and long-term goals', 'You’ve weathered a few disagreements and feel secure in the relationship', 'You’re on the same page about finances and lifestyle', 'You both want to get married (and have said so)'] },
      { type: 'h2', content: 'What to avoid' },
      { type: 'p', content: 'Don’t propose to fix a troubled relationship, to meet others’ expectations, or before you’ve discussed whether you both want marriage. The ring is a symbol; the foundation is the conversation.' },
      { type: 'h2', content: 'Practical next steps' },
      { type: 'p', content: 'Once you’re aligned, decide on a rough timeline and start exploring rings. Custom and made-to-order rings often need 3–6 weeks, so plan ahead if you have a date in mind.' },
      { type: 'cta', to: 'RingBuilder', label: 'Start designing the ring' }
    ]
  },
  {
    slug: 'how-to-clean-engagement-ring',
    title: 'How to Clean an Engagement Ring at Home (Safely)',
    metaDescription: 'How to clean a diamond engagement ring at home: soap, water, soft brush, and what to avoid. When to get a professional clean.',
    category: 'Care',
    publishedAt: '2025-01-01',
    readTimeMinutes: 5,
    excerpt: 'Simple, safe ways to keep your ring sparkling—and when to leave it to a professional.',
    body: [
      { type: 'p', content: 'Dirt, oil, and lotion dull sparkle. A gentle at-home clean every few weeks keeps your ring looking its best. For diamonds and most settings, a few household items are enough.' },
      { type: 'h2', content: 'Simple at-home method' },
      { type: 'ol', items: ['Fill a bowl with lukewarm water and a drop of mild dish soap.', 'Soak the ring 15–20 minutes.', 'Gently scrub with a soft toothbrush (not harsh bristles) around the stone and under the setting.', 'Rinse in clean water and dry with a lint-free cloth.'] },
      { type: 'h2', content: 'What to avoid' },
      { type: 'ul', items: ['Chlorine (pools, bleach): can damage some metals and settings', 'Harsh chemicals and abrasives', 'Ultrasonic cleaners if the stone is treated, fractured, or in a fragile setting', 'Cleaning when the stone is loose—have it checked first'] },
      { type: 'h2', content: 'When to get a professional clean' },
      { type: 'p', content: 'Every 6–12 months, have a jeweller clean, check prongs, and inspect for damage. For pearls, opals, or other soft or porous stones, ask your jeweller for safe methods—many need different care than diamonds.' },
      { type: 'cta', to: 'Chatbot', label: 'Ask about care for your specific ring' }
    ]
  },
  {
    slug: 'engagement-ring-insurance',
    title: 'Engagement Ring Insurance: What It Covers & Best Options',
    metaDescription: 'Engagement ring insurance: what it covers, scheduled vs jewellery floaters, cost, and how to get the right coverage. South Africa & UK.',
    category: 'Care',
    publishedAt: '2024-12-31',
    readTimeMinutes: 6,
    excerpt: 'How to insure your engagement ring against loss, theft, and damage—without overpaying.',
    body: [
      { type: 'p', content: 'Home or renters insurance may cap payouts for jewellery. For an engagement ring, a scheduled item or a dedicated jewellery policy gives clearer, higher coverage.' },
      { type: 'h2', content: 'Types of coverage' },
      { type: 'ul', items: ['Scheduled/ specified items: Ring listed with value and often a recent appraisal', 'Jewellery floater: Add-on to home policy for jewellery', 'Standalone jewellery policy: Some insurers offer dedicated plans for high-value pieces'] },
      { type: 'h2', content: 'What’s usually covered' },
      { type: 'p', content: 'Theft, loss (e.g. overseas), and sometimes accidental damage—depending on the policy. Read the wording for exclusions (e.g. “mysterious disappearance”) and whether you need a safe or proof of purchase.' },
      { type: 'h2', content: 'Cost and documentation' },
      { type: 'p', content: 'Premiums often run around 1–2% of the insured value per year. You’ll typically need a receipt and/or an appraisal, plus photos. Update the value if you add or change stones.' },
      { type: 'cta', to: 'Resources', label: 'See our care and warranty info' }
    ]
  },
  {
    slug: 'custom-engagement-ring-process-cost',
    title: 'Custom Engagement Ring: Process, Timeline & Cost 2025',
    metaDescription: 'Custom engagement ring: how it works, how long it takes, and what it costs. From consultation to finished ring.',
    category: 'Buying',
    publishedAt: '2024-12-30',
    readTimeMinutes: 10,
    excerpt: 'What to expect when you commission a custom engagement ring—and how it compares to buying off the shelf.',
    body: [
      { type: 'p', content: 'A custom engagement ring is made to your design and her size. You get a one-of-a-kind piece, often at a similar or better price than retail for comparable quality, because there’s no middleman or inventory markup.' },
      { type: 'h2', content: 'Typical process' },
      { type: 'ol', items: ['Consultation: discuss style, budget, stone type, and metal', 'Design: mood board, CAD, or hand sketch—revisions until you approve', 'Stone selection: choose a certified diamond or alternative', 'Making: casting, setting, finishing—usually 3–6 weeks', 'Delivery: fit, final polish, and care instructions'] },
      { type: 'h2', content: 'Timeline and cost' },
      { type: 'p', content: 'Allow 4–8 weeks from deposit to delivery; rush options may be possible. Cost depends on stone, metal, and complexity. Many custom jewellers work under retail for the same specs; you’re paying for design and labour, not markup.' },
      { type: 'h3', content: 'Ring size' },
      { type: 'p', content: 'Sizing is part of the process. Use the conversion tool below to look up UK, US, or EU sizes. If you are proposing in secret, ordering slightly large is often safer.' },
      { type: 'ringSizeTool' },
      { type: 'h2', content: 'Deposits and guarantees' },
      { type: 'p', content: 'A 50% deposit is common before sourcing and making. Ensure you have a clear quote, a written description of the design, and a warranty. Check the policy on changes or cancellations before you pay.' },
      { type: 'cta', to: 'RingBuilder', label: 'Start a custom design' }
    ]
  },
  {
    slug: 'vintage-vs-modern-engagement-ring',
    title: 'Vintage vs Modern Engagement Ring: Styles & How to Choose',
    metaDescription: 'Vintage vs modern engagement rings: Art Deco, Edwardian, mid-century, and contemporary styles. Which fits your taste?',
    category: 'Engagement',
    publishedAt: '2024-12-29',
    readTimeMinutes: 5,
    excerpt: 'The main vintage and modern styles—and how to tell what you (or she) likes.',
    body: [
      { type: 'p', content: '“Vintage” can mean true antiques (pre-1960s) or new rings in a period style. “Modern” usually means clean, minimal, or current trends. Many couples mix: e.g. a vintage-inspired setting with a new stone.' },
      { type: 'h2', content: 'Vintage-inspired styles' },
      { type: 'ul', items: ['Art Deco: geometric, filigree, step-cuts, often platinum', 'Edwardian: lace-like, milgrain, subtle and delicate', 'Mid-century: simpler shapes, three-stone, or classic solitaires'] },
      { type: 'h2', content: 'Modern styles' },
      { type: 'ul', items: ['Solitaires: thin bands, low or high set', 'Ovals and emeralds: very current', 'East-west settings, bezels, and mixed metals'] },
      { type: 'h2', content: 'Choosing' },
      { type: 'p', content: 'Look at her existing jewellery and Pinterest or saved images. If she loves antiques, consider a restored vintage piece or a custom design that echoes that era. If her style is minimal, a modern solitaire or simple halo is a safe bet.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try different styles in the builder' }
    ]
  },
  {
    slug: 'engagement-ring-trends-2025',
    title: 'Engagement Ring Trends 2025: Shapes, Metals & Settings',
    metaDescription: 'Engagement ring trends 2025: oval, emerald, lab-grown, yellow gold, and more. What’s in and what’s staying.',
    category: 'Engagement',
    publishedAt: '2024-12-28',
    readTimeMinutes: 5,
    excerpt: 'What’s trending in engagement rings this year—and what’s timeless enough to last decades.',
    body: [
      { type: 'p', content: '2025 trends lean toward elongated shapes, lab-grown stones, warm metals, and a mix of classic and personal. Here’s what’s popular—and what to pick if you want “now” vs “forever”.' },
      { type: 'h2', content: 'Shapes' },
      { type: 'ul', items: ['Oval and emerald remain top choices', 'Elongated shapes (marquise, pear) are trending up', 'Round is always in—it’s the perennial best-seller'] },
      { type: 'h2', content: 'Metals and settings' },
      { type: 'ul', items: ['Yellow and rose gold are strong; white and platinum stay classic', 'Thin bands and solitaires; halos and three-stone for more presence', 'Bezels and east-west settings for a contemporary look'] },
      { type: 'h2', content: 'Stones' },
      { type: 'p', content: 'Lab-grown diamonds continue to grow; moissanite and coloured gemstones (sapphire, emerald) are also popular for a non-diamond look. Whatever you choose, prioritise cut and a style she’ll love in 20 years.' },
      { type: 'cta', to: 'RingBuilder', label: 'Explore 2025 styles in the builder' }
    ]
  },
  {
    slug: 'diamond-fluorescence-good-or-bad',
    title: 'Diamond Fluorescence: Good or Bad? What Buyers Should Know',
    metaDescription: 'Diamond fluorescence: what it is, when it helps or hurts, and whether to buy a fluorescent diamond. GIA grades explained.',
    category: 'Diamonds',
    publishedAt: '2024-12-27',
    readTimeMinutes: 5,
    excerpt: 'Fluorescence can make some diamonds look whiter—or in rare cases, hazy. Here’s the full picture.',
    body: [
      { type: 'p', content: 'Fluorescence is a glow some diamonds show under UV light. GIA grades it None, Faint, Medium, Strong, and Very Strong. In normal light it’s usually invisible; in daylight or under UV it can slightly change how the stone looks.' },
      { type: 'h2', content: 'When it can help' },
      { type: 'p', content: 'In diamonds with a slight yellow tinge (around I–K), Faint to Medium fluorescence can make the body colour look whiter by offsetting the yellow. In those cases it can improve perceived colour and sometimes lower the price.' },
      { type: 'h2', content: 'When to be cautious' },
      { type: 'p', content: 'In D–G colourless stones, Strong or Very Strong fluorescence can occasionally cause a milky or oily look in bright daylight. It’s rare but possible—always view the stone in different lights if fluorescence is Medium or above.' },
      { type: 'h2', content: 'Bottom line' },
      { type: 'p', content: 'Faint or Medium fluorescence is rarely a problem and can be a value in lower colour grades. For top colour (D–F), many buyers prefer None or Faint. When in doubt, look at the actual diamond, not just the report.' },
      { type: 'cta', to: 'Chatbot', label: 'Ask which fluorescence is right for you' }
    ]
  },
  {
    slug: 'conflict-free-ethical-diamonds',
    title: 'Conflict-Free & Ethical Diamonds: What They Mean in 2025',
    metaDescription: 'Conflict-free and ethical diamonds: Kimberley Process, traceability, and how lab-grown and Canadian mines fit in.',
    category: 'Diamonds',
    publishedAt: '2024-12-26',
    readTimeMinutes: 6,
    excerpt: 'What “conflict-free” and “ethical” mean today—and how to choose with confidence.',
    body: [
      { type: 'p', content: '“Conflict-free” has usually meant compliance with the Kimberley Process (KP), which aims to stop rebel-sold rough. “Ethical” is broader: labour, environment, traceability, and community impact.' },
      { type: 'h2', content: 'Kimberley Process and its limits' },
      { type: 'p', content: 'The KP certifies rough diamonds from participating countries. Critics say it doesn’t cover all human-rights or environmental issues, and that “blood diamonds” can still slip through in weak systems. KP is a baseline, not a full guarantee of ethics.' },
      { type: 'h2', content: 'More ethical options' },
      { type: 'ul', items: ['Lab-grown: traceable, no mining; check the grower’s energy and sourcing', 'Canadian and some Australian mines: strict regulations and traceability', 'Brands with blockchain or mine-to-market programmes: better traceability'] },
      { type: 'h2', content: 'What to ask your jeweller' },
      { type: 'p', content: 'Ask where the diamond was mined or grown, whether it’s KP-compliant (for natural), and if the seller has a written policy on ethics and traceability. Reputable jewellers can usually provide at least a country of origin.' },
      { type: 'cta', to: 'RingBuilder', label: 'Explore lab-grown and natural options' }
    ]
  },
  {
    slug: 'diamond-buying-mistakes-to-avoid',
    title: '7 Diamond Buying Mistakes to Avoid (Expert Tips)',
    metaDescription: 'Diamond buying mistakes: prioritising carat over cut, skipping the cert, and more. Expert tips to avoid overpaying and regret.',
    category: 'Buying',
    publishedAt: '2024-12-25',
    readTimeMinutes: 6,
    excerpt: 'The most common missteps—and how to avoid them so you get a stone you’ll love.',
    body: [
      { type: 'p', content: 'A few wrong priorities can lead to overpaying or a stone that doesn’t sparkle. Here are the mistakes we see most—and how to steer clear.' },
      { type: 'h2', content: '1. Chasing carat over cut' },
      { type: 'p', content: 'A big, poorly cut diamond can look dull. Cut has the biggest impact on brilliance. Prioritise Cut (Excellent or Very Good for rounds) and balance carat with colour and clarity.' },
      { type: 'h2', content: '2. Skipping or ignoring the certificate' },
      { type: 'p', content: 'Buy only stones with a report from GIA, IGI, or an equivalent lab. The cert should match the stone (e.g. laser inscription). In-house or unbranded “certs” aren’t enough.' },
      { type: 'h2', content: '3. Not looking at the actual stone' },
      { type: 'p', content: 'Grades don’t tell the full story. Two VS2s can look different. View in person or via high-res video and in different lighting. For ovals and emeralds, check for bow-tie or dull areas.' },
      { type: 'h2', content: '4. Forgetting the setting' },
      { type: 'p', content: 'Budget for the setting and metal. A beautiful stone in a cheap setting can disappoint. Match the setting to her style and daily wear.' },
      { type: 'h2', content: '5. Paying for “invisible” upgrades' },
      { type: 'p', content: 'Going from VS1 to VVS2 or D to E may not be visible to the eye. Put that budget into cut, size, or metal instead.' },
      { type: 'h2', content: '6. Ignoring fluorescence (when it matters)' },
      { type: 'p', content: 'In higher colour grades, Strong fluorescence can rarely cause haziness. In I–K, Faint–Medium can help. Check the stone, don’t assume.' },
      { type: 'h2', content: '7. Rushing or buying under pressure' },
      { type: 'p', content: 'Take time to compare and understand. Avoid high-pressure sales. Get a second opinion or sleep on it before you pay a deposit.' },
      { type: 'cta', to: 'RingBuilder', label: 'Design with confidence' }
    ]
  },
  {
    slug: 'engagement-ring-styles-solitaire-halo-pave',
    title: 'Engagement Ring Styles: Solitaire, Halo, Pave & More',
    metaDescription: 'Engagement ring styles explained: solitaire, halo, pave, three-stone, and bezel. Which fits her style?',
    category: 'Engagement',
    publishedAt: '2024-12-24',
    readTimeMinutes: 16,
    excerpt: 'The main engagement ring styles—and how to choose the right one for her.',
    body: [
      { type: 'p', content: 'The setting defines the ring’s look as much as the centre stone. Here’s a quick guide to the most popular styles and who they suit.' },
      { type: 'h2', content: 'Solitaire' },
      { type: 'p', content: 'A single centre stone in a simple band. Timeless, easy to pair with any wedding band, and puts all attention on the diamond. Ideal for minimal and classic tastes. Works with every shape: round, oval, emerald, pear.' },
      { type: 'image', id: 'Solitaire', caption: 'A classic solitaire puts full focus on the centre stone.' },
      { type: 'h2', content: 'Halo' },
      { type: 'p', content: 'A ring of smaller diamonds frames the centre. The halo makes the centre look larger and adds sparkle. Suits those who want more presence and a classic-to-glam look. Halos can be round or oval to match the centre.' },
      { type: 'image', id: 'Halo', caption: 'A halo of smaller stones frames the centre and adds sparkle.' },
      { type: 'h2', content: 'Pave' },
      { type: 'p', content: 'Small stones set along the band (and sometimes under the centre). Pave adds shine without changing the overall shape. Good for extra sparkle and a refined look. The stones are usually very small and set close together.' },
      { type: 'image', id: 'Pave', caption: 'Pave diamonds along the band add all-over sparkle.' },
      { type: 'h2', content: 'Three-stone (trilogy)' },
      { type: 'p', content: 'A centre with two side stones. Often “past, present, future.” Balanced and elegant; the side stones can match or complement the centre.' },
      { type: 'image', id: 'Trilogy', caption: 'Three-stone or trilogy settings are balanced and symbolic.' },
      { type: 'h2', content: 'Bezel' },
      { type: 'p', content: 'The stone is surrounded by metal. Very secure and low-profile; good for active lifestyles. Looks modern and clean. A full bezel can slightly reduce light entry; a half-bezel offers a compromise.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try different settings in the builder' }
    ]
  },
  {
    slug: 'best-metal-for-engagement-ring',
    title: 'Best Metal for an Engagement Ring: Gold, Platinum & More',
    metaDescription: 'Best metal for engagement rings: platinum, white gold, yellow gold, rose gold. Durability, cost, and style compared.',
    category: 'Metals',
    publishedAt: '2024-12-23',
    readTimeMinutes: 6,
    excerpt: 'How to choose the right metal for durability, look, and budget.',
    body: [
      { type: 'p', content: 'Metal affects durability, colour, allergy risk, and cost. The “best” depends on her style, skin, and how much upkeep she wants.' },
      { type: 'h2', content: 'Platinum' },
      { type: 'p', content: 'Dense, naturally white, hypoallergenic. Develops a soft patina. Highest cost. Best for heirlooms and those who prefer no plating.' },
      { type: 'h2', content: 'White gold' },
      { type: 'p', content: 'Rhodium-plated for a bright white. Needs replating every few years. Lighter and cheaper than platinum. Very popular.' },
      { type: 'h2', content: 'Yellow gold' },
      { type: 'p', content: 'Classic and warm. 18k is richer; 14k is harder. No plating. Pairs well with all diamond colours.' },
      { type: 'h2', content: 'Rose gold' },
      { type: 'p', content: 'Copper gives a pink tone. Slightly tougher than yellow. Trendy and flattering on many skin tones.' },
      { type: 'h2', content: 'Silver' },
      { type: 'p', content: 'Affordable and versatile. Softer; best for fashion or as a placeholder. Can tarnish; needs care.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare metals in the builder' }
    ]
  },
  {
    slug: 'diamond-cut-chart-grades',
    title: 'Diamond Cut Chart & Grades: Excellent to Poor Explained',
    metaDescription: 'Diamond cut grades: Excellent, Very Good, Good, Fair, Poor. What they mean for sparkle and value. Cut chart and proportions.',
    category: 'Diamonds',
    publishedAt: '2024-12-22',
    readTimeMinutes: 6,
    excerpt: 'Cut is the C that most affects sparkle. Here’s how the grades work and what to aim for.',
    body: [
      { type: 'p', content: 'Cut is how well a diamond is shaped and faceted. It drives brilliance, fire, and scintillation. For round brilliants, GIA uses Excellent, Very Good, Good, Fair, and Poor.' },
      { type: 'h2', content: 'What cut grades mean' },
      { type: 'ul', items: ['Excellent: Top light return and sparkle; usually the best choice for rounds', 'Very Good: Slightly less precise; often great value and still very sparkly', 'Good: Noticeably less brilliance; can work for smaller or side stones', 'Fair & Poor: Significant light loss; we don’t recommend for a centre stone'] },
      { type: 'h2', content: 'Proportions and “ideal” cuts' },
      { type: 'p', content: 'Depth, table, crown, and pavilion angles affect performance. “Ideal” or “Hearts & Arrows” are sub-grades that some labs or vendors use for rounds with very strict proportions. They can be lovely but aren’t necessary for a beautiful stone.' },
      { type: 'h2', content: 'Fancy shapes' },
      { type: 'p', content: 'Oval, emerald, pear, etc. usually don’t get a single cut grade. Rely on the cert’s proportions, symmetry, and polish—and always review the stone (or video) for bow-tie, windowing, or dull zones.' },
      { type: 'cta', to: 'RingBuilder', label: 'See cut options in the builder' }
    ]
  },
  {
    slug: 'how-to-propose-ideas-etiquette',
    title: 'How to Propose: Ideas, Etiquette & What to Do First',
    metaDescription: 'How to propose: when, where, and how. Proposal ideas, who to tell first, and what to do if she says no. A practical guide.',
    category: 'Engagement',
    publishedAt: '2024-12-21',
    readTimeMinutes: 6,
    excerpt: 'From timing and location to the ask itself—practical tips for a memorable proposal.',
    body: [
      { type: 'p', content: 'A proposal is personal. There’s no single “right” way—but a few steps can make it more meaningful and less stressful.' },
      { type: 'h2', content: 'Before you ask' },
      { type: 'ul', items: ['Have you discussed marriage? Surprise the when and where, not the whether', 'Get the ring (or a placeholder) and her size if you can', 'Consider family: do you want to ask a parent’s blessing? It’s optional but matters to some'] },
      { type: 'h2', content: 'When and where' },
      { type: 'p', content: 'Pick a moment that fits her: private or with family, at home or somewhere special. Avoid high-pressure public stunts unless you’re sure she’ll love it. A place that means something to you both is often better than a random “wow” spot.' },
      { type: 'h2', content: 'The ask' },
      { type: 'p', content: 'Keep it simple and sincere. Say what she means to you and ask clearly. Have the ring (or a token) ready. You can plan a meal or party after—just be sure the moment itself isn’t rushed.' },
      { type: 'h2', content: 'If she says no' },
      { type: 'p', content: 'Stay calm. It may be “not yet” or “not like this.” Listen. Give her space. The ring can be returned or reset depending on your policy; the relationship needs a conversation, not a quick fix.' },
      { type: 'cta', to: 'RingBuilder', label: 'Design the ring she’ll say yes to' }
    ]
  },
  {
    slug: 'engagement-ring-etiquette-who-pays-when-to-wear',
    title: 'Engagement Ring Etiquette: Who Pays, When to Wear & More',
    metaDescription: 'Engagement ring etiquette: who pays, when to wear it, which hand, and what to do with it when you’re married. Modern guide.',
    category: 'Engagement',
    publishedAt: '2024-12-20',
    readTimeMinutes: 5,
    excerpt: 'Modern answers to the traditional etiquette questions—who pays, which hand, and when to wear it.',
    body: [
      { type: 'p', content: 'Many “rules” are traditions, not laws. Here’s a practical take on who pays, when to wear the ring, and how it works with the wedding band.' },
      { type: 'h2', content: 'Who pays for the engagement ring?' },
      { type: 'p', content: 'Historically, the proposer. Today, couples often split costs, or one pays for the engagement ring and the other for bands. There’s no rule—do what fits your finances and values.' },
      { type: 'h2', content: 'When to wear it' },
      { type: 'p', content: 'From the proposal onward, usually on the left ring finger. Some wear it on the right before marriage (e.g. in some European cultures). After the wedding, the band goes on first (closest to the heart), engagement ring on top—or you can wear them separately.' },
      { type: 'h2', content: 'Taking it off' },
      { type: 'p', content: 'It’s fine to remove it for sport, gym, dishes, or sleep. Use a dedicated dish or pouch so it doesn’t get lost. For travel, consider a decoy or leave it in a safe.' },
      { type: 'h2', content: 'Upgrading or changing it' },
      { type: 'p', content: 'Some upgrade for anniversaries; others keep the original forever. Both are valid. If you change or resize, discuss it—it’s her symbol, but it’s your partnership.' },
      { type: 'cta', to: 'Chatbot', label: 'Ask about care and sizing' }
    ]
  },
  {
    slug: 'diamond-color-chart-d-to-z',
    title: 'Diamond Color Chart: D to Z Grades Explained (With Examples)',
    metaDescription: 'Diamond color chart: GIA D–Z scale explained. What D, E, F, G, H and lower mean, and the best value color for engagement rings.',
    category: 'Diamonds',
    publishedAt: '2024-12-19',
    readTimeMinutes: 6,
    excerpt: 'From colourless D to visible tint: what each grade means and where the value sweet spots are.',
    body: [
      { type: 'p', content: 'GIA’s colour scale runs from D (colourless) to Z (light yellow or brown). For most engagement diamonds, the “colourless” to “near colourless” range (D–J) is chosen. The right grade depends on shape, size, metal, and budget.' },
      { type: 'h2', content: 'The scale in plain language' },
      { type: 'ul', items: ['D–F: Colourless — no tint to the naked eye', 'G–J: Near colourless — very slight warmth; often a great value', 'K–M: Faint — warmth more visible, especially in white settings', 'N–Z: Very light to light — obvious yellow or brown'] },
      { type: 'h2', content: 'Best value' },
      { type: 'p', content: 'G–H in a white setting is a common sweet spot: still reads “white” to most, at a lower price than D–F. In yellow or rose gold, I–K can look fine since the metal masks slight warmth. For emerald and asscher, colour can show more—many prefer G or better.' },
      { type: 'h2', content: 'View in context' },
      { type: 'p', content: 'Colour is easiest to see when the stone is loose, table-down on a white surface. Set in a ring, against skin and metal, the difference between two adjacent grades is often hard to see. Prioritise cut and clarity, then tune colour to your budget.' },
      { type: 'cta', to: 'RingBuilder', label: 'See colour in different metals' }
    ]
  },
  {
    slug: 'lab-grown-ethical-diamonds',
    title: 'Lab-Grown & Ethical Diamonds: Sustainability in 2025',
    metaDescription: 'Lab-grown and ethical diamonds: environmental impact, traceability, and how to choose a sustainable option. Honest 2025 overview.',
    category: 'Stones',
    publishedAt: '2024-12-18',
    readTimeMinutes: 5,
    excerpt: 'How lab-grown and responsibly sourced natural diamonds fit into a more ethical choice.',
    body: [
      { type: 'p', content: '“Ethical” can mean human rights, environment, traceability, or all of the above. Lab-grown removes mining; natural from certified sources can support traceable, regulated supply chains.' },
      { type: 'h2', content: 'Lab-grown and environment' },
      { type: 'p', content: 'Growing uses significant energy. Clean-energy facilities improve the footprint. Ask where and how the stone was grown; some brands publish impact data.' },
      { type: 'h2', content: 'Ethical natural diamonds' },
      { type: 'p', content: 'Canadian, some Australian, and certain African mines have strong standards. Blockchain and mine-to-market programmes aid traceability. The Kimberley Process remains a baseline for conflict-free, though it doesn’t cover all ethical issues.' },
      { type: 'h2', content: 'What you can do' },
      { type: 'p', content: 'Choose a jeweller that is transparent about origin and policies. Prefer GIA or IGI and, for natural, a known source. Both lab and responsibly sourced natural can be part of an ethical choice—it depends what you prioritise.' },
      { type: 'cta', to: 'RingBuilder', label: 'Explore lab-grown and natural' }
    ]
  },
  {
    slug: 'engagement-ring-warranty-care',
    title: 'Engagement Ring Warranty & Care: What to Expect',
    metaDescription: 'Engagement ring warranty: what’s usually covered, manufacturer vs insurance, and how to care for your ring long-term.',
    category: 'Care',
    publishedAt: '2024-12-17',
    readTimeMinutes: 5,
    excerpt: 'What typical warranties cover—and how to keep your ring in great shape for decades.',
    body: [
      { type: 'p', content: 'A manufacturer or jeweller warranty often covers defects in materials or workmanship for a set period (e.g. 1–2 years). It usually does not cover loss, theft, damage from wear, or stones that come loose due to impact.' },
      { type: 'h2', content: 'Typical warranty coverage' },
      { type: 'ul', items: ['Prong or setting defects', 'Metal issues (e.g. cracking from a fault)', 'Resizing within a window (e.g. one year)'] },
      { type: 'h2', content: 'What’s usually excluded' },
      { type: 'ul', items: ['Lost or stolen stones', 'Damage from accidents, knocks, or daily wear', 'Normal wear: scratches, rhodium wear on white gold', 'Stones that were damaged before setting'] },
      { type: 'h2', content: 'Care that preserves your ring' },
      { type: 'p', content: 'Remove for heavy work, gym, and swimming. Clean gently at home; have a professional check and clean every 6–12 months. Insure the ring separately; warranties don’t replace insurance.' },
      { type: 'cta', to: 'Resources', label: 'See our warranty and care details' }
    ]
  },
  {
    slug: 'diamond-certifications-gia-egi-igi',
    title: 'Diamond Certifications: GIA, EGL, IGI Compared (2025)',
    metaDescription: 'Diamond certifications compared: GIA, EGL, IGI. Which is strictest, best for lab-grown, and how to avoid grading inflation.',
    category: 'Diamonds',
    publishedAt: '2024-12-16',
    readTimeMinutes: 6,
    excerpt: 'A clear comparison of the main diamond labs—and how to use certs when you buy.',
    body: [
      { type: 'p', content: 'Not all “certified” diamonds are graded the same. Labs differ in strictness and reputation. Here’s how the main ones compare.' },
      { type: 'h2', content: 'GIA (Gemological Institute of America)' },
      { type: 'p', content: 'The global standard for natural diamonds. Strict and consistent. Widely trusted for resale and insurance. Also grades lab-grown.' },
      { type: 'h2', content: 'IGI (International Gemological Institute)' },
      { type: 'p', content: 'Strong presence in lab-grown; also grades natural. Generally trusted. Grades can be slightly more lenient than GIA in some cases—compare the actual report.' },
      { type: 'h2', content: 'EGL (European Gemological Laboratory)' },
      { type: 'p', content: 'EGL International and other EGL branches have been criticised for “softer” grading. An EGL “G” or “VS1” may not match GIA. If you buy EGL, treat it as a reference and inspect the stone—or stick to GIA/IGI for clarity on quality.' },
      { type: 'h2', content: 'How to use certs' },
      { type: 'p', content: 'Prefer GIA or IGI. Always match the report to the stone (e.g. inscription). For natural, GIA is the default. For lab-grown, GIA or IGI are both acceptable. Be cautious with in-house or unknown labs.' },
      { type: 'cta', to: 'Chatbot', label: 'Ask which cert we use' }
    ]
  },
  {
    slug: 'alternative-engagement-stones-sapphire-moissanite',
    title: 'Alternative Engagement Ring Stones: Sapphire, Moissanite & More',
    metaDescription: 'Alternative engagement stones: sapphire, moissanite, emerald, ruby. Durability, cost, and how to choose. 2025 guide.',
    category: 'Stones',
    publishedAt: '2024-12-15',
    readTimeMinutes: 6,
    excerpt: 'Diamond alternatives that are durable enough for daily wear—and how they compare.',
    body: [
      { type: 'p', content: 'Diamonds aren’t the only option. Sapphire, moissanite, ruby, and emerald are popular alternatives. Durability, colour, and cost vary—here’s what to consider.' },
      { type: 'h2', content: 'Sapphire' },
      { type: 'p', content: '9 on the Mohs scale; very durable. Blue is classic; pink, yellow, and white also work. Usually less than diamond for comparable size. Ask about treatments (heat is common and stable).' },
      { type: 'h2', content: 'Moissanite' },
      { type: 'p', content: '9.25 Mohs; harder than sapphire. Brilliant, often with more fire than diamond. Much lower cost. Some have a slight grey or yellow in certain light; newer grades are near colourless.' },
      { type: 'h2', content: 'Ruby' },
      { type: 'p', content: '9 Mohs. Red is bold; often treated for colour. Good for a strong, non-diamond look.' },
      { type: 'h2', content: 'Emerald' },
      { type: 'p', content: '7.5–8 Mohs; more prone to chipping. Often included. Best in protective settings (bezel, halo) if worn daily.' },
      { type: 'h2', content: 'Others' },
      { type: 'p', content: 'Aquamarine, morganite, and spinel are options for a softer look—prioritise settings that protect the stone and accept more care.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try sapphire and moissanite in the builder' }
    ]
  }
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByCategory(cat: BlogCategory): BlogArticle[] {
  return BLOG_ARTICLES.filter(a => a.category === cat);
}
