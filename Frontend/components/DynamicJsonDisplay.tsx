"use client";

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn, toTitleCase, isValidObject } from '@/lib/utils';

interface DynamicJsonDisplayProps {
    data: any;
    title?: string;
}

export default function DynamicJsonDisplay({ data, title = "Analysis Details" }: DynamicJsonDisplayProps) {
    if (!data) return null;

    return (
        <div className="space-y-4">
            {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
            <JsonRenderer value={data} level={0} />
        </div>
    );
}

function JsonRenderer({ value, level, keyName }: { value: any; level: number; keyName?: string }) {
    const [isExpanded, setIsExpanded] = useState(level === 0);

    // Handle null/undefined
    if (value === null || value === undefined) {
        return <span className="text-muted-foreground italic">Not available</span>;
    }

    // Handle arrays
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return <span className="text-muted-foreground italic">None</span>;
        }

        // If array of primitives, display as list
        if (value.every(item => typeof item !== 'object')) {
            return (
                <ul className="list-disc list-inside space-y-1 ml-4">
                    {value.map((item, idx) => (
                        <li key={idx} className="text-sm">{String(item)}</li>
                    ))}
                </ul>
            );
        }

        // If array of objects, render each
        return (
            <div className="space-y-2">
                {value.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-primary/30 pl-4">
                        <JsonRenderer value={item} level={level + 1} keyName={`Item ${idx + 1}`} />
                    </div>
                ))}
            </div>
        );
    }

    // Handle objects
    if (isValidObject(value)) {
        const entries = Object.entries(value).filter(([_, v]) => v !== undefined && v !== null);

        if (entries.length === 0) {
            return <span className="text-muted-foreground italic">No data</span>;
        }

        return (
            <div className={cn("space-y-3", level > 0 && "ml-4")}>
                {entries.map(([key, val]) => {
                    const isNested = isValidObject(val) || Array.isArray(val);
                    const displayKey = toTitleCase(key);

                    return (
                        <div
                            key={key}
                            className={cn(
                                "rounded-lg transition-all",
                                level === 0 && "border bg-card p-4 shadow-sm"
                            )}
                        >
                            {isNested ? (
                                <div>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-2 font-semibold text-lg mb-2 hover:text-primary transition-colors w-full"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-5 w-5" />
                                        ) : (
                                            <ChevronRight className="h-5 w-5" />
                                        )}
                                        {displayKey}
                                    </button>
                                    {isExpanded && (
                                        <div className="ml-7">
                                            <JsonRenderer value={val} level={level + 1} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {displayKey}
                                    </span>
                                    <div className="text-base">
                                        <JsonRenderer value={val} level={level + 1} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Handle booleans
    if (typeof value === 'boolean') {
        return (
            <span className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                value
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
            )}>
                {value ? "Yes" : "No"}
            </span>
        );
    }

    // Handle primitives (string, number)
    return <span className="text-base">{String(value)}</span>;
}
