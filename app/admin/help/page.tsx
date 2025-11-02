"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink,
  Book,
  Video,
  MessageCircle,
  FileText,
  Wrench,
  Users,
  Shield,
  CreditCard,
  Building2,
  Calendar,
  Bell,
  Database,
  BarChart3
} from "lucide-react";

export default function HelpPage() {
  const supportInfo = {
    company: "webrek tasarım",
    phone: "0553 854 68 53",
    email: "destek@webrektasarim.com",
    website: "www.webrektasarim.com",
  };

  const quickGuides = [
    {
      icon: Users,
      title: "Kullanıcı Yönetimi",
      description: "Yeni kullanıcı ekleme, düzenleme ve daire atama işlemleri",
      steps: [
        "Kullanıcılar menüsünden 'Yeni Kullanıcı' butonuna tıklayın",
        "Kullanıcı bilgilerini doldurun (ad, soyad, email, telefon)",
        "Daire ataması yapmak için daire seçin",
        "Kullanıcı rolünü belirleyin (admin/user)",
        "'Kaydet' butonuna tıklayın"
      ]
    },
    {
      icon: Building2,
      title: "Daire Yönetimi",
      description: "Daire ekleme, düzenleme ve sakin atama",
      steps: [
        "Daireler menüsünden 'Yeni Daire' butonuna tıklayın",
        "Blok numarası, daire numarası ve kat bilgilerini girin",
        "Metrekare ve aidat katsayısını belirleyin",
        "Otopark bilgilerini ekleyin (opsiyonel)",
        "Sakinleri listeden seçerek ekleyin"
      ]
    },
    {
      icon: CreditCard,
      title: "Aidat Yönetimi",
      description: "Aylık aidat oluşturma ve ödeme takibi",
      steps: [
        "Aidat Yönetimi menüsüne gidin",
        "'Yeni Aidat Dönemi' butonuna tıklayın",
        "Ay ve yıl seçin",
        "Aidat detaylarını girin (yönetim, elektrik, su, doğalgaz vb.)",
        "Tüm daireler için otomatik hesaplama yapılır",
        "Ödemeler Dashboard'da takip edilir"
      ]
    },
    {
      icon: Calendar,
      title: "Rezervasyon Sistemi",
      description: "Sosyal tesis rezervasyonları",
      steps: [
        "Ayarlar → Tesis Çalışma Saatleri'nden tesis programlarını ayarlayın",
        "Rezervasyonlar menüsünden gelen talepleri görüntüleyin",
        "Rezervasyonu onaylayın veya reddedin",
        "Kullanıcılar Dashboard'dan rezervasyon oluşturabilir"
      ]
    },
    {
      icon: Database,
      title: "Yedekleme",
      description: "Veritabanı yedekleme ve geri yükleme",
      steps: [
        "Ayarlar → Yedekleme menüsüne gidin",
        "'Yedek İndir' ile tüm veritabanını JSON olarak indirin",
        "Yedekleri güvenli bir yerde saklayın",
        "Geri yüklemek için dosyayı seçin ve modu belirleyin",
        "⚠️ Geri yüklemeden önce mutlaka mevcut yedek alın!"
      ]
    },
    {
      icon: Bell,
      title: "Duyuru Yönetimi",
      description: "Site sakinlerine duyuru gönderme",
      steps: [
        "Duyurular menüsüne gidin",
        "'Yeni Duyuru' butonuna tıklayın",
        "Başlık ve içeriği yazın",
        "Öncelik seviyesi seçin (Normal/Acil)",
        "Yayınla butonuna tıklayın",
        "Tüm kullanıcılar Dashboard'da görebilir"
      ]
    }
  ];

  const commonIssues = [
    {
      question: "Kullanıcı giriş yapamıyor",
      answer: "Kullanıcının 'Onaylandı' durumunda olduğundan emin olun. Kullanıcılar menüsünden kullanıcıyı düzenleyin ve 'Onaylı' checkbox'ını işaretleyin."
    },
    {
      question: "Ödemeler görünmüyor",
      answer: "Önce aidat dönemi oluşturmalısınız. Aidat Yönetimi → Yeni Aidat Dönemi'nden aylık aidat oluşturun, ödemeler otomatik görünecektir."
    },
    {
      question: "Rezervasyon onaylanamıyor",
      answer: "İlgili tesisin çalışma saatlerini kontrol edin. Ayarlar → Tesis Çalışma Saatleri'nden tesisi aktif hale getirin."
    },
    {
      question: "Email veya SMS gönderimi çalışmıyor",
      answer: "Environment variables (.env.local) dosyasında SMTP ve SMS API anahtarlarının doğru girildiğinden emin olun."
    },
    {
      question: "Profilde daire bilgileri görünmüyor",
      answer: "Kullanıcıya daire ataması yapıldığından emin olun. Kullanıcılar menüsünden kullanıcıyı düzenleyin ve daire seçin."
    }
  ];

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ayarlara Dön
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
          Yardım ve Destek
        </h1>
        <p className="text-sm md:text-base text-zinc-600 mt-1">
          Sistem kullanımı ve teknik destek
        </p>
      </div>

      {/* Destek İletişim */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Phone className="h-5 w-5" />
            Teknik Destek
          </CardTitle>
          <CardDescription className="text-purple-800">
            Sorun yaşıyorsanız bizimle iletişime geçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 mb-1">Telefon Desteği</p>
                  <a 
                    href={`tel:${supportInfo.phone.replace(/\s/g, '')}`}
                    className="text-xl font-bold text-purple-900 hover:text-purple-700 transition-colors"
                  >
                    {supportInfo.phone}
                  </a>
                  <p className="text-xs text-zinc-500 mt-1">Pazartesi-Cuma: 09:00 - 18:00</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-purple-200">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-600 mb-1">E-posta Desteği</p>
                  <a 
                    href={`mailto:${supportInfo.email}`}
                    className="text-lg font-bold text-pink-900 hover:text-pink-700 transition-colors break-all"
                  >
                    {supportInfo.email}
                  </a>
                  <p className="text-xs text-zinc-500 mt-1">24 saat içinde yanıt</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-white rounded-xl border-2 border-purple-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {supportInfo.company}
                  </h3>
                </div>
                <p className="text-sm text-zinc-600 mb-4">
                  Profesyonel yazılım çözümleri ve teknik destek hizmetleri
                </p>
                <a 
                  href={`https://${supportInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {supportInfo.website}
                </a>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white">
                <p className="text-sm font-medium mb-2">💡 Hızlı İpucu</p>
                <p className="text-xs opacity-90">
                  Sorun yaşadığınızda, ekran görüntüsü ve hata mesajı ile birlikte 
                  iletişime geçmeniz sorununuzun daha hızlı çözülmesini sağlar.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hızlı Başlangıç Kılavuzları */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <Book className="h-5 w-5 text-purple-600" />
          Hızlı Başlangıç Kılavuzları
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickGuides.map((guide, index) => {
            const Icon = guide.icon;
            return (
              <Card key={index} className="border border-zinc-200 hover:border-purple-300 transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-2 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-zinc-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sık Sorulan Sorular */}
      <Card className="border border-zinc-200 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Sık Sorulan Sorular
          </CardTitle>
          <CardDescription>
            En çok sorulan sorular ve çözümleri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {commonIssues.map((issue, index) => (
            <div 
              key={index} 
              className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-purple-300 transition-all"
            >
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                {issue.question}
              </h3>
              <p className="text-sm text-zinc-700 ml-7">
                {issue.answer}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Özellikler Referansı */}
      <Card className="border border-zinc-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <FileText className="h-5 w-5 text-purple-600" />
            Sistem Özellikleri
          </CardTitle>
          <CardDescription>
            Admin paneli özelliklerine hızlı bakış
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Kullanıcı Yönetimi
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Kullanıcı ekleme, düzenleme, silme
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Daire ataması ve rol yönetimi
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Onay bekleyen kullanıcılar
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-600" />
                Daire Yönetimi
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  46 blok, sınırsız daire
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Otopark ve sakin yönetimi
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Aidat katsayısı belirleme
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" />
                Ödeme Sistemi
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Aylık aidat oluşturma
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  İyzico entegrasyonu
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Ödeme geçmişi ve raporlama
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Rezervasyon Sistemi
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  5 farklı sosyal tesis
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Çalışma saati yönetimi
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Onay/Red sistemi
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-600" />
                Duyuru Sistemi
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Site geneli duyurular
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Öncelik seviyeleri (Normal/Acil)
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Yayın tarihi kontrolü
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                Raporlama
              </h3>
              <ul className="space-y-2 text-sm text-zinc-600 ml-6">
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Aidat tahsilat oranları
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  Aylık gelir raporları
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">•</span>
                  İstatistiksel analizler
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik ve Gizlilik */}
      <Card className="border border-zinc-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <Shield className="h-5 w-5 text-purple-600" />
            Güvenlik ve Gizlilik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <span className="font-semibold text-zinc-900">Şifreler:</span> Tüm şifreler bcrypt ile şifrelenir ve veritabanında güvenli şekilde saklanır.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <span className="font-semibold text-zinc-900">Oturum Yönetimi:</span> NextAuth ile güvenli oturum yönetimi, otomatik token yenileme.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <span className="font-semibold text-zinc-900">Yetkilendirme:</span> Role-based access control (RBAC) ile admin ve kullanıcı ayrımı.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <span className="font-semibold text-zinc-900">Veri Güvenliği:</span> MongoDB Atlas üzerinde şifreli bağlantı ve yedekleme.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>
              <span className="font-semibold text-zinc-900">KVKK Uyumlu:</span> Kişisel verilerin korunması kanununa uygun veri işleme.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer - Developed by */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Wrench className="h-6 w-6" />
          <h3 className="text-xl font-bold">Sistem Bilgileri</h3>
        </div>
        <p className="text-sm mb-2 opacity-90">
          Bu site yönetim sistemi <span className="font-bold">{supportInfo.company}</span> tarafından geliştirilmiştir.
        </p>
        <p className="text-xs opacity-75 mb-4">
          Versiyon 1.0 • © 2024 webrek tasarım • Tüm hakları saklıdır
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a 
            href={`tel:${supportInfo.phone.replace(/\s/g, '')}`}
            className="hover:underline opacity-90 hover:opacity-100 transition-opacity"
          >
            📞 {supportInfo.phone}
          </a>
          <span className="opacity-50">•</span>
          <a 
            href={`mailto:${supportInfo.email}`}
            className="hover:underline opacity-90 hover:opacity-100 transition-opacity"
          >
            📧 Destek
          </a>
        </div>
      </div>
    </div>
  );
}

