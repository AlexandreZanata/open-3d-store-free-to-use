import {
  Calculator,
  FolderTree,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";

export const adminNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: FolderTree },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/users", label: "Users", icon: Users },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/settings", label: "Settings", icon: Settings },
] as const satisfies ReadonlyArray<{
  to: string;
  label: string;
  icon: LucideIcon;
}>;
