"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  Search,
  ShoppingCart,
  X,
  User,
  LogOut,
  UserCircle,
  Package,
  Heart,
  Settings,
  Bell,
  CreditCard,
  LocationEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "../shared/button/custom-button";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useCartState } from "@/redux/features/main/store/state/cart-state";
import { useFavoriteState } from "@/redux/features/main/store/state/favorite-state";
import { logout } from "@/redux/features/auth/store/slice/auth-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { clearToken } from "@/utils/local-storage/token";
import { removeUserInfo } from "@/utils/local-storage/userInfo";
import { useDebounce } from "@/utils/debounce/debounce";
import { LoginModal } from "../shared/modal/login-modal";
import { CustomDropdownMenu } from "../shared/common/custom-dropdown-menu";
import { PageContainer } from "../shared/common/page-container";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";

const navigationLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Promotions", href: "/products?hasPromotion=true" },
  { name: "Categories", href: "/categories" },
];

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Auth state
  const { isAuthenticated, profile, fullName, email, profileImage, dispatch } =
    useAuthState();

  // Cart and favorites state
  const { totalItems: cartItemCount } = useCartState();
  const { totalItems: favoriteItemCount } = useFavoriteState();

  // Animation state for favorites badge
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const prevFavoriteCount = useRef(favoriteItemCount);

  // Trigger animation when favorite count changes
  useEffect(() => {
    if (
      prevFavoriteCount.current !== favoriteItemCount &&
      favoriteItemCount > 0
    ) {
      setFavoriteAnimating(true);
      const timer = setTimeout(() => setFavoriteAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    prevFavoriteCount.current = favoriteItemCount;
  }, [favoriteItemCount]);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Initialize search query from URL on mount
  useEffect(() => {
    const urlSearchQuery = searchParams.get("q");
    if (urlSearchQuery) {
      setSearchQuery(urlSearchQuery);
    }
  }, [searchParams]);

  // Handle debounced search - update URL when debounced value changes
  useEffect(() => {
    // Only handle search if there's actually a search query
    if (!debouncedSearchQuery.trim()) {
      const hasSearchParam = searchParams.get("q");
      if (hasSearchParam) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.push(newUrl);
      }
      return;
    }

    // Handle search query - redirect to /products if on home page
    const params = new URLSearchParams(searchParams.toString());
    const searchRoute = pathname === "/" ? "/products" : pathname;
    params.set("q", debouncedSearchQuery.trim());
    router.push(`${searchRoute}?${params.toString()}`);
  }, [debouncedSearchQuery, pathname, searchParams, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      let searchRoute = pathname === "/" ? "/products" : pathname;
      params.set("q", searchQuery.trim());
      router.push(`${searchRoute}?${params.toString()}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    clearToken();
    removeUserInfo();
    showToast.success("You've been logged out successfully");
    router.push("/");
  };

  // Custom dropdown menu sections
  const dropdownSections = [
    {
      items: [
        {
          label: "My Profile",
          icon: <UserCircle className="h-4 w-4" />,
          onClick: () => router.push("/profile"),
        },
        {
          label: "Location",
          icon: <LocationEdit className="h-4 w-4" />,
          onClick: () => router.push(ROUTES.LOCATION),
        },
      ],
    },
    {
      label: "Shopping",
      items: [
        {
          label: "My Orders",
          icon: <Package className="h-4 w-4" />,
          onClick: () => router.push("/orders"),
        },
        {
          label: "Favorites",
          icon: <Heart className="h-4 w-4" />,
          onClick: () => router.push("/favorites"),
        },
      ],
    },
    {
      items: [
        {
          label: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          onClick: handleLogout,
          variant: "destructive" as const,
        },
      ],
    },
  ];

  // Custom dropdown header
  const dropdownHeader = (
    <div className="flex items-center gap-3">
      <CustomAvatar
        imageUrl={profileImage || profile?.profileImageUrl}
        name={fullName || profile?.fullName || "User"}
        size="lg"
      />
      <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
        <p className="text-sm font-semibold line-clamp-1">
          {fullName || profile?.fullName || "User"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {email || profile?.email || ""}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <PageContainer className="max-w-8xl">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <CustomButton
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </CustomButton>

              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Image
                    src="/assets/favicon.ico"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="rounded object-contain"
                    priority
                  />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-foreground font-bold text-sm leading-tight">
                    E-Commerce
                  </span>
                  <span className="text-muted-foreground text-xs font-medium">
                    Shop Online
                  </span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-1">
                {navigationLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href === "/products" &&
                      pathname.startsWith("/products"));
                  return (
                    <Link key={link.name} href={link.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "text-foreground hover:text-primary hover:bg-primary/10 relative",
                          isActive &&
                            "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full",
                        )}
                      >
                        {link.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xl"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder={
                    pathname === "/products"
                      ? "Search products..."
                      : pathname === "/categories"
                        ? "Search categories..."
                        : pathname === "/brands"
                          ? "Search brands..."
                          : "Search..."
                  }
                  className="pl-10 w-full bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            <div className="flex items-center gap-2">
              <CustomButton
                variant="ghost"
                size="icon"
                className="relative hover:text-primary"
                onClick={() => router.push("/favorites")}
              >
                <Heart className="h-5 w-5" />
                {favoriteItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs transition-transform duration-300",
                      favoriteAnimating && "animate-slide-down",
                    )}
                  >
                    {favoriteItemCount}
                  </Badge>
                )}
              </CustomButton>

              <CustomButton
                variant="ghost"
                size="icon"
                className="relative hover:text-primary"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </CustomButton>

              {isAuthenticated ? (
                <CustomDropdownMenu
                  trigger={
                    <div className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                      <CustomAvatar
                        imageUrl={profileImage || profile?.profileImageUrl}
                        name={fullName || profile?.fullName || "User"}
                        size="md"
                        enableImagePreview={false}
                      />
                    </div>
                  }
                  header={dropdownHeader}
                  sections={dropdownSections}
                  align="right"
                  openOnHover={true}
                  hoverDelay={200}
                />
              ) : (
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                </CustomButton>
              )}
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="md:hidden pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={
                  pathname === "/products"
                    ? "Search products..."
                    : pathname === "/categories"
                      ? "Search categories..."
                      : pathname === "/brands"
                        ? "Search brands..."
                        : "Search..."
                }
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </PageContainer>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <PageContainer className="py-4 space-y-2">
              {navigationLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href === "/products" &&
                    pathname.startsWith("/products"));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isActive &&
                          "bg-primary/10 text-primary border-l-4 border-primary",
                      )}
                    >
                      {link.name}
                    </Button>
                  </Link>
                );
              })}
            </PageContainer>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </>
  );
}
