import {
  Home,
  Users,
  Database,
  LucideIcon,
  LucideBriefcaseBusiness,
} from "lucide-react";

export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/login",
  },

  // Admin routes
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    PROFILE: "/admin/profile",
    SESSIONS: "/admin/sessions",
    ADMIN_SESSIONS: "/admin/admin-sessions",
    USERS: "/admin/users",
    ROLES: "/admin/users/roles",
    BRAND: "/admin/brand",
    BANNER: "/admin/banner",
    CATEGORIES: "/admin/categories",
    EXCHANGE_RATE: "/admin/exchange-rate",
    DELIVERY_OPTIONS: "/admin/delivery-options",
    PRODUCTS: "/admin/products",
    PRODUCTS_PROMOTION: "/admin/product-promotions",
  },

  HR: {
    WORK_SCHEDULE: "/admin/hr/work-schedule",
    WORK_SCHEDULE_TYPE: "/admin/hr/work-schedule-type",
    LEAVE_TYPE: "/admin/hr/leave-type",
    LEAVE: "/admin/hr/leave",
    ATTENDANCE: "/admin/hr/attendance",
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
        title: "Roles",
        href: ROUTES.ADMIN.ROLES,
      },
    ],
  },

  {
    title: "HR",
    icon: Database,
    items: [
      {
        title: "Work Schedule Types",
        href: ROUTES.HR.WORK_SCHEDULE_TYPE,
      },
      {
        title: "Leave Type",
        href: ROUTES.HR.LEAVE_TYPE,
      },
      {
        title: "Work Schedules",
        href: ROUTES.HR.WORK_SCHEDULE,
      },
      {
        title: "Leave",
        href: ROUTES.HR.LEAVE,
      },
      {
        title: "Attendance",
        href: ROUTES.HR.ATTENDANCE,
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
      {
        title: "Brand",
        href: ROUTES.ADMIN.BRAND,
      },
      {
        title: "Exchange Rate",
        href: ROUTES.ADMIN.EXCHANGE_RATE,
      },
      {
        title: "Delivery Options",
        href: ROUTES.ADMIN.DELIVERY_OPTIONS,
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
];

/**
 * Route Helpers
 */

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

/**
 * Navigation Helpers
 */

export const getDefaultAdminRoute = (): string => {
  return "PLATFORM_USERS";
};

export const getLoginRedirectUrl = (): string => {
  return ROUTES.AUTH.LOGIN;
};

export const getDashboardRedirectUrl = (): string => {
  return getDefaultAdminRoute();
};
