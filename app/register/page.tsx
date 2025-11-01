"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast("Şifreler eşleşmiyor", "error");
      return;
    }

    if (formData.password.length < 6) {
      showToast("Şifre en az 6 karakter olmalıdır", "error");
      return;
    }

    setIsLoading(true);

    try {
      // Register user directly without SMS verification
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerData.success) {
        showToast(registerData.error || "Kayıt başarısız", "error");
        return;
      }

      showToast("Kayıt başarılı! Yönetici onayı bekleniyor.", "success");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <Card className="w-full max-w-md border border-zinc-200 bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold text-zinc-900 tracking-tight">Kayıt Ol</CardTitle>
          <CardDescription className="text-center text-zinc-600">
            Yeni hesap oluşturun - Yönetici onayı gereklidir
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-zinc-700">Ad</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Adınız"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-zinc-700">Soyad</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Soyadınız"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-700">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="05XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-700">Şifre Tekrar</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Şifrenizi tekrar girin"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white" 
              disabled={isLoading}
            >
              {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </Button>
            <p className="text-sm text-center text-zinc-600">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="text-zinc-900 hover:text-zinc-700 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      {ToastComponent}
    </div>
  );
}

