"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { User, Mail, Phone, CheckCircle, XCircle, Lock, KeyRound, Shield } from "lucide-react";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (session && (session.user as any)?.id) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchUser = async () => {
    try {
      const userId = (session?.user as any)?.id;
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      // Error fetching user
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Yeni şifreler eşleşmiyor", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Yeni şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Şifreniz başarıyla değiştirildi! ✅", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast(data.error || "Şifre değiştirilemedi", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <div>Kullanıcı bilgileri yüklenemedi.</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
          Admin Profili
        </h1>
        <p className="text-zinc-600 mt-1">Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Kişisel Bilgiler */}
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <User className="h-5 w-5" />
              Kişisel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm text-zinc-600">Ad Soyad</p>
              <p className="text-lg font-semibold text-zinc-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-600 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-lg font-medium text-zinc-900">{user.email}</p>
              {user.isEmailVerified ? (
                <Badge variant="success" className="mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Doğrulandı
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">
                  <XCircle className="h-3 w-3 mr-1" />
                  Doğrulanmadı
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-600 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefon
              </p>
              <p className="text-lg font-medium text-zinc-900">{user.phone}</p>
              {user.isPhoneVerified ? (
                <Badge variant="success" className="mt-1">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Doğrulandı
                </Badge>
              ) : (
                <Badge variant="secondary" className="mt-1">
                  <XCircle className="h-3 w-3 mr-1" />
                  Doğrulanmadı
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hesap Bilgileri */}
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <Shield className="h-5 w-5" />
              Hesap Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm text-zinc-600">Rol</p>
              <Badge className="bg-zinc-900 text-white">
                <Shield className="h-3 w-3 mr-1" />
                Yönetici
              </Badge>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Kullanıcı ID</p>
              <p className="text-sm font-mono text-zinc-700">{user._id}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-600">Kayıt Tarihi</p>
              <p className="text-lg font-medium text-zinc-900">
                {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Şifre Değiştirme */}
        <Card className="md:col-span-2 border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <KeyRound className="h-5 w-5" />
              Şifre Değiştir
            </CardTitle>
            <CardDescription className="text-zinc-600">
              Hesabınızın güvenliği için düzenli olarak güçlü bir şifre kullanın
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-zinc-700">Mevcut Şifre</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Mevcut şifreniz"
                    className="pl-10"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-zinc-700">Yeni Şifre</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="En az 6 karakter"
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-700">Yeni Şifre (Tekrar)</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Yeni şifrenizi tekrar girin"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="bg-zinc-900 hover:bg-zinc-800 text-white"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {ToastComponent}
    </div>
  );
}

