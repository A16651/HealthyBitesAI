"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResultContext } from '../../../components/AppProviders';
import LoadingAnimation from '../../../components/LoadingAnimation';
import AnalysisDisplay from '../../../components/AnalysisDisplay';
import { ArrowLeft, AlertTriangle, Info } from "lucide-react";
import { getApiUrl } from '@/lib/config';
import { getImageUrl } from '@/lib/utils';

export default function AnalysisPage() {
    const params = useParams();
    const router = useRouter();
    const [analysisText, setAnalysisText] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setCacheEntry, currentProduct, cache } = useResultContext();

    useEffect(() => {
        let mounted = true;
        if (!params.id) return;

        // Ensure id is a string (Next.js dynamic routes can be string | string[])
        const id = Array.isArray(params.id) ? params.id[0] : params.id;

        // Try use cache first
        const tryUseCache = () => {
            try {
                const c = (window as any).__FD_CACHE__ ?? null;
                if (c && c[id]) {
                    setAnalysisText(c[id]);
                    setLoading(false);
                    return true;
                }
            } catch (e) { }
            try {
                if (cache && cache[id]) {
                    setAnalysisText(cache[id]);
                    setLoading(false);
                    return true;
                }
            } catch (e) { }
            return false;
        };

        if (tryUseCache()) return;

        // Fetch from backend (now expecting plain text response)
        fetch(getApiUrl('ANALYZE', `${id}`), { method: "POST" })
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch analysis");
                return res.text(); // Changed from res.json() to res.text()
            })
            .then(async (text) => {
                if (!mounted) return;

                setAnalysisText(text);
                try {
                    setCacheEntry(id, text);
                    (window as any).__FD_CACHE__ = { ...(window as any).__FD_CACHE__ || {}, [id]: text };
                } catch (e) { }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [params.id]);


    if (loading) {
        return <LoadingAnimation message="Analyzing product..." fullPage />;
    }

    if (error || !analysisText) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-fadeIn">
                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Analysis Failed</h1>
                <p className="text-muted-foreground mb-6">{error || "Could not retrieve data"}</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const displayImage = getImageUrl(currentProduct?.image_url);
    const displayName = currentProduct?.product_name || 'Product';
    const displayBrand = currentProduct?.brand;

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 animate-fadeIn">
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 flex items-center border-b border-border/40 bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <button
                    onClick={() => router.back()}
                    className="mr-4 rounded-full p-2 hover:bg-secondary transition-all hover:scale-110"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-3">
                    {displayImage && (
                        <div className="h-10 w-10 overflow-hidden rounded-md border bg-white p-1">
                            <img src={displayImage} alt="mini" className="h-full w-full object-contain" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-lg font-bold line-clamp-1">{displayName}</h1>
                        {displayBrand && <p className="text-xs text-muted-foreground">{displayBrand}</p>}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">

                {/* Hero Product Image */}
                <div className="mb-10 flex justify-center animate-scaleIn">
                    <div className="relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-xl border bg-white shadow-lg p-6">
                        {displayImage ? (
                            <img
                                src={displayImage}
                                alt={displayName}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                                No Image Available
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Text Display */}
                <div className="rounded-xl border bg-card p-6 shadow-md hover:shadow-lg transition-all animate-slideUp">
                    <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
                        <Info className="h-6 w-6 text-primary" />
                        Product Analysis
                    </h2>
                    <AnalysisDisplay analysisText={analysisText} />
                </div>

            </main>
        </div>
    );
}
