"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Building2,
  CreditCard,
  Calendar,
  Bell,
  Users,
  Settings,
  BarChart3,
  FileText,
  DoorOpen,
  UserCog,
} from "lucide-react";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  const userLinks = [
    { href: "/dashboard", label: "Ana Sayfa", icon: Home },
    { href: "/dashboard/apartment", label: "Daire Bilgileri", icon: Building2 },
    { href: "/dashboard/dues", label: "Aidat Bilgileri", icon: FileText },
    { href: "/dashboard/payment", label: "Ödeme", icon: CreditCard },
    { href: "/dashboard/reservations", label: "Rezervasyon", icon: Calendar },
    { href: "/dashboard/profile", label: "Profil", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/apartments", label: "Daireler", icon: Building2 },
    { href: "/admin/users", label: "Kullanıcılar", icon: Users },
    { href: "/admin/dues", label: "Aidat Yönetimi", icon: FileText },
    { href: "/admin/payments", label: "Ödemeler", icon: CreditCard },
    { href: "/admin/reservations", label: "Rezervasyonlar", icon: Calendar },
    { href: "/admin/announcements", label: "Duyurular", icon: Bell },
    { href: "/admin/reports", label: "Raporlar", icon: BarChart3 },
    { href: "/admin/profile", label: "Profil", icon: UserCog },
    { href: "/admin/settings", label: "Ayarlar", icon: Settings },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="fixed left-0 top-16 w-64 border-r border-zinc-200 bg-white h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="flex flex-col gap-1 p-4">
        {/* Section Title */}
        <div className="mb-3 px-3">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {isAdmin ? "Yönetim Paneli" : "Menü"}
          </h3>
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all group",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
                <Icon className={cn(
                  "h-4 w-4",
                isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-900"
                )} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}



