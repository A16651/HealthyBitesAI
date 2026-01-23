"use client";

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { EXTERNAL_APIS } from '@/lib/config';
import { ScanLine } from 'lucide-react';

interface ProductCardProps {
    name: string;
    barcode?: string;
    img?: string;
    onClick: () => void;
}

export default function ProductCardEnhanced({ name, barcode, img, onClick }: ProductCardProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(img || null);
    const [loading, setLoading] = useState(!img);

    useEffect(() => {
                if (img) {
            setImageUrl(img);
            setLoading(false);
            return;
        }
        if (barcode) {
            // Fetch product image from Open Food Facts
            fetch(EXTERNAL_APIS.OPEN_FOOD_FACTS.PRODUCT(barcode))
                .then(res => res.json())
                .then(data => {
                    const fetchedImg = data?.product?.image_front_thumb_url ||
                        data?.product?.image_small_url ||
                        data?.product?.image_url;
                    if (fetchedImg) setImageUrl(fetchedImg);
                })
                .catch(() => {
                    // Silently fail - will show placeholder
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [barcode, img]);

    return (
        <div
            onClick={onClick}
            className={cn(
                "group cursor-pointer rounded-xl border bg-card overflow-hidden",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                "shadow-md"
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <ScanLine className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
            </div>

            {/* Product Name */}
            <div className="p-4 text-center bg-gradient-to-b from-card to-card/80">
                <p className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {name}
                </p>
            </div>
        </div>
    );
}
