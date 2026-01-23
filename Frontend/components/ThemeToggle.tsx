"use client";

import { useTheme } from './AppProviders';
import { Flashlight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
    const { dark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            className={cn(
                "relative rounded-full p-2.5 transition-all duration-300",
                "hover:scale-110 hover:rotate-12",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                dark ? "bg-slate-800 text-yellow-300" : "bg-slate-200 text-slate-700"
            )}
            aria-label="Toggle theme"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative">
                <Flashlight
                    className={cn(
                        "h-5 w-5 transition-all duration-300",
                        dark ? "rotate-0" : "rotate-180"
                    )}
                />

                {/* Animated light beam effect */}
                <div
                    className={cn(
                        "absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none",
                        "transition-all duration-500",
                        dark ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    )}
                >
                    <div className="relative">
                        {/* Light beam rays */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse rotate-12" style={{ animationDelay: '0.1s' }} />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-t from-yellow-400 to-transparent animate-pulse -rotate-12" style={{ animationDelay: '0.2s' }} />

                        {/* Glow effect */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-300 rounded-full blur-md animate-pulse" />
                    </div>
                </div>
            </div>
        </button>
    );
}
