"use client";

import { useEffect, useState } from "react";
import { useResultContext } from '../../../components/AppProviders';
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Home } from "lucide-react";

import { getApiUrl, EXTERNAL_APIS } from '@/lib/config';
import { getImageUrl } from '@/lib/utils';

interface IngredientsResult {
    product_name: string;
    brand?: string;
    image_url?: string;
    ingredients_text?: string;
    nutriments?: {
        [key: string]: any;
    };
    [key: string]: any;
}

export default function IngredientsPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<IngredientsResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { setCacheEntry, currentProduct, cache } = useResultContext();

    useEffect(() => {
        let mounted = true;
        if (!params.id) return;

        // Ensure id is a string (Next.js dynamic routes can be string | string[])
        const id = Array.isArray(params.id) ? params.id[0] : params.id;

        // try use cache from context first
        try {
            if (cache && cache[id]) {
                setData(cache[id]);
                setLoading(false);
                return;
            }
        } catch (e) { }

        fetch(getApiUrl('PRODUCT', `${id}`))
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch ingredients");
                return res.json();
            })
            .then(async (d) => {
                if (!mounted) return;
                setData(d);
                try {
                    setCacheEntry(id, d);
                    (window as any).__FD_CACHE__ = { ...(window as any).__FD_CACHE__ || {}, [id]: d };
                } catch (e) { }

                // Fetch image if missing
                try {
                    if (!d.image_url && id && /^\d+$/.test(id)) {
                        fetch(EXTERNAL_APIS.OPEN_FOOD_FACTS.PRODUCT(id))
                            .then(r => r.json())
                            .then((of) => {
                                try {
                                    const img = of?.product?.image_front_url || of?.product?.image_small_url;
                                    if (img) {
                                        setData((prev: any) => ({ ...(prev || d), image_url: img }));
                                    }
                                } catch (e) { }
                            }).catch(() => { });
                    }
                } catch (e) { }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [params.id]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background animate-fadeIn">
                <div className="relative h-16 w-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Fetching Ingredients...</h2>
                <div className="flex items-center justify-center gap-1 mt-3">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-fadeIn">
                <div className="rounded-full bg-destructive/10 p-6 mb-6 animate-pulse">
                    <AlertCircle className="h-16 w-16 text-destructive" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Error Loading Ingredients</h1>
                <p className="text-destructive mb-4 text-lg font-semibold">{error || "No data found"}</p>
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

    const displayImage = getImageUrl(data?.image_url);
    const displayName = data?.product_name || 'Product';
    const displayBrand = data?.brand;
    const ingredientsText = data?.ingredients_text || 'No ingredients information available';

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
                <button
                    onClick={() => router.push('/')}
                    className="inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Home className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Home</span>
                </button>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Two Column Layout: Image on Left, Ingredients on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">

                    {/* Left Column: Product Image */}
                    <div className="flex items-center justify-center lg:justify-start animate-slideInLeft">
                        <div className="relative group w-full max-w-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-green-500/20 to-primary/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
                            <div className="relative h-96 overflow-hidden rounded-2xl border-2 border-primary/20 bg-white shadow-2xl p-8 transition-all group-hover:scale-105 group-hover:border-primary/40 flex items-center justify-center">
                                {displayImage ? (
                                    <img
                                        src={displayImage}
                                        alt={displayName}
                                        className="h-full w-full object-contain transition-transform group-hover:scale-110 animate-scaleIn"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground rounded-xl">
                                        <div className="text-center">
                                            <AlertCircle className="h-16 w-16 mx-auto mb-2 opacity-50" />
                                            <p>No Image Available</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Product Info Card Below Image */}
                            <div className="mt-6 rounded-xl border border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-lg animate-slideUp">
                                <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
                                {displayBrand && (
                                    <p className="text-muted-foreground">by {displayBrand}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ingredients Content */}
                    <div className="flex flex-col gap-6 animate-slideInRight">
                        {/* Ingredients Section */}
                        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-lg hover:shadow-xl transition-all">
                            <h3 className="text-2xl font-bold mb-4 text-primary">Ingredients</h3>
                            <div className="bg-secondary/30 rounded-lg p-5 backdrop-blur">
                                <p className="text-base leading-relaxed whitespace-pre-wrap text-foreground animate-fadeIn">
                                    {ingredientsText}
                                </p>
                            </div>
                        </div>

                        {/* Nutrition Info Section (if available) */}
                        {data?.nutriments && Object.keys(data.nutriments).length > 0 && (
                            <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-card via-card to-green-500/5 p-6 shadow-lg hover:shadow-xl transition-all">
                                <h3 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">Nutritional Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(data.nutriments)
                                        .slice(0, 12) // Limit to first 12 nutrition items
                                        .map(([key, value]: [string, any]) => {
                                            if (value === null || value === undefined) return null;
                                            // Format key to be more readable
                                            const formattedKey = key
                                                .replace(/_/g, ' ')
                                                .replace(/([a-z])([A-Z])/g, '$1 $2')
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                .join(' ');

                                            return (
                                                <div
                                                    key={key}
                                                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 hover:bg-green-500/20 transition-all transform hover:scale-105 animate-slideUp"
                                                    style={{
                                                        animationDelay: `${Math.random() * 0.3}s`
                                                    }}
                                                >
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{formattedKey}</p>
                                                    <p className="text-sm font-bold text-foreground mt-1">
                                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Helpful Tips */}
                        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 shadow-lg">
                            <h3 className="text-lg font-bold mb-3 text-blue-600 dark:text-blue-400">💡 Tips</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Ingredients are listed by weight, from highest to lowest</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Watch out for hidden sugars under different names</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Processed oils and additives may impact health</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-blue-500">•</span>
                                    <span>Check the analysis page for detailed health insights</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
