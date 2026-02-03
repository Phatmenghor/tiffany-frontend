/**
 * Empty State Presets
 * Pre-configured empty states for common scenarios
 */

import {
  PackageOpen,
  Search,
  Filter,
  ShoppingCart,
  Heart,
  FileText,
  Inbox,
  UserX,
  ImageOff,
  AlertCircle,
  DatabaseZap,
} from "lucide-react";
import { EmptyState, EmptyStateProps } from "./empty-state";

type PresetConfig = Omit<EmptyStateProps, "action" | "secondaryAction">;

/**
 * Common empty state configurations
 */
export const EmptyStatePresets = {
  // No data/results
  noData: {
    icon: DatabaseZap,
    title: "No data available",
    description: "There is no data to display at this time",
  } as PresetConfig,

  // No search results
  noSearchResults: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters",
  } as PresetConfig,

  // No filter results
  noFilterResults: {
    icon: Filter,
    title: "No matching items",
    description: "No items match your current filters",
  } as PresetConfig,

  // No products
  noProducts: {
    icon: PackageOpen,
    title: "No products found",
    description: "There are no products available at this time",
  } as PresetConfig,

  // Empty cart
  emptyCart: {
    icon: ShoppingCart,
    title: "Your cart is empty",
    description: "Add some products to get started",
  } as PresetConfig,

  // Empty favorites
  emptyFavorites: {
    icon: Heart,
    title: "Your favorites is empty",
    description: "Save your favorite items to your favorites",
  } as PresetConfig,

  // No orders
  noOrders: {
    icon: FileText,
    title: "No orders yet",
    description: "You haven't placed any orders",
  } as PresetConfig,

  // Empty inbox
  emptyInbox: {
    icon: Inbox,
    title: "No messages",
    description: "Your inbox is empty",
  } as PresetConfig,

  // No users
  noUsers: {
    icon: UserX,
    title: "No users found",
    description: "No users match your search criteria",
  } as PresetConfig,

  // No images
  noImages: {
    icon: ImageOff,
    title: "No images",
    description: "No images have been uploaded yet",
  } as PresetConfig,

  // Error state
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again",
  } as PresetConfig,

  // Admin specific
  noBrands: {
    icon: PackageOpen,
    title: "No brands found",
    description: "Create your first brand to get started",
  } as PresetConfig,

  noCategories: {
    icon: PackageOpen,
    title: "No categories found",
    description: "Create your first category to organize products",
  } as PresetConfig,

  noBanners: {
    icon: ImageOff,
    title: "No banners found",
    description: "Create your first banner for the homepage",
  } as PresetConfig,
};

/**
 * Helper function to create empty state with preset + custom overrides
 */
export function createEmptyState(
  preset: keyof typeof EmptyStatePresets,
  overrides?: Partial<EmptyStateProps>
): EmptyStateProps {
  return {
    ...EmptyStatePresets[preset],
    ...overrides,
  };
}
