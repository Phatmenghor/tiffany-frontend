import {
  Home,
  Users,
  Database,
  LucideIcon,
  LucideBriefcaseBusiness,
  Settings,
} from "lucide-react";

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
  },

  LOCATION: "/location",

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
    USERS: "/admin/users",
    CUSTOMER: "/admin/customers",
    BANNER: "/admin/banner",
    CATEGORIES: "/admin/categories",
    SUB_CATEGORIES: "/admin/sub-categories",
    PRODUCTS: "/admin/products",
    PRODUCTS_PROMOTION: "/admin/product-promotions",
    ABOUT_US: "/admin/about-us",
  },
} as const;

/**
 * Route Groups for Sidebar Navigation
 */

interface MenuItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  items?: Array<{
    title: string;
    href: string;
  }>;
}

export const SIDEBAR_MENU: MenuItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: Home,
  },

  {
    title: "Users",
    icon: Users,
    items: [
      {
        title: "All Users",
        href: ROUTES.ADMIN.USERS,
      },
      {
        title: "Customer",
        href: ROUTES.ADMIN.CUSTOMER,
      },
    ],
  },

  {
    title: "Master Data",
    icon: Database,
    items: [
      {
        title: "Banner",
        href: ROUTES.ADMIN.BANNER,
      },
      {
        title: "Categories",
        href: ROUTES.ADMIN.CATEGORIES,
      },
    ],
  },
  {
    title: "Business",
    icon: LucideBriefcaseBusiness,
    items: [
      {
        title: "Products",
        href: ROUTES.ADMIN.PRODUCTS,
      },
      {
        title: "Products Promotion",
        href: ROUTES.ADMIN.PRODUCTS_PROMOTION,
      },
    ],
  },
  {
    title: "Setting",
    icon: Settings,
    items: [
      {
        title: "About Us",
        href: ROUTES.ADMIN.ABOUT_US,
      },
    ],
  },
];

export const isPublicRoute = (pathname: string): boolean => {
  return pathname === ROUTES.HOME || pathname === ROUTES.AUTH.LOGIN;
};

export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith(ROUTES.ADMIN.ROOT);
};

export const getActiveMenuItem = (pathname: string): MenuItem | null => {
  for (const item of SIDEBAR_MENU) {
    if (item.href === pathname) return item;

    if (item.items) {
      const found = item.items.find((subItem) => subItem.href === pathname);
      if (found) return item;
    }
  }
  return null;
};

/**
 * Breadcrumb Helpers
 */

export interface Breadcrumb {
  label: string;
  href?: string;
}

export const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [{ label: "Home", href: ROUTES.HOME }];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Format segment name
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    breadcrumbs.push({
      label,
      href: index === segments.length - 1 ? undefined : currentPath,
    });
  });

  return breadcrumbs;
};

export const getLoginRedirectUrl = (): string => {
  return ROUTES.AUTH.LOGIN;
};
