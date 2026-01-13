"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Truck,
  Check,
  Shield,
  Eye,
  Heart,
  Sparkles,
} from "lucide-react";
import { Listing } from "@/types";
import { Card, Badge } from "@/components/ui";
import { formatPrice, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  viewMode?: "grid" | "list";
}

export function ListingCard({ listing, viewMode = "grid" }: ListingCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card
        variant="interactive"
        padding="none"
        className={cn(
          "group overflow-hidden",
          !isGrid && "flex"
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative bg-surface-2 overflow-hidden",
            isGrid ? "aspect-[4/3]" : "w-48 h-36 flex-shrink-0"
          )}
        >
          {listing.photos[0] ? (
            <Image
              src={listing.photos[0]}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isGrid ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" : "200px"}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">{listing.category?.icon || "📦"}</span>
            </div>
          )}

          {/* Boosted badge */}
          {listing.isBoosted && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning" size="sm">
                <Sparkles className="h-3 w-3" />
                Destacado
              </Badge>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              // TODO: Toggle favorite
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className={cn("p-4", !isGrid && "flex-1 flex flex-col justify-between")}>
          <div>
            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
              {listing.title}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {listing.hasVerifiedPurchase && (
                <Badge variant="verified" size="sm">
                  <Check className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
              {listing.hasValidWarranty && (
                <Badge variant="warranty" size="sm">
                  <Shield className="h-3 w-3" />
                  Garantía
                </Badge>
              )}
              {listing.verificationLevel === "LEVEL_2" && (
                <Badge variant="serial" size="sm">
                  ID verificado
                </Badge>
              )}
            </div>

            {/* Location & Shipping */}
            <div className="flex items-center gap-3 text-xs text-foreground-subtle mb-3">
              {listing.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {listing.location}
                </span>
              )}
              {listing.shippingEnabled && (
                <span className="flex items-center gap-1 text-jade">
                  <Truck className="h-3 w-3" />
                  Envío
                </span>
              )}
            </div>
          </div>

          {/* Price & Stats */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-semibold text-foreground tabular-nums">
                {formatPrice(listing.price)}
              </p>
              {listing.shippingEnabled && listing.shippingCost && (
                <p className="text-xs text-foreground-subtle">
                  + {formatPrice(listing.shippingCost)} envío
                </p>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-foreground-subtle">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {listing.viewCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {listing.favoriteCount}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
