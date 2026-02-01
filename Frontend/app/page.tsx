"use client";

import { useState, useEffect } from "react";
import { useResultContext } from '../components/AppProviders';
import { Search, Barcode, ScanLine, Info, AlertTriangle, ChevronRight, ExternalLink, Microscope, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl, TOP_PRODUCTS, HEALTH_RESOURCES } from '@/lib/config';
import ThemeToggle from '@/components/ThemeToggle';
import BarcodeModal from '@/components/BarcodeModal';
import ProductCardEnhanced from '@/components/ProductCardEnhanced';

interface Product {
    product_name: string;
    brand: string;
    id: string;
    image_url: string;
}

interface SearchResponse {
    products: Product[];
    count: number;
}

export default function Home() {
    const router = useRouter();
    const { cache, setCacheEntry } = useResultContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [barcodeOpen, setBarcodeOpen] = useState(false);
    const [lastSearchType, setLastSearchType] = useState<'text' | 'barcode'>('text');

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setLoading(true);
        setHasSearched(true);
        setLastSearchType('text');
        try {
            const url = `${getApiUrl('SEARCH')}?q=${encodeURIComponent(query)}`;
            const res = await fetch(url);
            if (res.ok) {
                const data: SearchResponse = await res.json();
                setSearchResults(data.products || []);
                try { setCacheEntry('lastSearchResults', data.products || []); } catch (e) { }
            } else {
                console.error("Search failed with status:", res.status);
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    // restore cached search results when returning to home
    useEffect(() => {
        try {
            if (cache && cache['lastSearchResults'] && (cache['lastQuery'] === searchQuery || cache['lastQuery'] === undefined)) {
                setSearchResults(cache['lastSearchResults']);
                setHasSearched(true);
            }
        } catch (e) { }
    }, []);

    const handleTryTheseClick = (productName: string) => {
        setSearchQuery(productName);
        handleSearch(productName);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleBarcodeSearch = async (barcode: string) => {
        setLoading(true);
        setHasSearched(true);
        setSearchResults([]);
        setLastSearchType('barcode');
        setSearchQuery(barcode); // Update search query for display

        try {
            const url = `${getApiUrl('BARCODE')}/${barcode}`;

            // Create a timeout promise for 13 seconds
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 13000)
            );

            // Race between the fetch and the timeout
            const res = await Promise.race([
                fetch(url),
                timeoutPromise
            ]) as Response;

            if (res.ok) {
                const data = await res.json();
                // Backend returns ProductResponse with code, product_name, brand, image_url, id
                if (data.product_name && data.id) {
                    // Transform ProductResponse to Product format for display
                    const product: Product = {
                        product_name: data.product_name,
                        brand: data.brand || 'Unknown Brand',
                        id: data.id,
                        image_url: data.image_url || ''
                    };
                    setSearchResults([product]);
                } else {
                    console.error("Invalid barcode response format:", data);
                    setSearchResults([]);
                }
            } else {
                console.error("Barcode search failed with status:", res.status);
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching barcode:", error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Modals */}
            <BarcodeModal isOpen={barcodeOpen} onClose={() => setBarcodeOpen(false)} onSearch={handleBarcodeSearch} />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slideDown">
                <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2" onClick={() => window.location.reload()}>
                            <ScanLine className="h-6 w-6 text-primary cursor-pointer animate-pulse" />
                            <span className="text-lg font-bold tracking-tight cursor-pointer">Food Doctor</span>
                        </div>
                    </div>

                    <nav className="ml-auto flex items-center gap-3">
                        <ThemeToggle />
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden flex flex-col items-center justify-center space-y-6 py-12 text-center md:py-24 lg:py-32 px-4 animate-fadeIn">
                {/* Animated Decorative Gradient */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
                <div className="absolute top-1/4 right-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-green-500/10 blur-[80px] animate-float" />

                <div className="space-y-4 max-w-[800px] animate-slideUp">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                        Know exactly what you <span className="text-primary">eat</span>.
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Scan barcodes or ingredients to detect allergens, understand additives, and make healthier choices instantly.
                    </p>
                </div>

                {/* Action Area */}
                <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 md:flex-row animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    {/* Search Input Wrapper */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                            className="flex h-10 w-full rounded-md border border-input bg-background/80 backdrop-blur px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleSearch(searchQuery)}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-sm transition-all hover:bg-secondary/80 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2"
                    >
                        Search
                    </button>

                    {/* Barcode Button */}
                    <button
                        onClick={() => setBarcodeOpen(true)}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2"
                    >
                        <Barcode className="h-4 w-4" />
                        Barcode
                    </button>
                </div>
            </section>

            {/* Search Results */}
            {hasSearched && (
                <section className="container mx-auto max-w-screen-xl px-4 py-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold mb-6">Search Results</h2>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {searchResults.map((product) => (
                                <ProductCard key={product.id} product={product} router={router} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">
                            No products found {lastSearchType === 'barcode' ? 'for barcode' : 'for'} "{searchQuery}"
                        </p>
                    )}
                </section>
            )}

            {/* Try These Section */}
            <section className="container mx-auto max-w-screen-xl px-4 py-12 border-t border-border/50">
                <h2 className="text-2xl font-bold mb-6">Try these popular products:</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {TOP_PRODUCTS.map((item, idx) => (
                        <ProductCardEnhanced
                            key={idx}
                            name={item.name}
                            barcode={item.barcode}
                            img={item.img}
                            onClick={() => handleTryTheseClick(item.name)}
                        />
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto max-w-screen-xl px-4 py-12 md:py-24 lg:py-32 bg-secondary/20 rounded-t-3xl border-t border-border/50">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <FeatureCard
                        icon={<Info className="h-8 w-8 text-blue-500" />}
                        title="Clean Labels"
                        description="Decode complex ingredient lists into simple, understandable terms."
                    />
                    <FeatureCard
                        icon={<AlertTriangle className="h-8 w-8 text-orange-500" />}
                        title="Allergen Watch"
                        description="Set your preferences and get instant alerts for ingredients you avoid."
                    />
                    <FeatureCard
                        icon={<ScanLine className="h-8 w-8 text-green-500" />}
                        title="Smart Analysis"
                        description="Powered by AI to give you a health score for every product you scan."
                    />
                </div>
            </section>

            {/* Health Resources Section */}
            <section className="container mx-auto max-w-screen-xl px-4 py-12 border-t border-border/50">
                <h2 className="text-2xl font-bold mb-6">Health & Food Safety Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(HEALTH_RESOURCES).map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-4 rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                                <ExternalLink className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                    {resource.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {resource.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 md:px-8 md:py-0 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; 2026 Food Doctor. Built for transparency and health awareness.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Powered by AI</span>
                        <span>•</span>
                        <span>Open Food Facts</span>
                        <span> AI can make mistakes, use at your own risks. </span>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="group flex flex-col items-start space-y-3 rounded-lg border bg-card p-6 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="rounded-full bg-secondary p-3 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
            <div className="pt-2">
                <button className="flex items-center text-sm font-medium text-primary hover:underline">
                    Learn more <ChevronRight className="ml-1 h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

function ProductCard({ product, router }: { product: Product; router: any }) {
    const { setCurrentProduct } = useResultContext();
    const handleAnalyze = () => {
        try { setCurrentProduct({ id: product.id, product_name: product.product_name, brand: product.brand, image_url: product.image_url }); } catch (e) { }
        router.push(`/analysis/${product.id}`);
    };
    const handleIngredients = () => {
        try { setCurrentProduct({ id: product.id, product_name: product.product_name, brand: product.brand, image_url: product.image_url }); } catch (e) { }
        router.push(`/ingredients/${product.id}`);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl hover:-translate-y-1 shadow-md">
            <div className="aspect-square w-full overflow-hidden bg-white p-4 flex items-center justify-center">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                        <ScanLine className="h-12 w-12 opacity-50" />
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-lg font-semibold">{product.product_name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{product.brand}</p>

                <div className="mt-auto flex gap-2">
                    <button
                        onClick={handleAnalyze}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <Microscope className="mr-2 h-4 w-4" />
                        Analyze
                    </button>
                    <button
                        onClick={handleIngredients}
                        className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                        <List className="mr-2 h-4 w-4" />
                        Ingredients
                    </button>
                </div>
            </div>
        </div>
    );
}
