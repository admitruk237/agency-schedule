'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowDown, ArrowUp, Check, Loader2 } from 'lucide-react';
import {
  AgencyName,
  DEFAULT_ROTATION_CONFIG,
  RotationConfig,
} from '@/features/schedule/lib/schedule';

const CORRIDOR_SLOTS = ['30-31', '36', '37'];
const CORRIDOR_AGENCIES: Exclude<AgencyName, 'PT'>[] = ['Olensen', 'Progres', 'Synergia'];

function moveItem<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function OrderEditor({
  title,
  description,
  order,
  onChange,
}: {
  title: string;
  description: string;
  order: AgencyName[];
  onChange: (next: AgencyName[]) => void;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-zinc-500 mb-4">{description}</p>
      <ol className="space-y-2">
        {order.map((agency, index) => (
          <li
            key={agency}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-white">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-700 text-xs text-zinc-300">
                {index + 1}
              </span>
              {agency}
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(moveItem(order, index, -1))}
                disabled={index === 0}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-700 transition-colors"
                aria-label="Przesuń wyżej"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(moveItem(order, index, 1))}
                disabled={index === order.length - 1}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-700 transition-colors"
                aria-label="Przesuń niżej"
              >
                <ArrowDown size={14} />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AdminPage() {
  const [config, setConfig] = useState<RotationConfig>(DEFAULT_ROTATION_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/rotation')
      .then((res) => res.json())
      .then((data: RotationConfig) => setConfig(data))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setSavedAt(null);
    await fetch('/api/rotation', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Powrót do harmonogramu
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Panel administracyjny
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Tutaj można zmienić kolejność rotacji oznaczeń (Przeceny, Haly, 16:00) oraz
          początkowe korytarze. Pierwsza pozycja na liście odpowiada bieżącemu tygodniu
          referencyjnemu (tydzień 0, niedziela 17.05.2026).
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 size={16} className="animate-spin" />
            Wczytywanie...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <OrderEditor
                title="Przeceny"
                description="Kolejność agencji wykonujących przeceny."
                order={config.przecenyOrder}
                onChange={(next) => setConfig({ ...config, przecenyOrder: next })}
              />
              <OrderEditor
                title="Haly"
                description="Kolejność agencji wożących haly."
                order={config.halyOrder}
                onChange={(next) => setConfig({ ...config, halyOrder: next })}
              />
              <OrderEditor
                title="16:00"
                description="Kolejność agencji z wcześniejszym wyjściem (Olensen, Progres, Synergia)."
                order={config.sixteenOrder}
                onChange={(next) => setConfig({ ...config, sixteenOrder: next })}
              />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Korytarze startowe</h3>
              <p className="text-xs text-zinc-500 mb-4">
                Korytarz przypisany każdej agencji w tygodniu referencyjnym (PT ma zawsze
                korytarz 35).
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                {CORRIDOR_AGENCIES.map((agency) => (
                  <label
                    key={agency}
                    className="flex flex-col gap-2 px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700"
                  >
                    <span className="text-sm font-medium text-white">{agency}</span>
                    <select
                      value={config.corridorInitial[agency]}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          corridorInitial: {
                            ...config.corridorInitial,
                            [agency]: Number(e.target.value),
                          },
                        })
                      }
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white"
                    >
                      {CORRIDOR_SLOTS.map((slot, idx) => (
                        <option key={slot} value={idx}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-200 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Zapisz zmiany
              </button>
              {savedAt && (
                <span className="text-xs text-emerald-400">Zapisano!</span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
