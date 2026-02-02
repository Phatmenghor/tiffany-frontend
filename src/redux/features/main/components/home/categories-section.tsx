import React, { useState, useEffect } from "react";
import { CategoryCard } from "@/components/shared/card/category-card";
import { CategoryGridSkeleton } from "@/components/shared/skeletons/category-card-skeleton";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import {
  SectionHeader,
  SectionWrapper,
  ViewAllButton,
} from "@/components/shared/common/section-header";
interface CategoriesSectionProps {
  categories: CategoriesResponseModel[];
  loading: boolean;
  error: string | null;
  title?: string;
}

export const CategoriesSection = ({
  categories,
  loading,
  error,
  title = "Shop by Category",
}: CategoriesSectionProps) => {
  if (loading) {
    return (
      <SectionWrapper>
        <SectionHeader title={title} subtitle="Browse products by category" />
        <CategoryGridSkeleton count={12} />
      </SectionWrapper>
    );
  }

  if (error || !categories || categories?.length === 0) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader title={title} subtitle="Browse products by category" />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <ViewAllButton href="/categories" text="View All Categories" />
    </SectionWrapper>
  );
};
