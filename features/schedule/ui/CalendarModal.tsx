'use client';

import { useEffect, useRef } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { toInputValue, fromInputValue } from '../lib/schedule';

interface Props {
  selected: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export default function CalendarModal({ selected, onSelect, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className="text-zinc-400" />
            <h3 className="text-white font-semibold text-lg">Wybierz datę</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors rounded-lg p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Data
            </label>
            <input
              type="date"
              defaultValue={toInputValue(selected)}
              onChange={(e) => {
                if (e.target.value) {
                  onSelect(fromInputValue(e.target.value));
                  onClose();
                }
              }}
              className="w-full bg-zinc-800 border border-zinc-600 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-400 transition-colors cursor-pointer"
            />
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Po wybraniu daty harmonogram zostanie automatycznie przeliczony
            dla tygodnia roboczego obejmującego tę datę.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
