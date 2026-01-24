/**
 * Ring size conversion data: diameter, circumference, and equivalents across
 * British/AU, US/CA, French/Russian, German, Japanese, Swiss.
 * Diameter = inside diameter in mm.
 */
export interface RingSizeRow {
  diameterMM: string;
  diameterInches: string;
  circumferenceMM: string;
  circumferenceInches: string;
  british: string;
  us: string;
  french: string;
  german: string;
  japanese: string;
  swiss: string;
}

// Build rows: diameter mm 12.0–24.5 in ~0.25mm steps, with standard size equivalents
const MM_PER_INCH = 25.4;
const PI = Math.PI;

// British (UK/SA) letter sizes A–Z and half sizes; US 0–13; approximate mapping
// Source: standard conversion charts. Some cells left "-" where no standard exists.
function buildRingSizeData(): RingSizeRow[] {
  const rows: RingSizeRow[] = [];
  // Pairs of [diameterMM, british, us, french, german, japanese, swiss] — french/german/japanese/swiss often in quarter sizes
  const ref: [number, string, string, string, string, string, string][] = [
    [11.63, '—', '0000', '38', '11 1/2', '—', '—'],
    [11.84, 'A', '0', '38 1/2', '12', '0', '0 1/2'],
    [12.04, 'A 1/2', '0 1/2', '39', '12 1/4', '1', '1'],
    [12.24, 'B', '1', '39 1/2', '12 1/2', '1 1/2', '1 1/4'],
    [12.45, 'B 1/2', '1 1/2', '40', '12 3/4', '2', '1 1/2'],
    [12.65, 'C', '2', '40 1/2', '13', '2 1/2', '1 3/4'],
    [12.85, 'C 1/2', '2 1/2', '41', '13 1/4', '3', '2'],
    [13.06, 'D', '3', '41 1/2', '13 1/2', '3 1/2', '2 1/4'],
    [13.26, 'D 1/2', '3 1/2', '42', '13 3/4', '4', '2 1/2'],
    [13.46, 'E', '4', '42 1/2', '14', '4 1/2', '2 3/4'],
    [13.67, 'E 1/2', '4 1/2', '43', '14 1/4', '5', '3'],
    [13.87, 'F', '5', '43 1/2', '14 1/2', '5 1/2', '3 1/4'],
    [14.07, 'F 1/2', '5 1/2', '44', '14 3/4', '6', '3 1/2'],
    [14.27, 'G', '6', '44 1/2', '15', '6 1/2', '3 3/4'],
    [14.48, 'G 1/2', '6 1/2', '45', '15 1/4', '7', '4'],
    [14.68, 'H', '7', '45 1/2', '15 1/2', '7 1/2', '4 1/4'],
    [14.88, 'H 1/2', '7 1/2', '46', '15 3/4', '8', '4 1/2'],
    [15.09, 'I', '8', '46 1/2', '16', '8 1/2', '4 3/4'],
    [15.29, 'I 1/2', '8 1/2', '47', '16 1/4', '9', '5'],
    [15.49, 'J', '9', '47 1/2', '16 1/2', '9 1/2', '5 1/4'],
    [15.70, 'J 1/2', '9 1/2', '48', '16 3/4', '10', '5 1/2'],
    [15.90, 'K', '10', '48 1/2', '17', '10 1/2', '5 3/4'],
    [16.10, 'K 1/2', '10 1/2', '49', '17 1/4', '11', '6'],
    [16.31, 'L', '11', '49 1/2', '17 1/2', '11 1/2', '6 1/4'],
    [16.51, 'L 1/2', '11 1/2', '50', '17 3/4', '12', '6 1/2'],
    [16.71, 'M', '12', '50 1/2', '18', '12 1/2', '6 3/4'],
    [16.92, 'M 1/2', '12 1/2', '51', '18 1/4', '13', '7'],
    [17.12, 'N', '13', '51 1/2', '18 1/2', '13 1/2', '7 1/4'],
    [17.32, 'N 1/2', '—', '52', '18 3/4', '14', '7 1/2'],
    [17.53, 'O', '—', '52 1/2', '19', '14 1/2', '7 3/4'],
    [17.73, 'O 1/2', '—', '53', '19 1/4', '15', '8'],
    [17.93, 'P', '—', '53 1/2', '19 1/2', '15 1/2', '8 1/4'],
    [18.14, 'P 1/2', '—', '54', '19 3/4', '16', '8 1/2'],
    [18.34, 'Q', '—', '54 1/2', '20', '16 1/2', '8 3/4'],
    [18.54, 'Q 1/2', '—', '55', '20 1/4', '17', '9'],
    [18.75, 'R', '—', '55 1/2', '20 1/2', '17 1/2', '9 1/4'],
    [18.95, 'R 1/2', '—', '56', '20 3/4', '18', '9 1/2'],
    [19.15, 'S', '—', '56 1/2', '21', '18 1/2', '9 3/4'],
    [19.36, 'S 1/2', '—', '57', '21 1/4', '19', '10'],
    [19.56, 'T', '—', '57 1/2', '21 1/2', '19 1/2', '10 1/4'],
    [19.76, 'T 1/2', '—', '58', '21 3/4', '20', '10 1/2'],
    [19.97, 'U', '—', '58 1/2', '22', '20 1/2', '10 3/4'],
    [20.17, 'U 1/2', '—', '59', '22 1/4', '21', '11'],
    [20.37, 'V', '—', '59 1/2', '22 1/2', '21 1/2', '11 1/4'],
    [20.58, 'V 1/2', '—', '60', '22 3/4', '22', '11 1/2'],
    [20.78, 'W', '—', '60 1/2', '23', '22 1/2', '11 3/4'],
    [20.98, 'W 1/2', '—', '61', '23 1/4', '23', '12'],
    [21.19, 'X', '—', '61 1/2', '23 1/2', '23 1/2', '12 1/4'],
    [21.39, 'X 1/2', '—', '62', '23 3/4', '24', '12 1/2'],
    [21.59, 'Y', '—', '62 1/2', '24', '24 1/2', '12 3/4'],
    [21.80, 'Z', '—', '63', '24 1/4', '25', '13'],
    [22.00, 'Z+1', '—', '63 1/2', '24 1/2', '25 1/2', '13 1/4'],
  ];

  for (const [d, british, us, french, german, japanese, swiss] of ref) {
    const circum = d * PI;
    rows.push({
      diameterMM: d.toFixed(2),
      diameterInches: (d / MM_PER_INCH).toFixed(3),
      circumferenceMM: circum.toFixed(2),
      circumferenceInches: (circum / MM_PER_INCH).toFixed(2),
      british: british,
      us: us,
      french: french,
      german: german,
      japanese: japanese,
      swiss: swiss,
    });
  }
  return rows;
}

export const RING_SIZE_DATA: RingSizeRow[] = buildRingSizeData();

/** System label to standard key and data column */
export const RING_SYSTEMS: { key: string; label: string; col: keyof RingSizeRow }[] = [
  { key: 'UK/SA', label: 'British & Australian', col: 'british' },
  { key: 'US/CA', label: 'US & Canada', col: 'us' },
  { key: 'FR/RU', label: 'French & Russian', col: 'french' },
  { key: 'German', label: 'German', col: 'german' },
  { key: 'Japanese', label: 'Japanese', col: 'japanese' },
  { key: 'Swiss', label: 'Swiss', col: 'swiss' },
  { key: 'mm', label: 'Custom (enter diameter)', col: 'diameterMM' },
];

export function findRowByDiameter(diameterMM: number): RingSizeRow | undefined {
  let best: RingSizeRow | undefined;
  let bestDiff = Infinity;
  for (const r of RING_SIZE_DATA) {
    const d = Math.abs(parseFloat(r.diameterMM) - diameterMM);
    if (d < bestDiff) {
      bestDiff = d;
      best = r;
    }
  }
  return best;
}

export function findRowBySystemAndSize(systemKey: string, size: string): RingSizeRow | undefined {
  const sys = RING_SYSTEMS.find(s => s.key === systemKey);
  if (!sys) return undefined;
  const col = sys.col;
  return RING_SIZE_DATA.find(r => String((r as any)[col]).toLowerCase() === String(size).toLowerCase());
}

/** Get distinct non-empty sizes for a system column, for dropdowns */
export function getSizesForSystem(systemKey: string): { value: string; label: string }[] {
  if (systemKey === 'mm') return [];
  const sys = RING_SYSTEMS.find(s => s.key === systemKey);
  if (!sys) return [];
  const col = sys.col;
  const set = new Set<string>();
  for (const r of RING_SIZE_DATA) {
    const v = (r as any)[col];
    if (v && v !== '—' && v !== '-') set.add(String(v));
  }
  return Array.from(set).sort((a, b) => {
    // Numeric sort if possible, else string
    const an = parseFloat(a), bn = parseFloat(b);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.localeCompare(b, undefined, { numeric: true });
  }).map(v => ({ value: v, label: v }));
}
