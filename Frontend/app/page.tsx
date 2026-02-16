"use client";

import { useState, useEffect } from "react";
import { useResultContext } from '../components/AppProviders';
import { Search, Barcode, ScanLine, Info, AlertTriangle, ChevronRight, ExternalLink, Microscope, List, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
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
    const [scrollY, setScrollY] = useState(0);

    // Parallax scroll effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        setSearchQuery(barcode);

        try {
            const url = `${getApiUrl('BARCODE')}/${barcode}`;
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 13000)
            );

            const res = await Promise.race([
                fetch(url),
                timeoutPromise
            ]) as Response;

            if (res.ok) {
                const data = await res.json();
                if (data.product_name && data.id) {
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
        <main className="flex min-h-screen flex-col bg-background text-foreground relative overflow-hidden">
            {/* Animated Background Elements - Living Mesh Gradient Motion */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Animated mesh gradient base layer */}
                <div
                    className="absolute inset-0 opacity-40 animate-mesh-gradient"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.4) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.35) 0%, transparent 50%),
                            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)
                        `
                    }}
                />
                
                {/* Floating gradient orb 1 - slow movement */}
                <div
                    className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-3xl animate-float-slow opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(34, 197, 94, 0.6) 0%, rgba(16, 185, 129, 0.4) 40%, transparent 70%)'
                    }}
                />
                
                {/* Floating gradient orb 2 - medium movement */}
                <div
                    className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl animate-float-medium opacity-25"
                    style={{
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(147, 197, 253, 0.3) 40%, transparent 70%)'
                    }}
                />
                
                {/* Floating gradient orb 3 - fast movement */}
                <div
                    className="absolute bottom-1/4 left-1/3 w-[650px] h-[650px] rounded-full blur-3xl animate-float-fast opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.3) 40%, transparent 70%)'
                    }}
                />
            </div>

            {/* Modals */}
            <BarcodeModal isOpen={barcodeOpen} onClose={() => setBarcodeOpen(false)} onSearch={handleBarcodeSearch} />

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 animate-slideDown shadow-lg">
                <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
                            <div className="relative">
                                <ScanLine className="h-7 w-7 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12" />
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-green-500 to-primary bg-clip-text text-transparent">
                                Food Doctor
                            </span>
                        </div>
                    </div>

                    <nav className="ml-auto flex items-center gap-3">
                        <ThemeToggle />
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section 
                className="relative overflow-hidden flex flex-col items-center justify-center space-y-8 py-16 text-center md:py-28 lg:py-36 px-4"
                style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            >
                {/* Hero Section Animated Gradient Orbs */}
                <div
                    className="absolute top-1/2 left-1/2 -z-10 h-[700px] w-[700px] rounded-full blur-3xl animate-gradient-shift opacity-40"
                    style={{
                        transform: 'translate(-50%, -50%)',
                        background: 'linear-gradient(45deg, hsl(var(--primary)), #3b82f6, #10b981, hsl(var(--primary)))'
                    }}
                />
                <div
                    className="absolute top-1/4 right-1/4 -z-10 h-[450px] w-[450px] rounded-full blur-3xl animate-float opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(52, 211, 153, 0.4) 100%)'
                    }}
                />
                <div
                    className="absolute bottom-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full blur-3xl animate-float opacity-25"
                    style={{
                        animationDelay: '1.5s',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(147, 197, 253, 0.3) 100%)'
                    }}
                />

                {/* Floating Icons */}
                <div className="absolute top-20 left-10 animate-float opacity-20">
                    <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: '1s' }}>
                    <Shield className="h-10 w-10 text-green-500" />
                </div>
                <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: '2s' }}>
                    <Zap className="h-9 w-9 text-yellow-500" />
                </div>

                <div className="space-y-6 max-w-[900px] animate-slideUp relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur animate-scaleIn">
                        <Sparkles className="h-4 w-4" />
                        <span>AI-Powered Food Analysis</span>
                    </div>
                    
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                        Know  what you{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-primary via-green-500 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                                eat
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-green-500/20 to-emerald-500/20 blur-2xl" />
                        </span>
                        .
                    </h1>
                    
                    <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl/relaxed lg:text-xl/relaxed animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        Scan barcodes or ingredients to detect allergens, understand additives, and make healthier choices instantly with AI-powered insights.
                    </p>
                </div>

                {/* Action Area */}
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 md:flex-row animate-slideUp z-10" style={{ animationDelay: '0.2s' }}>
                    {/* Search Input Wrapper */}
                    <div className="relative flex-1 w-full group">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                        <input
                            type="search"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                            className="flex h-12 w-full rounded-xl border-2 border-input bg-background/80 backdrop-blur px-4 py-3 pl-12 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-primary/50 shadow-lg hover:shadow-xl"
                        />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={() => handleSearch(searchQuery)}
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-secondary px-8 text-base font-semibold text-secondary-foreground shadow-lg transition-all hover:bg-secondary/90 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 gap-2"
                    >
                        <Search className="h-5 w-5" />
                        Search
                    </button>

                    {/* Barcode Button */}
                    <button
                        onClick={() => setBarcodeOpen(true)}
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-green-500 px-10 text-base font-semibold text-primary-foreground shadow-xl transition-all hover:shadow-2xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95 gap-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Barcode className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">Scan Barcode</span>
                    </button>
                </div>

                {/* Stats Section */}
                <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <StatCard icon={<TrendingUp className="h-6 w-6" />} value="10K+" label="Products Analyzed" />
                    <StatCard icon={<Shield className="h-6 w-6" />} value="99%" label="Accuracy Rate" />
                    <StatCard icon={<Sparkles className="h-6 w-6" />} value="AI" label="Powered Analysis" />
                </div>
            </section>

            {/* Search Results */}
            {hasSearched && (
                <section className="container mx-auto max-w-screen-xl px-4 py-12 animate-fadeIn">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <div className="h-1 w-12 bg-gradient-to-r from-primary to-green-500 rounded-full" />
                        Search Results
                    </h2>
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="relative h-24 w-24">
                                {/* Outer spinning ring with smooth color cycling */}
                                <div className="absolute inset-0 rounded-full border-[6px] border-transparent animate-spinner-color-cycle" />
                                
                                {/* Middle counter-rotating ring */}
                                <div
                                    className="absolute inset-3 rounded-full border-4 border-primary/20 animate-spinner-rotate"
                                    style={{ animationDirection: 'reverse', animationDuration: '2s' }}
                                />
                                
                                {/* Inner pulsing glow with color shift */}
                                <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/30 to-green-500/30 animate-pulse" />
                                
                                {/* Center animated dot */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-green-500 animate-ping" />
                                    <div className="absolute h-3 w-3 rounded-full bg-primary" />
                                </div>
                            </div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {searchResults.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="animate-slideUp"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <ProductCard product={product} router={router} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 animate-scaleIn">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/50 mb-4">
                                <Search className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <p className="text-xl text-muted-foreground">
                                No products found {lastSearchType === 'barcode' ? 'for barcode' : 'for'} "{searchQuery}"
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* Try These Section */}
            <section className="container mx-auto max-w-screen-xl px-4 py-16 border-t border-border/50">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-green-500 rounded-full" />
                    Try these popular products
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {TOP_PRODUCTS.map((item, idx) => (
                        <div
                            key={idx}
                            className="animate-slideUp"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <ProductCardEnhanced
                                name={item.name}
                                barcode={item.barcode}
                                img={item.img}
                                onClick={() => handleTryTheseClick(item.name)}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto max-w-screen-xl px-4 py-16 md:py-24 lg:py-32">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Why Choose Food Doctor?
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Advanced AI technology to help you make informed food choices
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <FeatureCard
                        icon={<Info className="h-10 w-10" />}
                        title="Clean Labels"
                        description="Decode complex ingredient lists into simple, understandable terms with AI-powered analysis."
                        color="blue"
                        delay="0s"
                    />
                    <FeatureCard
                        icon={<AlertTriangle className="h-10 w-10" />}
                        title="Allergen Watch"
                        description="Set your preferences and get instant alerts for ingredients you need to avoid."
                        color="orange"
                        delay="0.1s"
                    />
                    <FeatureCard
                        icon={<ScanLine className="h-10 w-10" />}
                        title="Smart Analysis"
                        description="Powered by advanced AI to give you a comprehensive health score for every product."
                        color="green"
                        delay="0.2s"
                    />
                </div>
            </section>

            {/* Health Resources Section */}
            <section className="container mx-auto max-w-screen-xl px-4 py-16 border-t border-border/50">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <div className="h-1 w-12 bg-gradient-to-r from-primary to-green-500 rounded-full" />
                    Health & Food Safety Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(HEALTH_RESOURCES).map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-4 rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur p-6 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 animate-slideUp"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-all group-hover:scale-110">
                                <ExternalLink className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                    {resource.name}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {resource.description}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </a>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 md:py-12 border-t border-border/50 bg-secondary/20 backdrop-blur">
                <div className="container flex flex-col items-center justify-between gap-6 md:flex-row px-4">
                    <div className="flex items-center gap-3">
                        <ScanLine className="h-6 w-6 text-primary" />
                        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                            &copy; 2026 Food Doctor. Built for transparency and health awareness.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Powered by AI
                        </span>
                        <span>•</span>
                        <span>Open Food Facts</span>
                        <span>•</span>
                        <span className="text-xs opacity-70">AI can make mistakes</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 backdrop-blur border border-border/50 shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
            <div className="text-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, color, delay }: { icon: React.ReactNode; title: string; description: string; color: string; delay: string }) {
    const colorClasses = {
        blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 group-hover:border-blue-500/40',
        orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 group-hover:border-orange-500/40',
        green: 'from-green-500/10 to-green-500/5 border-green-500/20 group-hover:border-green-500/40'
    };

    const iconColorClasses = {
        blue: 'text-blue-500',
        orange: 'text-orange-500',
        green: 'text-green-500'
    };

    return (
        <div 
            className={`group flex flex-col items-start space-y-4 rounded-2xl border-2 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} p-8 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 animate-slideUp`}
            style={{ animationDelay: delay }}
        >
            <div className="rounded-xl bg-background/50 backdrop-blur p-4 group-hover:scale-110 transition-transform shadow-lg">
                <div className={iconColorClasses[color as keyof typeof iconColorClasses]}>
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
            <button className="flex items-center text-sm font-semibold text-primary hover:gap-3 gap-2 transition-all mt-2">
                Learn more <ChevronRight className="h-4 w-4" />
            </button>
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
        <div className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-border/50 bg-card/50 backdrop-blur transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 shadow-lg">
            <div className="aspect-square w-full overflow-hidden bg-white p-6 flex items-center justify-center relative">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.product_name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
                        <ScanLine className="h-16 w-16 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-lg font-bold mb-1">{product.product_name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{product.brand}</p>

                <div className="mt-auto flex gap-2">
                    <button
                        onClick={handleAnalyze}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-green-500 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                    >
                        <Microscope className="mr-2 h-4 w-4" />
                        Analyze
                    </button>
                    <button
                        onClick={handleIngredients}
                        className="flex-1 inline-flex items-center justify-center rounded-lg border-2 border-input bg-background/50 backdrop-blur px-4 py-2.5 text-sm font-semibold shadow-md transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
                    >
                        <List className="mr-2 h-4 w-4" />
                        Ingredients
                    </button>
                </div>
            </div>
        </div>
    );
}
