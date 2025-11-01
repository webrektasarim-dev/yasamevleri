"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Building2, 
  Shield, 
  Wifi, 
  Camera, 
  CarFront,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Check
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      const isAdmin = (session?.user as any)?.role === "admin";
      router.push(isAdmin ? "/admin" : "/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-700 border-t-white mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Yükleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Minimal & Professional */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-zinc-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
                  Örnek Yaşam Evleri
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Hakkımızda</a>
              <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Özellikler</a>
              <a href="#facilities" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium">Tesisler</a>
              <a href="#contact" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium">İletişim</a>
              <Link href="/login">
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg px-6 h-10 text-sm font-medium">
                  Site Sakini Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Professional & Minimal */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/80 via-zinc-900/70 to-zinc-900/60"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6">
              <span className="text-sm font-medium text-zinc-400 tracking-wide uppercase">
                Modern Yaşam Kompleksi
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-tight">
              Örnek Yaşam Evleri
            </h1>
            
            <p className="text-xl text-zinc-300 mb-12 leading-relaxed max-w-2xl">
              Şehrin kalbinde modern mimari ve konforlu yaşam alanları. 
              Her detayı düşünülmüş premium rezidans deneyimi.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg px-8 h-12 text-base font-medium">
                  Site Sakini Giriş Yap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Minimal */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "46", label: "Bağımsız Bölüm" },
              { number: "5+", label: "Sosyal Tesis" },
              { number: "24/7", label: "Güvenlik" },
              { number: "2024", label: "Modern Dizayn" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-zinc-900 mb-2">{stat.number}</div>
                <div className="text-sm text-zinc-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About - Professional Cards */}
      <section id="about" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-medium text-zinc-500 tracking-wide uppercase mb-3 block">Neden Örnek Yaşam Evleri?</span>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Premium Yaşam Standartları
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed">
              Modern mimari, güvenlik ve konfor bir arada
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Building2, 
                title: "Modern Mimari", 
                desc: "Çağdaş tasarım anlayışıyla inşa edilmiş estetik ve fonksiyonel yaşam alanları"
              },
              { 
                icon: Shield, 
                title: "Güvenlik", 
                desc: "7/24 profesyonel güvenlik ekibi ve modern kamera sistemleri ile güvence altında"
              },
              { 
                icon: Camera, 
                title: "Akıllı Sistem", 
                desc: "Gelişmiş teknoloji altyapısı ve akıllı bina yönetim sistemleri"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="p-8 border border-zinc-200 hover:border-zinc-300 transition-all hover:shadow-lg bg-white">
                  <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 mb-3">{item.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{item.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features - Clean Grid */}
      <section id="features" className="py-24 px-6 bg-zinc-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-medium text-zinc-500 tracking-wide uppercase mb-3 block">Özellikler</span>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Konfor ve Teknoloji
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: "Güvenlik Kamera Sistemi", desc: "7/24 aktif izleme" },
              { icon: Wifi, title: "Fiber İnternet", desc: "Yüksek hız bağlantı" },
              { icon: CarFront, title: "Kapalı Otopark", desc: "Güvenli araç parkı" },
              { icon: Shield, title: "Profesyonel Güvenlik", desc: "24 saat görevli" },
              { icon: Building2, title: "Modern Mimari", desc: "Çağdaş tasarım" },
              { icon: Check, title: "Online İşlemler", desc: "Dijital yönetim" },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-6 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-all">
                  <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-zinc-600">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Facilities - Minimalist */}
      <section id="facilities" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-16">
            <span className="text-sm font-medium text-zinc-500 tracking-wide uppercase mb-3 block">Sosyal Tesisler</span>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
              Sosyal Yaşam Alanları
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Fitness Center", desc: "Modern ekipman" },
              { name: "Yüzme Havuzu", desc: "Kapalı havuz" },
              { name: "Tenis Kortu", desc: "Profesyonel kort" },
              { name: "Basketbol Sahası", desc: "Açık hava sahası" },
              { name: "Toplantı Salonu", desc: "Etkinlik alanı" },
              { name: "Çocuk Parkı", desc: "Güvenli oyun alanı" },
            ].map((facility, index) => (
              <Card key={index} className="p-6 border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
                <h3 className="font-semibold text-zinc-900 mb-2">{facility.name}</h3>
                <p className="text-sm text-zinc-600 mb-4">{facility.desc}</p>
                <div className="flex items-center gap-2 text-zinc-900 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  <span>Rezervasyon Mevcut</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact - Professional */}
      <section id="contact" className="py-24 px-6 bg-zinc-900">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              İletişim
            </h2>
            <p className="text-lg text-zinc-400">
              Bilgi almak için bizimle iletişime geçin
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: "Telefon", info: "+90 (XXX) XXX XX XX" },
              { icon: Mail, title: "E-posta", info: "info@yildizresidence.com" },
              { icon: MapPin, title: "Adres", info: "İstanbul, Türkiye" }
            ].map((contact, index) => {
              const Icon = contact.icon;
              return (
                <div key={index} className="text-center p-8 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all bg-zinc-900">
                  <Icon className="h-8 w-8 mx-auto mb-4 text-white" />
                  <h3 className="font-semibold text-white mb-2">{contact.title}</h3>
                  <p className="text-zinc-400 text-sm">{contact.info}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer - Clean */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 px-6 border-t border-zinc-900">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-zinc-900" />
            </div>
            <h3 className="text-lg font-semibold text-white">Örnek Yaşam Evleri</h3>
          </div>
          <div className="flex justify-center gap-8 mb-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Site Sakini Giriş Yap</Link>
            <Link href="/register" className="hover:text-white transition-colors">Kayıt Ol</Link>
          </div>
          <div className="border-t border-zinc-900 pt-6">
            <p className="text-xs">© 2024 Örnek Yaşam Evleri. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
