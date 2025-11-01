"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogOut, User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-zinc-900 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-zinc-900 tracking-tight">
            Örnek Yaşam Evleri
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100">
                  Giriş Yap
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800">
                  Kayıt Ol
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}



