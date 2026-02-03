"use client";

import React from "react";
import Image from "next/image";
import { BannerResponseModel } from "@/redux/features/master-data/store/models/response/banner-response";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

interface BannerSectionProps {
  banners: BannerResponseModel[];
  loading: boolean;
  error: string | null;
}

export const BannerSection = ({
  banners,
  loading,
  error,
}: BannerSectionProps) => {
  const [current, setCurrent] = React.useState(0);
  const [carouselApi, setCarouselApi] = React.useState<any>();
  const [loadedImages, setLoadedImages] = React.useState<Set<number>>(
    new Set(),
  );

  // Create autoplay plugin with smooth settings
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    }),
  );

  React.useEffect(() => {
    if (!carouselApi) return;

    setCurrent(carouselApi.selectedScrollSnap());

    const onSelect = () => {
      setCurrent(carouselApi.selectedScrollSnap());
    };

    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <Skeleton className="w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-2xl" />
      </div>
    );
  }

  if (error || !banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="relative">
        <Carousel
          setApi={setCarouselApi}
          plugins={[autoplayPlugin.current]}
          className="w-full"
          opts={{
            loop: true,
            align: "start",
            duration: 25,
            skipSnaps: false,
          }}
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id + "-" + index}>
                <div className="relative w-full h-[200px] sm:h-[280px] md:h-[320px] lg:h-[360px] rounded-[8px] overflow-hidden group">
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                    </div>
                  )}

                  <Image
                    src={banner.imageUrl}
                    alt={banner.linkUrl || "Banner"}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      loadedImages.has(index) ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => handleImageLoad(index)}
                    priority={index === 0}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 sm:left-4 bg-white/90 hover:bg-white border-none shadow-lg" />
              <CarouselNext className="right-2 sm:right-4 bg-white/90 hover:bg-white border-none shadow-lg" />
            </>
          )}
        </Carousel>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 pointer-events-none">
            {(() => {
              const maxDots = 12;
              const totalBanners = banners.length;

              if (totalBanners <= maxDots) {
                // Show all dots if less than or equal to max
                return banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200 pointer-events-auto",
                      current === idx
                        ? "w-8 bg-primary"
                        : "w-2 bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ));
              }

              // Show subset of dots with current slide centered
              const half = Math.floor(maxDots / 2);
              let startIdx = Math.max(0, current - half);
              let endIdx = Math.min(totalBanners, startIdx + maxDots);

              // Adjust if we're at the end
              if (endIdx - startIdx < maxDots) {
                startIdx = Math.max(0, endIdx - maxDots);
              }

              return Array.from({ length: endIdx - startIdx }, (_, i) => {
                const idx = startIdx + i;
                return (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      carouselApi?.scrollTo(idx);
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-200 pointer-events-auto",
                      current === idx
                        ? "w-8 bg-primary"
                        : "w-2 bg-white/50 hover:bg-white/80",
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
