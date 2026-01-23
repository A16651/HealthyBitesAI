"use client";

import { useState } from 'react';
import { X, Barcode as BarcodeIcon, Search } from 'lucide-react';

interface BarcodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (barcode: string) => void;
}

export default function BarcodeModal({ isOpen, onClose, onSearch }: BarcodeModalProps) {
    const [barcode, setBarcode] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!barcode.trim()) {
            setError('Please enter a barcode');
            return;
        }

        // Basic validation: barcode should be numeric and have reasonable length
        if (!/^\d+$/.test(barcode.trim())) {
            setError('Barcode should contain only numbers');
            return;
        }

        onSearch(barcode.trim());
        handleClose();
    };

    const handleClose = () => {
        setBarcode('');
        setError(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-xl border bg-card shadow-2xl animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <BarcodeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Enter Barcode</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-full p-2 hover:bg-secondary transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="barcode-input" className="text-sm font-medium text-muted-foreground">
                            Product Barcode
                        </label>
                        <div className="relative">
                            <BarcodeIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input
                                id="barcode-input"
                                type="text"
                                placeholder="e.g., 8901058851441"
                                value={barcode}
                                onChange={(e) => {
                                    setBarcode(e.target.value);
                                    setError(null);
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background/80 backdrop-blur px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter the numerical barcode found on the product packaging
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
