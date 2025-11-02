# 💾 Yedekleme ve Geri Yükleme Kılavuzu

## 📋 Genel Bakış

Bu sistem, tüm veritabanınızı JSON formatında yedeklemenize ve gerektiğinde geri yüklemenize olanak tanır.

## 🔐 Erişim

Yedekleme sistemi **sadece admin kullanıcıları** için erişilebilir:
- URL: `/admin/backup`
- Menü: Admin Panel → Yedekleme

## 📥 Yedek Oluşturma

### Yedekleme İçeriği

Yedekleme dosyası şunları içerir:
- ✅ Tüm kullanıcılar (şifreler dahil)
- ✅ Daireler
- ✅ Aidatlar
- ✅ Ödemeler
- ✅ Rezervasyonlar
- ✅ Duyurular
- ✅ SMS doğrulama kayıtları
- ✅ Sistem ayarları (bildirim ve güvenlik ayarları)
- ✅ **Daire atamaları korunur** (kullanıcı-daire ilişkileri)

### Yedek Oluşturma Adımları

1. Admin panelinde **Yedekleme** sayfasına gidin
2. "Yedek Oluştur" kartında **"Yedek İndir"** butonuna tıklayın
3. JSON dosyası otomatik olarak indirilecektir
4. Dosya adı: `backup-YYYY-MM-DDTHH-MM-SS.json`

### Yedek Dosyası Yapısı

```json
{
  "metadata": {
    "exportDate": "2024-11-02T15:30:00.000Z",
    "exportedBy": "admin@example.com",
    "version": "1.0",
    "collections": {
      "users": 50,
      "apartments": 179,
      "dues": 200,
      "payments": 150,
      "reservations": 30,
      "announcements": 10,
      "smsVerifications": 5,
      "settings": 2
    }
  },
  "data": {
    "users": [...],           // Kullanıcılar (apartmentId referansları ile)
    "apartments": [...],      // Daireler (residents referansları ile)
    "dues": [...],
    "payments": [...],
    "reservations": [...],
    "announcements": [...],
    "smsVerifications": [...],
    "settings": [...]         // Bildirim ve güvenlik ayarları
  }
}
```

> **ÖNEMLİ:** Yedek dosyası ObjectId referanslarını korur. Bu sayede kullanıcı-daire ilişkileri geri yüklemede bozulmaz.

## 📤 Yedek Geri Yükleme

### ⚠️ Önemli Uyarılar

- **GERİ YÜKLEMEDEN ÖNCE MUTLAKA MEVCUT VERİTABANININ YEDEĞİNİ ALIN!**
- Geri yükleme işlemi geri alınamaz
- "Değiştir" modu tüm mevcut verileri silecektir

### Geri Yükleme Modları

#### 1️⃣ Değiştir (Replace) Modu
- **Ne yapar:** Mevcut tüm verileri siler, yedekteki verilerle değiştirir
- **Ne zaman kullanılır:** Tamamen yeni bir başlangıç veya felaket kurtarma
- **Dikkat:** Mevcut admin kullanıcısı korunur, diğer tüm veriler silinir

#### 2️⃣ Birleştir (Merge) Modu
- **Ne yapar:** Yedekteki verileri mevcut verilerle birleştirir
- **Ne zaman kullanılır:** Eski verileri geri getirmek istediğinizde
- **Dikkat:** Aynı email'e sahip kullanıcılar atlanır (çakışma önleme)

### Geri Yükleme Adımları

1. Admin panelinde **Yedekleme** sayfasına gidin
2. "Yedek Geri Yükle" kartında **dosya seçin**
3. **Geri yükleme modunu** seçin (Değiştir veya Birleştir)
4. **"Geri Yükle"** butonuna tıklayın
5. Onay mesajını okuyun ve **onaylayın**
6. İşlem tamamlandıktan sonra sonuçları görün

### Geri Yükleme Sonuçları

İşlem tamamlandığında, kaç kayıt geri yüklendiğini göreceksiniz:

```
✅ Geri Yükleme Başarılı
- users: 50
- apartments: 179
- dues: 200
- payments: 150
- reservations: 30
- announcements: 10
- settings: 2
```

> **DİKKAT:** Geri yükleme sırasında:
> - Daireler **önce** geri yüklenir
> - Ardından kullanıcılar geri yüklenir (apartmentId referansları korunur)
> - Bu sıralama, kullanıcı-daire ilişkilerinin doğru kurulmasını sağlar

## 📅 Yedekleme Önerileri

### Sıklık
- **Günlük:** Aktif kullanımlı sistemler için
- **Haftalık:** Orta düzey kullanımlı sistemler için
- **Önemli işlemlerden önce:** Toplu güncellemeler, veri taşıma vb.

### Saklama
- Yedek dosyalarını **birden fazla yerde** saklayın:
  - 💻 Yerel bilgisayar
  - ☁️ Bulut depolama (Google Drive, Dropbox, OneDrive)
  - 💾 Harici disk
- En az **3 aylık** yedekleri saklayın
- Eski yedekleri düzenli olarak temizleyin

### Güvenlik
- ⚠️ Yedek dosyaları hassas bilgiler içerir (şifreler, kişisel veriler)
- 🔐 Yedekleri şifreli klasörlerde saklayın
- 🚫 Yedekleri herkese açık yerlerde paylaşmayın
- 🔑 Bulut depolama kullanıyorsanız iki faktörlü doğrulama açın

## 🔧 Sorun Giderme

### Yedek İndirilemedi
- Tarayıcı konsolunu kontrol edin (F12)
- Sunucu loglarını kontrol edin
- Veritabanı bağlantısını kontrol edin

### Geri Yükleme Başarısız
- JSON dosyasının geçerliliğini kontrol edin
- Dosya boyutunu kontrol edin (çok büyükse timeout olabilir)
- Sunucu belleğini kontrol edin

### "Duplicate Key Error"
- Birleştir modunda aynı email'e sahip kullanıcılar atlanır
- Daireler için aynı blok+daire numarası çakışabilir
- **Çözüm:** "Değiştir" modunu kullanın veya önce veritabanını temizleyin

### Daire Atamaları Kayboldu
- **Neden:** Eski yedekleme sistemi _id'leri siliyordu
- **Çözüm:** Yeni bir yedek oluşturun (sistem artık _id'leri koruyor)
- Eski yedekler geri yüklenirse daire atamaları kaybolabilir
- **Tavsiye:** Bu güncellemeden sonra YENİ bir yedek alın

## 🛡️ Felaket Kurtarma Planı

### Veri Kaybı Durumunda

1. **Sakin kalın** - Panik yapmayın
2. **En son yedeği bulun** - Tarih ve saat önemli
3. **Yeni bir test veritabanında deneyin** - Mümkünse
4. **Değiştir modu ile geri yükleyin**
5. **Verileri doğrulayın** - Tüm kullanıcılar, daireler vb. yerinde mi?
6. **Sistem testleri yapın** - Login, ödeme, rezervasyon vb.

### Önleyici Tedbirler

- 📊 Düzenli yedekleme takvimi oluşturun
- 🔔 Yedekleme hatırlatıcıları ayarlayın
- 📝 Yedekleme loglarını tutun
- 🧪 Yedekleri düzenli olarak test edin

## 📞 Destek

Sorun yaşarsanız:
1. Bu kılavuzu okuyun
2. Hata mesajlarını kaydedin
3. Sistem yöneticisiyle iletişime geçin

---

**Son Güncelleme:** Kasım 2024  
**Versiyon:** 1.0

