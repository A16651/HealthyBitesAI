"use client";

import { useSettings } from './AppProviders';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { printJsonOnError, setPrintJsonOnError } = useSettings();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full max-w-md rounded-xl border bg-card shadow-2xl",
                    "animate-slideUp"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-secondary transition-colors"
                        aria-label="Close settings"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Print JSON on Error Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <label
                                htmlFor="json-toggle"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Print JSON on Error
                            </label>
                            <p className="text-sm text-muted-foreground">
                                Display raw JSON response when errors occur
                            </p>
                        </div>
                        <button
                            id="json-toggle"
                            role="switch"
                            aria-checked={printJsonOnError}
                            onClick={() => setPrintJsonOnError(!printJsonOnError)}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                printJsonOnError ? "bg-primary" : "bg-input"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-lg",
                                    printJsonOnError ? "translate-x-6" : "translate-x-1"
                                )}
                            />
                        </button>
                    </div>

                    {/* Future settings can be added here */}
                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground text-center">
                            More settings coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
