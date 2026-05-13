import type { SidebarItem } from "./Sidebar";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type SidebarItemKey = keyof Dictionary;

export interface SidebarItemData extends Omit<SidebarItem, "label" | "section"> {
  labelKey: SidebarItemKey | "";
  sectionKey?: SidebarItemKey;
}

export const candidateSidebar: SidebarItemData[] = [
  { href: "/dashboard", labelKey: "dashboard", sectionKey: "main" },
  { href: "/konkurset", labelKey: "competitions" },
  { href: "/apliko", labelKey: "apply" },
  { divider: true, labelKey: "" },
  { href: "/rezultatet", labelKey: "my_results", sectionKey: "my_status" },
  { href: "/ankesat", labelKey: "complaints" },
];

export const adminSidebar: SidebarItemData[] = [
  { href: "/admin", labelKey: "dashboard" },
  { href: "/admin/konkurset", labelKey: "competitions" },
  { href: "/admin/aplikimet", labelKey: "applications" },
  { href: "/admin/rezultatet", labelKey: "results" },
  { href: "/admin/ankesat", labelKey: "complaints" },
];
