"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogOut, User, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - Only show when authenticated */}
          {session && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-100 text-zinc-700"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Home className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
            </div>
            <span className="text-base md:text-lg font-semibold text-zinc-900 tracking-tight hidden sm:block">
              Örnek Yaşam Evleri
            </span>
            <span className="text-base font-semibold text-zinc-900 tracking-tight sm:hidden">
              ÖYE
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-2 md:gap-4">
          {session ? (
            <>
              {/* User Info - Desktop */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{session.user?.name}</span>
                  {(session.user as any)?.role === "admin" && (
                    <span className="text-xs text-zinc-600 font-medium">
                      Yönetici
                    </span>
                  )}
                </div>
              </div>
              
              {/* User Info - Mobile */}
              <div className="md:hidden w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Çıkış</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  Giriş
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  <span className="hidden sm:inline">Kayıt Ol</span>
                  <span className="sm:hidden">Kayıt</span>
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}



