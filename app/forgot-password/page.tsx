"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, KeyRound, Smartphone, Lock } from "lucide-react";

type Step = "phone" | "verify" | "password";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  // Adım 1: Telefon numarası ile kod gönderme
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Doğrulama kodu telefonunuza gönderildi", "success");
        setStep("verify");
      } else {
        showToast(data.error || "Kod gönderilemedi", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Adım 2: Kodu doğrulama
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Kod doğrulandı", "success");
        setStep("password");
      } else {
        showToast(data.error || "Geçersiz kod", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Adım 3: Yeni şifre belirleme
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("Şifreler eşleşmiyor", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Şifreniz başarıyla değiştirildi! ✅", "success");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        showToast(data.error || "Şifre sıfırlanamadı", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md border border-zinc-200 bg-white">
        <CardHeader className="space-y-1 pb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Giriş sayfasına dön
          </Link>
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-zinc-900 tracking-tight">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-center text-zinc-600">
            {step === "phone" && "Telefon numaranızı girin"}
            {step === "verify" && "Telefonunuza gelen kodu girin"}
            {step === "password" && "Yeni şifrenizi belirleyin"}
          </CardDescription>
        </CardHeader>

        {/* Adım 1: Telefon Numarası */}
        {step === "phone" && (
          <form onSubmit={handleSendCode}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-zinc-700">Telefon Numarası</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxxx"
                  className="h-11"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-zinc-500">
                  Kayıtlı telefon numaranıza doğrulama kodu gönderilecektir
                </p>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Gönderiliyor..." : "Kod Gönder"}
              </Button>
            </div>
          </form>
        )}

        {/* Adım 2: Kod Doğrulama */}
        {step === "verify" && (
          <form onSubmit={handleVerifyCode}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-zinc-700">Doğrulama Kodu</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="6 haneli kod"
                  className="h-11 text-center text-2xl tracking-widest"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-zinc-500 text-center">
                  {phone} numarasına gönderilen kodu girin
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs text-zinc-600 hover:text-zinc-900 hover:underline w-full text-center"
              >
                Farklı numara ile dene
              </button>
            </CardContent>
            <div className="px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Doğrulanıyor..." : "Kodu Doğrula"}
              </Button>
            </div>
          </form>
        )}

        {/* Adım 3: Yeni Şifre */}
        {step === "password" && (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-zinc-700">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="En az 6 karakter"
                  className="h-11"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Şifrenizi tekrar girin"
                  className="h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white" 
                disabled={isLoading}
              >
                {isLoading ? "Kaydediliyor..." : "Şifreyi Sıfırla"}
              </Button>
            </div>
          </form>
        )}
      </Card>
      {ToastComponent}
    </div>
  );
}

