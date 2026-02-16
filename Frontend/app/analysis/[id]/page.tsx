"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResultContext } from '../../../components/AppProviders';
import LoadingAnimation from '../../../components/LoadingAnimation';
import AnalysisDisplay from '../../../components/AnalysisDisplay';
import { ArrowLeft, AlertTriangle, Home, Share2, Download } from "lucide-react";
import { getApiUrl } from '@/lib/config';
import { getImageUrl } from '@/lib/utils';

interface AnalysisResponse {
    product_name: string;
    analysis_sections: string[];
}

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    const [analysisSections, setAnalysisSections] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setCacheEntry, currentProduct, cache } = useResultContext();

    useEffect(() => {
        let mounted = true;
        if (!params.id) return;

        const id = Array.isArray(params.id) ? params.id[0] : params.id;

        // Try use cache first
        const tryUseCache = () => {
            try {
                const c = (window as any).__FD_CACHE__ ?? null;
                if (c && c[id]) {
                    const cached = c[id];
                    if (Array.isArray(cached)) {
                        setAnalysisSections(cached);
                    } else if (typeof cached === 'string') {
                        setAnalysisText(cached);
                    } else {
                        // If cached is an object (e.g., full API response), extract what we need
                        if (cached?.analysis_sections && Array.isArray(cached.analysis_sections)) {
                            setAnalysisSections(cached.analysis_sections);
                        } else {
                            setAnalysisText(String(cached));
                        }
                    }
                    setLoading(false);
                    return true;
                }
            } catch (e) { }
            try {
                if (cache && cache[id]) {
                    const cached = cache[id];
                    if (Array.isArray(cached)) {
                        setAnalysisSections(cached);
                    } else if (typeof cached === 'string') {
                        setAnalysisText(cached);
                    } else {
                        if (cached?.analysis_sections && Array.isArray(cached.analysis_sections)) {
                            setAnalysisSections(cached.analysis_sections);
                        } else {
                            setAnalysisText(String(cached));
                        }
                    }
                    setLoading(false);
                    return true;
                }
            } catch (e) { }
            return false;
        };

        if (tryUseCache()) return;

        // Fetch from backend
        fetch(getApiUrl('ANALYZE', `${id}`), { method: "POST" })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch analysis");
                return res.json();
            })
            .then(async (data: AnalysisResponse) => {
                if (!mounted) return;

                // Handle new format with analysis_sections
                if (data.analysis_sections && Array.isArray(data.analysis_sections)) {
                    setAnalysisSections(data.analysis_sections);
                    try {
                        setCacheEntry(id, data.analysis_sections);
                        (window as any).__FD_CACHE__ = { ...(window as any).__FD_CACHE__ || {}, [id]: data.analysis_sections };
                    } catch (e) { }
                } else if (typeof data === 'string') {
                    // Fallback for plain text responses
                    setAnalysisText(data);
                    try {
                        setCacheEntry(id, data);
                        (window as any).__FD_CACHE__ = { ...(window as any).__FD_CACHE__ || {}, [id]: data };
                    } catch (e) { }
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [params.id]);


    if (loading) {
        return (
            <div className="pt-16 md:pt-20">
                <LoadingAnimation message="Analyzing product..." fullPage />
            </div>
        );
    }

    if (error || (!analysisText && analysisSections.length === 0)) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-fadeIn">
                <div className="rounded-full bg-destructive/10 p-6 mb-6 animate-pulse">
                    <AlertTriangle className="h-16 w-16 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Analysis Failed</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{error || "Could not retrieve analysis data. Please try again."}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex h-11 items-center justify-center rounded-xl border-2 border-input bg-background px-8 text-sm font-semibold shadow-md transition-all hover:bg-accent hover:scale-105 active:scale-95"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </button>
                </div>
            </div>
        );
    }

    const displayImage = getImageUrl(currentProduct?.image_url);
    const displayName = currentProduct?.product_name || 'Product';
    const displayBrand = currentProduct?.brand;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && 'share' in navigator) {
            try {
                await navigator.share({
                    title: `${displayName} - Health Analysis`,
                    text: `Check out the health analysis for ${displayName}`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        }
    };

    const canShare = typeof navigator !== 'undefined' && 'share' in navigator;

    // Use sections if available, otherwise convert text to sections format
    const sectionsToDisplay = analysisSections.length > 0 ? analysisSections : (analysisText ? [analysisText] : []);

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header / Nav */}
            <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg animate-slideDown">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="rounded-xl p-2.5 hover:bg-secondary transition-all hover:scale-110 active:scale-95"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        {displayImage && (
                            <div className="h-12 w-12 overflow-hidden rounded-lg border-2 border-primary/20 bg-white p-1.5 shadow-md">
                                <img src={displayImage} alt="mini" className="h-full w-full object-contain" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-bold line-clamp-1">{displayName}</h1>
                            {displayBrand && <p className="text-xs text-muted-foreground">{displayBrand}</p>}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {canShare && (
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center justify-center rounded-lg p-2.5 hover:bg-secondary transition-all hover:scale-110 active:scale-95"
                            title="Share"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Home</span>
                    </button>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-5xl">

                {/* Hero Product Image */}
                <div className="mb-12 flex justify-center animate-scaleIn">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-green-500/20 to-primary/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
                        <div className="relative h-72 w-72 md:h-96 md:w-96 overflow-hidden rounded-2xl border-2 border-primary/20 bg-white shadow-2xl p-8 transition-all group-hover:scale-105 group-hover:border-primary/40">
                            {displayImage ? (
                                <img
                                    src={displayImage}
                                    alt={displayName}
                                    className="h-full w-full object-contain transition-transform group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground rounded-xl">
                                    <div className="text-center">
                                        <AlertTriangle className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                        <p>No Image Available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Info Card */}
                <div className="mb-8 rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg backdrop-blur animate-slideUp">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
                            {displayBrand && (
                                <p className="text-lg text-muted-foreground">by {displayBrand}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Analysis Display */}
                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    {analysisSections.length > 0 ? (
                        <AnalysisDisplay analysisSections={analysisSections} />
                    ) : (
                        <AnalysisDisplay analysisText={analysisText || ''} />
                    )}
                </div>

            </main>
        </div>
    );
}
