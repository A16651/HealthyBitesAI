"use client";

import { ScanLine, Apple, Leaf, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
    message?: string;
    fullPage?: boolean;
}

export default function LoadingAnimation({
    message = "Analyzing your product...",
    fullPage = true
}: LoadingAnimationProps) {
    const icons = [ScanLine, Apple, Leaf, Heart];

    const content = (
        <div className="flex flex-col items-center justify-center gap-6">
            {/* Rotating icons */}
            <div className="relative h-24 w-24">
                {icons.map((Icon, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 animate-spin"
                        style={{
                            animationDuration: '3s',
                            animationDelay: `${index * 0.2}s`,
                        }}
                    >
                        <Icon
                            className={cn(
                                "h-8 w-8 absolute top-[-12px] left-1/2 -translate-x-1/2",
                                index === 0 && "text-primary",
                                index === 1 && "text-red-500",
                                index === 2 && "text-green-500",
                                index === 3 && "text-pink-500"
                            )}
                            style={{
                                opacity: 0.7 + (index * 0.1),
                            }}
                        />
                    </div>
                ))}

                {/* Center glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse" />
                </div>
            </div>

            {/* Loading text */}
            <div className="space-y-2 text-center">
                <p className="text-lg font-medium">{message}</p>
                <div className="flex items-center justify-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fadeIn">
                {content}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-12">
            {content}
        </div>
    );
}
