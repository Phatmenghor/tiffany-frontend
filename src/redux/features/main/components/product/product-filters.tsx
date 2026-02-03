"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal, Tag, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductFiltersProps {
  categories?: Array<{ id: string; name: string }>;
  brands?: Array<{ id: string; name: string }>;
  totalResults: number;
}

export function ProductFilters({
  categories = [],
  totalResults,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasPromotion, setHasPromotion] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    setSelectedCategory(searchParams.get("categoryId") || "");
    setHasPromotion(searchParams.get("hasPromotion") === "true");
    setSortBy(searchParams.get("sortBy") || "newest");
  }, [searchParams]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const activeFiltersCount = [selectedCategory, hasPromotion].filter(
    Boolean,
  ).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Category</label>
        </div>
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => updateFilters("categoryId", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Promotion Filter */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Special Offers</label>
        <Button
          variant={hasPromotion ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() =>
            updateFilters("hasPromotion", hasPromotion ? "" : "true")
          }
        >
          <span className="mr-2">🏷️</span>
          {hasPromotion ? "✓ " : ""}On Sale Only
        </Button>
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Sort By</label>
        <Select
          value={sortBy}
          onValueChange={(value) => updateFilters("sortBy", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">⭐ Newest First</SelectItem>
            <SelectItem value="price-asc">💰 Price: Low to High</SelectItem>
            <SelectItem value="price-desc">💎 Price: High to Low</SelectItem>
            <SelectItem value="popular">🔥 Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters - Sticky Sidebar with Own Scroll */}
      <div className="hidden lg:block sticky top-24 h-[calc(100vh-7rem)]">
        <div className="bg-card border rounded-lg shadow-sm h-full flex flex-col">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 flex-shrink-0">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </h3>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </div>

          {/* Scrollable Filter Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <FilterContent />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-4 bg-card border rounded-lg p-4 shadow-sm">
          <div className="flex-1">
            <p className="text-sm font-medium">
              {totalResults.toLocaleString()} Products
            </p>
            <p className="text-xs text-muted-foreground">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filter${
                    activeFiltersCount > 1 ? "s" : ""
                  } applied`
                : "No filters applied"}
            </p>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 relative">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 sm:w-96 p-0 flex flex-col"
            >
              <SheetHeader className="p-6 border-b border-border/50 flex-shrink-0">
                <SheetTitle className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filter Products
                </SheetTitle>
              </SheetHeader>

              {/* Scrollable Filter Content for Mobile */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <FilterContent />
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
