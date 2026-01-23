"use client";

import React, { useState } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { useSettings, useTheme } from './AppProviders';

function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { printJsonOnError, setPrintJsonOnError } = useSettings();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-md bg-card p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Print JSON on Error</div>
            <div className="text-sm text-muted-foreground">Show raw AI response when a page errors.</div>
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={printJsonOnError} onChange={(e) => setPrintJsonOnError(e.target.checked)} />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded bg-primary px-3 py-1 text-primary-foreground">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function HeaderComponent() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <>
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-secondary">
          <Settings className="h-5 w-5" />
        </button>

        <button onClick={toggle} aria-pressed={dark} className="p-2 rounded-md hover:bg-secondary">
          {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
      </div>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
