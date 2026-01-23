"use client";

import { useEffect, useState } from "react";
import { useResultContext, useSettings } from '../../../components/AppProviders';
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, List, AlertCircle, ScanLine } from "lucide-react";
import LoadingAnimation from '../../../components/LoadingAnimation';
import DynamicJsonDisplay from '../../../components/DynamicJsonDisplay';
import { getApiUrl, EXTERNAL_APIS } from '@/lib/config';
import { getImageUrl } from '@/lib/utils';

interface IngredientsResult {
    product_name: string;
    brand?: string;
    image_url?: string;
    ingredients_text?: string;
    analysis: {
        summary: string;
        harmful_additives: string[];
        hidden_sugars: string[];
        recommendation: string;
    };
    [key: string]: any; // Allow dynamic fields
}

export default function IngredientsPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<IngredientsResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rawJson, setRawJson] = useState<string | null>(null);
    const { setCacheEntry, currentProduct, cache } = useResultContext();
    const { printJsonOnError } = useSettings();

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
                try { setRawJson(JSON.stringify(d, null, 2)); } catch (e) { }
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
                try { setRawJson(JSON.stringify({ error: err.message }, null, 2)); } catch (e) { }
            })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [params.id]);

    if (loading) {
        return <LoadingAnimation message="Loading ingredients..." fullPage />;
    }

    if (error || !data) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center animate-fadeIn">
                <p className="text-destructive mb-4 text-lg font-semibold">{error || "No data found"}</p>
                {printJsonOnError && rawJson && (
                    <pre className="max-w-full overflow-auto text-xs text-left mt-4 p-3 bg-slate-800 text-slate-100 rounded max-h-64">{rawJson}</pre>
                )}
                <button
                    onClick={() => router.back()}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const analysis = data.analysis ?? { summary: '', harmful_additives: [], hidden_sugars: [], recommendation: '' };
    const displayImage = getImageUrl(data.image_url, currentProduct?.image_url);
    const displayName = data.product_name || currentProduct?.product_name || 'Product';
    const displayBrand = data.brand || currentProduct?.brand;

    return (
        <div className="min-h-screen bg-background text-foreground pb-12 animate-fadeIn">
            {/* Header */}
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
                {/* Product Image */}
                {displayImage && (
                    <div className="mb-8 flex justify-center animate-scaleIn">
                        <div className="relative h-48 w-48 md:h-64 md:w-64 overflow-hidden rounded-xl border bg-white shadow-lg p-4">
                            <img
                                src={displayImage}
                                alt={displayName}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    {displayBrand && <p className="text-lg text-muted-foreground">{displayBrand}</p>}
                    <p className="text-muted-foreground mt-1">Detailed Ingredient Breakdown</p>
                </div>

                <div className="space-y-8">

                    {/* Raw Ingredients Text (if available) */}
                    {data.ingredients_text ? (
                        <div className="bg-card border rounded-xl p-6 shadow-md hover:shadow-lg transition-all animate-slideUp">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <List className="mr-2 h-5 w-5 text-primary" />
                                Full Ingredients List
                            </h2>
                            <p className="leading-relaxed text-sm md:text-base font-mono bg-secondary/30 p-4 rounded-md">
                                {data.ingredients_text}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-secondary/20 border-l-4 border-yellow-500 p-4 animate-slideUp">
                            <p className="text-muted-foreground italic">
                                Full raw ingredients list not provided by source. Showing analysis below.
                            </p>
                        </div>
                    )}

                    {/* Analysis Breakdown */}
                    <div className="grid gap-6 md:grid-cols-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="border rounded-xl p-6 bg-card shadow-md hover:shadow-lg transition-all">
                            <h3 className="font-semibold mb-3 text-red-600 flex items-center">
                                <AlertCircle className="mr-2 h-4 w-4" /> Identified Additives
                            </h3>
                            {(analysis.harmful_additives?.length ?? 0) > 0 ? (
                                <ul className="list-disc list-inside space-y-2">
                                    {(analysis.harmful_additives ?? []).map((item, i) => (
                                        <li key={i} className="text-sm">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-sm text-muted-foreground">None detected</span>
                            )}
                        </div>

                        <div className="border rounded-xl p-6 bg-card shadow-md hover:shadow-lg transition-all">
                            <h3 className="font-semibold mb-3 text-orange-600 flex items-center">
                                <AlertCircle className="mr-2 h-4 w-4" /> Hidden Sugars
                            </h3>
                            {(analysis.hidden_sugars?.length ?? 0) > 0 ? (
                                <ul className="list-disc list-inside space-y-2">
                                    {(analysis.hidden_sugars ?? []).map((item, i) => (
                                        <li key={i} className="text-sm">{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span className="text-sm text-muted-foreground">None detected</span>
                            )}
                        </div>
                    </div>

                    {/* Health Implication */}
                    <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 shadow-md hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-bold mb-2 text-primary">Health Implication</h2>
                        <p className="leading-relaxed">{analysis.summary ?? 'No summary available.'}</p>
                    </div>

                    {/* Dynamic Additional Fields */}
                    {Object.keys(data).filter(key =>
                        !['product_name', 'brand', 'image_url', 'ingredients_text', 'analysis'].includes(key)
                    ).length > 0 && (
                            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
                                <DynamicJsonDisplay
                                    data={Object.fromEntries(
                                        Object.entries(data).filter(([key]) =>
                                            !['product_name', 'brand', 'image_url', 'ingredients_text', 'analysis'].includes(key)
                                        )
                                    )}
                                    title="Additional Information"
                                />
                            </div>
                        )}

                </div>
            </main>
        </div>
    );
}
