# Site Yönetim Sistemi

46 bloklu site için geliştirilmiş tam özellikli, modern yönetim platformu.

## ✨ Özellikler

### Kullanıcı Özellikleri
- 🏢 **Daire Bilgileri**: Blok, daire numarası, kat, metrekare, otopark bilgileri
- 💰 **Aidat Takibi**: Aylık aidat dökümleri, ödeme geçmişi, borç durumu
- 💳 **Online Ödeme**: iyzico entegrasyonu ile güvenli kredi kartı ödemesi
- 📅 **Rezervasyon Sistemi**: Spor alanları için takvim bazlı rezervasyon
- 📢 **Duyurular**: Site yönetiminden gelen duyuruları görüntüleme
- 👤 **Profil Yönetimi**: Kişisel bilgiler, SMS/Email doğrulama

### Admin Özellikleri
- 🏗️ **Daire Yönetimi**: CRUD işlemleri, sakin atama, otopark yönetimi
- 👥 **Kullanıcı Yönetimi**: Kullanıcı onaylama, rol atama, daire bağlama
- 💵 **Aidat Yönetimi**: Toplu aidat oluşturma, döküm girişi, ödeme takibi
- 📊 **Raporlama**: Tahsilat grafikleri, ödeme istatistikleri, dashboard
- 🔔 **Duyuru Yayını**: Normal ve acil duyurular, önceliklendirme
- 🎯 **Rezervasyon Kontrolü**: Onay/red mekanizması, çakışma kontrolü
- 💾 **Yedekleme Sistemi**: Tek tıkla veritabanı yedekleme ve geri yükleme
- 🔐 **Güvenlik Ayarları**: Şifre politikası, oturum yönetimi, 2FA hazırlığı
- 📧 **Bildirim Ayarları**: Email, SMS ve Push bildirim yönetimi
- 💜 **Yardım ve Destek**: Kapsamlı kullanım kılavuzu ve teknik destek

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 14 (App Router) - React tabanlı full-stack framework
- **Veritabanı**: MongoDB + Mongoose - NoSQL veritabanı
- **Kimlik Doğrulama**: NextAuth.js - Credentials + SMS doğrulama
- **Ödeme Gateway**: iyzico - Türkiye'nin önde gelen ödeme altyapısı
- **Rezervasyon**: FullCalendar.js - Etkileşimli takvim sistemi
- **UI Framework**: Tailwind CSS + shadcn/ui - Modern, responsive tasarım
- **SMS API**: Netgsm/İletimerkezi - SMS doğrulama servisi
- **TypeScript**: Tip güvenliği için tam TypeScript desteği

## 📋 Kurulum

### 1. Projeyi klonlayın
```bash
git clone <repository-url>
cd siteprojesi
```

### 2. Dependencies'leri yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/site_yonetim
# veya MongoDB Atlas için:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/site_yonetim

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# iyzico Payment Gateway (Sandbox)
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
# Production için: https://api.iyzipay.com

# SMS API (Opsiyonel - development'ta mock olarak çalışır)
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
SMS_API_URL=https://api.netgsm.com.tr/sms/send/get
```

### 4. Development Server'ı Başlatın
```bash
npm run dev
```

### 5. Tarayıcıda Açın
[http://localhost:3000](http://localhost:3000)

## 👥 Kullanıcı Rolleri

### Admin
- Tüm sistem yönetimi ve kontrol
- Daire, kullanıcı, aidat CRUD işlemleri
- Raporlama ve istatistikler
- Rezervasyon onaylama/reddetme
- Duyuru yayınlama

### User (Sakin)
- Kendi daire bilgilerini görüntüleme
- Aidat geçmişi ve döküm görüntüleme
- Online aidat ödemesi
- Spor alanı rezervasyonu
- Duyuruları okuma
- Profil yönetimi

## 📁 Proje Yapısı

```
site-yonetim-sistemi/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── apartments/        # Daire CRUD
│   │   ├── users/             # Kullanıcı yönetimi
│   │   ├── dues/              # Aidat yönetimi
│   │   ├── payments/          # Ödeme işlemleri
│   │   ├── reservations/      # Rezervasyon sistemi
│   │   ├── announcements/     # Duyurular
│   │   └── admin/             # Admin API'leri
│   ├── admin/                 # Admin Dashboard
│   │   ├── apartments/
│   │   ├── users/
│   │   ├── dues/
│   │   ├── payments/
│   │   ├── reservations/
│   │   ├── announcements/
│   │   ├── reports/
│   │   └── settings/
│   ├── dashboard/             # User Dashboard
│   │   ├── apartment/
│   │   ├── dues/
│   │   ├── payment/
│   │   ├── reservations/
│   │   └── profile/
│   ├── login/                 # Login sayfası
│   ├── register/              # Kayıt sayfası
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui bileşenleri
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Providers.tsx
├── lib/
│   ├── mongodb.ts             # MongoDB bağlantısı
│   ├── auth.ts                # NextAuth yapılandırması
│   ├── iyzico.ts              # iyzico helper
│   ├── sms.ts                 # SMS helper
│   └── utils.ts               # Yardımcı fonksiyonlar
├── models/                    # Mongoose Modelleri
│   ├── User.ts
│   ├── Apartment.ts
│   ├── Dues.ts
│   ├── Payment.ts
│   ├── Reservation.ts
│   ├── Announcement.ts
│   └── SMSVerification.ts
├── types/
│   └── index.ts               # TypeScript type tanımları
├── middleware.ts              # Next.js middleware (auth)
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## 🚀 Önemli Özellikler

### Güvenlik
- NextAuth.js ile session yönetimi
- Role-based access control (RBAC)
- API route protection
- Input validation (Zod ile genişletilebilir)
- SMS doğrulama

### Performans
- Server-side rendering (SSR)
- MongoDB connection pooling
- Optimized API routes
- Lazy loading

### Responsive Tasarım
- Mobile-first yaklaşım
- Tailwind CSS breakpoints
- Tüm cihazlarda uyumlu

## 📝 Kullanım Senaryoları

### İlk Kurulum
1. Admin hesabı oluşturun (register sayfasından, sonra veritabanından role: "admin" yapın)
2. Daireleri ekleyin (Admin > Daireler)
3. Kullanıcıları onaylayın ve dairelere atayın (Admin > Kullanıcılar)
4. Aylık aidat oluşturun (Admin > Aidat Yönetimi)

### Kullanıcı Akışı
1. Kayıt ol (SMS doğrulama)
2. Admin onayı bekle
3. Giriş yap
4. Daire bilgilerini görüntüle
5. Aidat öde
6. Rezervasyon yap

## 🔧 Geliştirme Notları

- **SMS API**: Development ortamında SMS API yapılandırılmamışsa mock olarak çalışır
- **iyzico**: Sandbox modda test edilebilir, production için gerçek credentials gerekir
- **MongoDB**: Local MongoDB veya MongoDB Atlas kullanılabilir

## 📄 Lisans

Private - Sadece belirtilen site için kullanım hakkı vardır.

## 🤝 Destek

**webrek tasarım**
- 📞 Telefon: 0553 854 68 53
- 📧 Email: destek@webrektasarim.com
- 🌐 Website: www.webrektasarim.com
- 🕐 Çalışma Saatleri: Pazartesi-Cuma 09:00-18:00

Sorularınız veya sorunlarınız için yukarıdaki iletişim bilgilerini kullanabilirsiniz.

## 📚 Dokümantasyon

- **CHANGELOG.md** - Detaylı değişiklik geçmişi
- **BACKUP_GUIDE.md** - Yedekleme sistemi kullanım kılavuzu
- **DEPLOYMENT_VPS.md** - VPS deployment kılavuzu

## 🎯 Son Güncellemeler (v1.2.0)

- ✅ PWA manifest icon hataları düzeltildi
- ✅ Mobil responsive tasarım iyileştirildi
- ✅ Yedekleme ve geri yükleme sistemi eklendi
- ✅ Bildirim yönetimi sistemi (Email/SMS/Push)
- ✅ Güvenlik ayarları (Şifre politikası aktif)
- ✅ Yardım ve destek sayfası
- ✅ Database model düzeltmeleri (ObjectId referanslar)
- ✅ Duplicate detection ve error handling

**Versiyon:** 1.2.0  
**Son Güncelleme:** 2 Kasım 2024

