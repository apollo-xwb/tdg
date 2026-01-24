
import React, { useState } from 'react';
import { RING_SIZE_DATA, type RingSizeRow } from '../ringSizeData';

interface RingSizeTableProps {
  onSelectRow?: (row: RingSizeRow) => void;
}

const RingSizeTable: React.FC<RingSizeTableProps> = ({ onSelectRow }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = searchTerm
    ? RING_SIZE_DATA.filter((item) => {
        const s = searchTerm.toLowerCase();
        return (
          (item.british && item.british.toLowerCase().includes(s)) ||
          (item.us && item.us.toLowerCase().includes(s)) ||
          (item.french && item.french.toLowerCase().includes(s)) ||
          (item.german && item.german.toLowerCase().includes(s)) ||
          (item.japanese && item.japanese.toLowerCase().includes(s)) ||
          (item.swiss && item.swiss.toLowerCase().includes(s)) ||
          item.diameterMM.includes(searchTerm) ||
          item.circumferenceMM.includes(searchTerm)
        );
      })
    : RING_SIZE_DATA;

  return (
    <div className="border border-current/10 rounded-sm min-w-0">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold">Ring Size Conversion Chart</h3>
        <input
          type="text"
          placeholder="Search sizes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-56 min-w-0 bg-white/5 border border-current/20 px-3 py-2 text-[10px] font-light focus:outline-none focus:border-current/40"
        />
      </div>

      {/* Mobile: 4-column table that fits without horizontal scroll */}
      <div className="md:hidden overflow-y-auto max-h-48 min-w-0">
        <table className="w-full text-left text-[10px]">
          <thead>
            <tr className="border-b border-current/10">
              <th className="text-[9px] uppercase tracking-widest font-bold px-2 py-2">mm</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-2 py-2">Circum.</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-2 py-2">UK/AU</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-2 py-2">US/CA</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry, i) => (
              <tr
                key={i}
                onClick={() => onSelectRow?.(entry)}
                className={`border-b border-current/5 ${onSelectRow ? 'cursor-pointer hover:bg-current/5' : ''}`}
              >
                <td className="px-2 py-1.5">{entry.diameterMM}</td>
                <td className="px-2 py-1.5">{entry.circumferenceMM}</td>
                <td className="px-2 py-1.5">{entry.british || '—'}</td>
                <td className="px-2 py-1.5">{entry.us || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[8px] uppercase tracking-widest opacity-50 px-2 pt-2 pb-1">Tap a row to select. Full chart on desktop.</p>
      </div>

      {/* Desktop: full 10-column table in a scroll container */}
      <div className="hidden md:block min-w-0 w-full overflow-x-auto overflow-y-auto max-h-48" style={{ WebkitOverflowScrolling: 'touch' }}>
        <table className="w-full text-left min-w-[680px]">
          <thead>
            <tr className="border-b border-current/10">
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Diameter (mm)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Diameter (in)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Circum. (mm)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Circum. (in)</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">British/AU</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">US/CA</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">FR/RU</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">German</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Japanese</th>
              <th className="text-[9px] uppercase tracking-widest font-bold px-3 py-2">Swiss</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((entry, i) => (
              <tr
                key={i}
                onClick={() => onSelectRow?.(entry)}
                className={`border-b border-current/5 text-[10px] ${onSelectRow ? 'cursor-pointer hover:bg-current/5' : ''}`}
              >
                <td className="px-3 py-1.5">{entry.diameterMM}</td>
                <td className="px-3 py-1.5">{entry.diameterInches}</td>
                <td className="px-3 py-1.5">{entry.circumferenceMM}</td>
                <td className="px-3 py-1.5">{entry.circumferenceInches}</td>
                <td className="px-3 py-1.5">{entry.british || '—'}</td>
                <td className="px-3 py-1.5">{entry.us || '—'}</td>
                <td className="px-3 py-1.5">{entry.french || '—'}</td>
                <td className="px-3 py-1.5">{entry.german || '—'}</td>
                <td className="px-3 py-1.5">{entry.japanese || '—'}</td>
                <td className="px-3 py-1.5">{entry.swiss || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RingSizeTable;
