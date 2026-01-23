"use client";

import React, { useState } from 'react';
import { ResultData } from './types/result';
import ErrorBoundary from './ErrorBoundary';

type Props = { data?: ResultData };

const verdictThemes: Record<string, { bg: string; text: string; icon: string }> = {
  Avoid: { bg: 'bg-red-50', text: 'text-red-700', icon: '⚠️' },
  Caution: { bg: 'bg-orange-50', text: 'text-orange-700', icon: '⚠️' },
  Safe: { bg: 'bg-green-50', text: 'text-green-800', icon: '✅' },
};

function getTheme(verdict?: string) {
  if (!verdict) return verdictThemes.Caution;
  if (/avoid/i.test(verdict)) return verdictThemes.Avoid;
  if (/safe|occasional/i.test(verdict)) return verdictThemes.Safe;
  return verdictThemes.Caution;
}

export default function ResultDetails({ data }: Props) {
  const safe = data ?? {};
  const theme = getTheme(safe.overall_verdict);

  const [openAlerts, setOpenAlerts] = useState<{ [k: string]: boolean }>({});
  const [openRisks, setOpenRisks] = useState<Record<number, boolean>>({});

  const toggleAlert = (key: string) =>
    setOpenAlerts((s) => ({ ...s, [key]: !s[key] }));

  const toggleRisk = (idx: number) => setOpenRisks((s) => ({ ...s, [idx]: !s[idx] }));

  return (
    <ErrorBoundary>
      <div className={`p-6 rounded-md shadow-sm ${theme.bg}`}>
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{safe.product_name ?? 'Unknown Product'}</h1>
            <p className="mt-1 text-sm text-slate-700">{safe.summary ?? 'No summary available.'}</p>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium uppercase text-slate-600">Verdict</div>
            <div className={`${theme.text} mt-1 inline-flex items-center gap-2 text-lg font-semibold`}>
              <span aria-hidden>{theme.icon}</span>
              <span>{safe.overall_verdict ?? 'Caution'}</span>
            </div>
          </div>
        </header>

        {/* Alerts */}
        {safe.alerts && (
          <div className="mt-6">
            <div className="flex flex-wrap gap-3">
              {['maida_trap', 'sugar_trap', 'fake_marketing'].map((key) => {
                const item = (safe.alerts as any)[key] as any;
                if (!item || !item.detected) return null;
                const label = {
                  maida_trap: 'Maida Trap',
                  sugar_trap: 'Sugar Trap',
                  fake_marketing: 'Fake Marketing',
                }[key];
                return (
                  <div key={key} className="relative">
                    <button
                      onClick={() => toggleAlert(key)}
                      className="px-3 py-1.5 bg-white/90 border border-slate-200 rounded-md shadow-sm flex items-center gap-2 text-sm hover:brightness-95"
                      aria-expanded={!!openAlerts[key]}
                      aria-controls={`alert-${key}`}
                    >
                      <span className="text-yellow-700">⚠️</span>
                      <span className="font-medium">{label}</span>
                    </button>

                    {openAlerts[key] && (
                      <div id={`alert-${key}`} className="mt-2 p-3 w-64 bg-white rounded-md border border-slate-100 shadow">
                        <div className="text-sm text-slate-700">{item.explanation ?? 'No explanation provided.'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Health risks */}
        {safe.health_risks && safe.health_risks.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">⚠️ Health Risks</h2>
            <div className="mt-3 grid gap-3">
              {safe.health_risks.map((hr, i) => (
                <article key={i} className="p-4 bg-white rounded-md border border-slate-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{hr.ingredient}</div>
                      <div className="text-xs text-slate-600">{hr.risk}</div>
                    </div>
                    <button
                      onClick={() => toggleRisk(i)}
                      aria-expanded={!!openRisks[i]}
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Learn more <span className="ml-1">›</span>
                    </button>
                  </div>
                  {openRisks[i] && (
                    <div className="mt-3 text-sm text-slate-700">{hr.health_impact ?? 'No details available.'}</div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Marketing Truth table */}
        {safe.marketing_traps && safe.marketing_traps.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-800">Truth Table</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="text-left text-sm text-slate-600">
                    <th className="py-2 pr-4">Claim</th>
                    <th className="py-2">Reality</th>
                  </tr>
                </thead>
                <tbody>
                  {safe.marketing_traps!.map((m, idx) => (
                    <tr key={idx} className="align-top border-t border-slate-100">
                      <td className="py-3 pr-4 text-sm text-slate-500 line-through opacity-80">{m.claim}</td>
                      <td className="py-3 text-sm font-semibold text-slate-900">{m.reality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Population warnings */}
        {safe.population_warnings && (
          <section className="mt-6">
            <h3 className="text-sm font-medium text-slate-800">Population Warnings</h3>
            <div className="mt-2 text-sm text-slate-700">
              {safe.population_warnings.children && (
                <div>- Children: {safe.population_warnings.children}</div>
              )}
              {safe.population_warnings.diabetics && (
                <div>- Diabetics: {safe.population_warnings.diabetics}</div>
              )}
            </div>
          </section>
        )}
      </div>
    </ErrorBoundary>
  );
}
