const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../data/blogArticles.ts');
let s = fs.readFileSync(file, 'utf8');

const AP = '\u2019';

// 1) engagement-ring-styles
const styles = {
  old: `      { type: 'p', content: 'The setting defines the ring${AP}s look as much as the centre stone. Here${AP}s a quick guide to the most popular styles and who they suit.' },
      { type: 'h2', content: 'Solitaire' },
      { type: 'p', content: 'A single stone in a simple band. Timeless, easy to pair with any band, and puts all attention on the diamond. Ideal for minimal and classic tastes.' },
      { type: 'h2', content: 'Halo' },
      { type: 'p', content: 'A ring of smaller stones around the centre. Makes the centre look larger and adds sparkle. Suits those who want more presence and a classic-to-glam look.' },
      { type: 'h2', content: 'Pave' },
      { type: 'p', content: 'Small stones set along the band (and sometimes under the centre). Adds shine without changing the shape of the setting. Good for extra sparkle and a refined look.' },
      { type: 'h2', content: 'Three-stone (trilogy)' },
      { type: 'p', content: 'A centre with two side stones. Often "past, present, future." Balanced and elegant; the side stones can match or complement the centre.' },
      { type: 'h2', content: 'Bezel' },
      { type: 'p', content: 'The stone is surrounded by metal. Very secure and low-profile; good for active lifestyles. Looks modern and clean.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try different settings in the builder' }`,
  new: `      { type: 'p', content: 'The setting defines the ring${AP}s look as much as the centre stone. Solitaire, halo, pave, three-stone, and bezel each create a different feel. This guide walks you through each style and who it suits.' },
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
      { type: 'p', content: 'A centre with two side stones. Often "past, present, future." Balanced and elegant; the side stones can match or complement the centre. Three-stone rings offer strong symbolic and visual presence.' },
      { type: 'image', id: 'Trilogy', caption: 'Three-stone or trilogy settings are balanced and symbolic.' },
      { type: 'h2', content: 'Bezel' },
      { type: 'p', content: 'The stone is surrounded by metal. Very secure and low-profile; good for active lifestyles. Looks modern and clean. A full bezel can slightly reduce light entry; a half-bezel offers a compromise.' },
      { type: 'cta', to: 'RingBuilder', label: 'Try different settings in the builder' }`
};
if (s.includes(styles.old)) { s = s.replace(styles.old, styles.new); console.log('Replaced engagement-ring-styles'); } else { console.log('engagement-ring-styles: pattern not found'); }

// 2) round-vs-oval
const roundOval = {
  old: `      { type: 'p', content: 'Round brilliant and oval are the two most popular engagement diamond shapes. Rounds are cut for maximum brilliance; ovals offer elongation and often look larger per carat.' },
      { type: 'h2', content: 'Round brilliant' },
      { type: 'ul', items: ['Maximum sparkle and fire; the most researched cut', 'Classic and versatile; holds value well', 'More rough is lost in cutting, so often 15–20% more per carat than ovals'] },
      { type: 'h2', content: 'Oval' },
      { type: 'ul', items: ['Elongates the finger; can look larger than a same-carat round', 'Softer, more "modern" feel; very on-trend', 'Watch for bow-tie (darker band across the middle)—choose a well-cut stone'] },
      { type: 'h2', content: 'How to choose' },
      { type: 'p', content: 'Choose round if you want the most sparkle and a timeless look. Choose oval if you like elongation, a contemporary style, or want to maximise perceived size on a budget.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare round and oval in the builder' }`,
  new: `      { type: 'p', content: 'Round brilliant and oval are the two most popular engagement diamond shapes. Rounds are cut for maximum brilliance; ovals offer elongation and often look larger per carat. Both are enduring choices—this guide helps you decide which fits her style and your priorities.' },
      { type: 'h2', content: 'Round brilliant' },
      { type: 'p', content: 'The round brilliant is engineered for maximum sparkle and fire. It is the most researched cut and remains the best-seller for engagement rings. It is classic and versatile and holds value well. More rough is lost in cutting than with ovals, so rounds often cost 15–20% more per carat for similar quality.' },
      { type: 'image', id: 'Round', caption: 'Round brilliants are cut for maximum sparkle and fire.' },
      { type: 'ul', items: ['Maximum sparkle and fire; the most researched cut', 'Classic and versatile; holds value well', 'More rough is lost in cutting, so often 15–20% more per carat than ovals'] },
      { type: 'h2', content: 'Oval' },
      { type: 'p', content: 'Oval diamonds elongate the finger and can look larger than a same-carat round. They have a softer, more modern feel and are very on-trend. Watch for bow-tie (a darker band across the middle) in poorer cuts—choose a well-cut stone and view it in different lights.' },
      { type: 'image', id: 'Oval', caption: 'Ovals elongate the finger and often look larger per carat.' },
      { type: 'ul', items: ['Elongates the finger; can look larger than a same-carat round', 'Softer, more "modern" feel; very on-trend', 'Watch for bow-tie (darker band across the middle)—choose a well-cut stone'] },
      { type: 'h2', content: 'How to choose' },
      { type: 'p', content: 'Choose round if you want the most sparkle and a timeless look. Choose oval if you like elongation, a contemporary style, or want to maximise perceived size on a budget. There is no wrong choice—both are beautiful and durable.' },
      { type: 'cta', to: 'RingBuilder', label: 'Compare round and oval in the builder' }`
};
if (s.includes(roundOval.old)) { s = s.replace(roundOval.old, roundOval.new); console.log('Replaced round-vs-oval'); } else { console.log('round-vs-oval: pattern not found'); }

// 3) how-much-does
const howMuchOld = `      { type: 'p', content: 'Engagement ring cost is one of the most-searched questions for soon-to-be engaged couples. The short answer: it depends on stone type, metal, and design—but you can get a beautiful, ethically sourced ring from around R15,000 to R500,000+ depending on your priorities.' },
      { type: 'h2', content: 'Average engagement ring cost' },
      { type: 'p', content: 'In South Africa and globally, reported "averages" (e.g. 2–3 months${AP} salary) are marketing myths, not rules. A better approach: set a budget you${AP}re comfortable with, then maximise value within it.' },
      { type: 'ul', items: ['Lab-grown diamond solitaire (e.g. 0.5–0.7 ct): roughly R25,000–R60,000', 'Natural diamond solitaire (0.5–0.7 ct, G–H, VS): roughly R80,000–R180,000', 'Moissanite or gemstone: from roughly R15,000', 'Platinum and halos add R10,000–R25,000+ to the setting'] },
      { type: 'h2', content: 'What drives the price?' },
      { type: 'p', content: 'Stone type (natural vs lab vs moissanite), carat and the 4Cs, metal (platinum vs gold vs silver), and setting style (solitaire, halo, pave) all affect cost. Custom, no-inventory jewellers often beat retail for the same specs.' },
      { type: 'tool', id: 'budget', title: 'Get a ballpark for your budget' },
      { type: 'cta', to: 'RingBuilder', label: 'Start your design' }`;
const howMuchNew = `      { type: 'p', content: 'Engagement ring cost is one of the most-searched questions for soon-to-be engaged couples. The short answer: it depends on stone type, metal, and design—but you can get a beautiful, ethically sourced ring from around R15,000 to R500,000+ depending on your priorities. This guide breaks down what you can expect at different price points and how to get the best value.' },
      { type: 'h2', content: 'Average engagement ring cost' },
      { type: 'p', content: 'In South Africa and globally, reported "averages" (e.g. 2–3 months${AP} salary) are marketing myths, not rules. A better approach: set a budget you${AP}re comfortable with, then maximise value within it. The ranges below assume a solitaire in 18k or platinum; halos and premium metals add to the total.' },
      { type: 'ul', items: ['Lab-grown diamond solitaire (e.g. 0.5–0.7 ct): roughly R25,000–R60,000', 'Natural diamond solitaire (0.5–0.7 ct, G–H, VS): roughly R80,000–R180,000', 'Moissanite or gemstone: from roughly R15,000', 'Platinum and halos add R10,000–R25,000+ to the setting'] },
      { type: 'h2', content: 'Quality tiers: what you get at each level' },
      { type: 'p', content: 'Many jewellers frame options as "maximise size," "balance," or "super high quality." These describe the trade-off between carat and the 4Cs. Maximise size prioritises carat and accepts lower colour and clarity; super high quality prioritises near-flawless stones and tends to cap carat for a given budget.' },
      { type: 'image', id: 'Maximize Size', caption: 'Maximise size: more carat, slight warmth or inclusions; great for yellow gold.' },
      { type: 'image', id: 'Balance Size & Quality', caption: 'Balance: eye-clean, near colourless; the most popular choice for engagement rings.' },
      { type: 'image', id: 'Super High Quality', caption: 'Super high quality: ultra white, no visible imperfections; the pinnacle of brilliance.' },
      { type: 'h2', content: 'What drives the price?' },
      { type: 'p', content: 'Stone type (natural vs lab vs moissanite), carat and the 4Cs, metal (platinum vs gold vs silver), and setting style (solitaire, halo, pave) all affect cost. Custom, no-inventory jewellers often beat retail for the same specs. Always compare like-for-like: the same 4Cs, cert, and metal.' },
      { type: 'tool', id: 'budget', title: 'Get a ballpark for your budget' },
      { type: 'cta', to: 'RingBuilder', label: 'Start your design' }`;
if (s.includes(howMuchOld)) { s = s.replace(howMuchOld, howMuchNew); console.log('Replaced how-much'); } else { console.log('how-much: pattern not found'); }

fs.writeFileSync(file, s);
console.log('Wrote blogArticles.ts');
