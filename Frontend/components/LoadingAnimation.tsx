"use client";

import { useState, useEffect, useRef } from 'react';
import { ScanLine, Apple, Leaf, Heart, Sparkles, Shield, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
    message?: string;
    fullPage?: boolean;
}

const healthFacts = [
    "🥗 Reading nutrition labels can help you make healthier choices and avoid hidden sugars.",
    "🍎 Whole foods with minimal ingredients are generally healthier than processed alternatives.",
    "⚠️ The first three ingredients make up the majority of a product's content.",
    "🧂 Adults should consume less than 2,300mg of sodium per day for optimal health.",
    "🍬 Added sugars can hide under 60+ different names on ingredient lists.",
    "🌾 Whole grains provide more fiber and nutrients than refined grains.",
    "🥛 Check for artificial additives - natural alternatives are often healthier.",
    "💪 Protein helps build and repair tissues - aim for quality sources.",
    "🎨 Artificial colors may be linked to hyperactivity in some children.",
    "🔬 E-numbers are food additives - some are natural, others synthetic.",
    "🌿 Organic products have stricter regulations on pesticide use.",
    "⚡ Trans fats should be avoided - they increase bad cholesterol levels.",
    "🍊 Vitamin C helps boost immunity and iron absorption.",
    "🦴 Calcium and Vitamin D work together for strong bones.",
    "🧠 Omega-3 fatty acids support brain health and development."
];

const analysisStages = [
    { label: "Scanning ingredients", icon: ScanLine, progress: 15 },
    { label: "Analyzing nutritional content", icon: Apple, progress: 30 },
    { label: "Checking for allergens", icon: Shield, progress: 50 },
    { label: "Evaluating additives", icon: Sparkles, progress: 70 },
    { label: "Calculating health score", icon: TrendingUp, progress: 85 },
    { label: "Generating recommendations", icon: Award, progress: 100 }
];

export default function LoadingAnimation({
    message = "Analyzing your product...",
    fullPage = true
}: LoadingAnimationProps) {
    const [currentFact, setCurrentFact] = useState(0);
    const [progress, setProgress] = useState(0);
    const [currentStage, setCurrentStage] = useState(0);
    const [showFact, setShowFact] = useState(true);

    useEffect(() => {
        // Rotate facts every 5 seconds
        const factInterval = setInterval(() => {
            setShowFact(false);
            setTimeout(() => {
                setCurrentFact((prev) => (prev + 1) % healthFacts.length);
                setShowFact(true);
            }, 300);
        }, 5500);

        // Progress bar animation (0-100% over 30 seconds)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + (100 / 320); // 30 seconds = 300 intervals of 100ms
            });
        }, 100);

        // Stage progression
        const stageInterval = setInterval(() => {
            setCurrentStage((prev) => {
                if (prev >= analysisStages.length - 1) return prev;
                return prev + 1;
            });
        }, 5500);

        return () => {
            clearInterval(factInterval);
            clearInterval(progressInterval);
            clearInterval(stageInterval);
        };
    }, []);

    const icons = [ScanLine, Apple, Leaf, Heart];
    const spinnerRef = useRef<HTMLDivElement | null>(null);
    const colorVariants = [
        `hsl(var(--primary) / 0.85)`,
        '#3b82f6',
        '#10b981',
        '#f472b6'
    ];
    const [spinnerColorIndex, setSpinnerColorIndex] = useState(0);

    const content = (
        <div className="flex flex-col items-center justify-center gap-8 max-w-2xl mx-auto px-6">
            {/* Animated Icon Circle - Pure CSS Color Animation */}
                <div className="relative h-32 w-32">
                {/* Outer rotating ring with color cycling - on each animation iteration we advance color */}
                <div
                    ref={spinnerRef}
                    onAnimationIteration={() => setSpinnerColorIndex((p) => (p + 1) % colorVariants.length)}
                    className="absolute inset-0 rounded-full border-4 animate-spinner-rotate"
                    style={{
                        borderColor: colorVariants[spinnerColorIndex],
                        boxShadow: `0 0 20px ${colorVariants[spinnerColorIndex]}`,
                        transition: 'border-color 220ms ease, box-shadow 220ms ease'
                    }}
                />

                <div className="absolute inset-2 rounded-full border-4 animate-spinner-rotate" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />

                {/* Rotating icons */}
                {icons.map((Icon, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 animate-spin"
                        style={{
                            animationDuration: '4s',
                            animationDelay: `${index * 0.25}s`,
                        }}
                    >
                        <Icon
                            className={cn(
                                "h-10 w-10 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 drop-shadow-lg",
                                index === 0 && "text-primary",
                                index === 1 && "text-red-500",
                                index === 2 && "text-green-500",
                                index === 3 && "text-pink-500"
                            )}
                            style={{
                                opacity: 0.8,
                            }}
                        />
                    </div>
                ))}

                {/* Center pulsing glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/30 animate-ping" />
                    <div className="absolute h-12 w-12 rounded-full bg-primary/40 animate-pulse" />
                </div>
            </div>

            {/* Main message */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-green-500 to-primary bg-clip-text text-transparent animate-pulse">
                    {message}
                </h2>
                <div className="flex items-center justify-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-3">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50 backdrop-blur">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-green-500 to-primary rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{Math.round(progress)}%</span>
                    <span className="text-muted-foreground">~{Math.max(0, Math.round(30 - (progress / 100) * 30))}s remaining</span>
                </div>
            </div>

            {/* Current Stage */}
            <div className="w-full space-y-4">
                {analysisStages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    const isActive = index === currentStage;
                    const isCompleted = index < currentStage;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-lg border transition-all duration-500",
                                isActive && "bg-primary/10 border-primary/50 scale-105 shadow-lg",
                                isCompleted && "bg-green-500/10 border-green-500/30 opacity-70",
                                !isActive && !isCompleted && "bg-secondary/20 border-border/30 opacity-40"
                            )}
                        >
                            <div className={cn(
                                "rounded-full p-2 transition-all",
                                isActive && "bg-primary/20 animate-pulse",
                                isCompleted && "bg-green-500/20",
                                !isActive && !isCompleted && "bg-secondary/30"
                            )}>
                                <StageIcon className={cn(
                                    "h-5 w-5",
                                    isActive && "text-primary",
                                    isCompleted && "text-green-500",
                                    !isActive && !isCompleted && "text-muted-foreground"
                                )} />
                            </div>
                            <span className={cn(
                                "font-medium transition-all",
                                isActive && "text-foreground",
                                isCompleted && "text-green-600 dark:text-green-400",
                                !isActive && !isCompleted && "text-muted-foreground"
                            )}>
                                {stage.label}
                            </span>
                            {isCompleted && (
                                <div className="ml-auto">
                                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center animate-scaleIn">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Health Facts Carousel */}
            <div className="w-full mt-6">
                <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-green-500/5 to-primary/5 p-6 backdrop-blur">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />

                    <div className="relative">
                        <div className="flex items-start gap-3 mb-2">
                            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-1 animate-pulse" />
                            <h3 className="font-semibold text-sm text-primary">Did you know?</h3>
                        </div>
                        <p className={cn(
                            "text-foreground leading-relaxed transition-all duration-300",
                            showFact ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        )}>
                            {healthFacts[currentFact]}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fun Loading Indicators */}
            <div className="flex items-center gap-6 mt-4">
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <Apple className="h-8 w-8 text-red-500 animate-bounce" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping" />
                    </div>
                    <span className="text-xs text-muted-foreground">Scanning</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-blue-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Checking</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Award className="h-8 w-8 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="text-xs text-muted-foreground">Scoring</span>
                </div>
            </div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm animate-fadeIn overflow-y-auto py-8">
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
