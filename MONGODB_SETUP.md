# MongoDB Atlas Kurulum ve Yapılandırma Rehberi

## 🗄️ MongoDB Atlas Kurulumu

### 1. MongoDB Atlas Hesabı
1. https://www.mongodb.com/cloud/atlas/register adresine gidin
2. Email veya Google ile kayıt olun

### 2. Free Cluster Oluşturma
1. **Create a Deployment** → **M0 (FREE)** seçin
2. Provider: **AWS**
3. Region: **Frankfurt (eu-central-1)** (Türkiye'ye en yakın)
4. Cluster Name: `yasamevleri`
5. **Create Deployment**

### 3. Database Kullanıcısı
1. Username: `admin`
2. Password: Güçlü bir şifre oluşturun ve **kaydedin!**
3. **Create User**

### 4. Network Access
1. **Allow Access From Anywhere** (0.0.0.0/0) seçin
   - Vercel için gerekli!
2. **Finish and Close**

### 5. Connection String Alma
1. **Database** → **Connect** → **Drivers**
2. Driver: Node.js 5.5 or later
3. Connection string'i kopyalayın:

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

4. `<password>` yerine gerçek şifrenizi yazın
5. Sonuna database adını ekleyin: `/yasamevleri`

**Final Format:**
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/yasamevleri?retryWrites=true&w=majority
```

⚠️ **Önemli:** Şifrede özel karakter varsa encode edin:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- Örnek: `P@ss#123` → `P%40ss%23123`

---

## 💻 Local Development (.env.local)

Proje kök dizininde `.env.local` dosyasını düzenleyin:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/yasamevleri?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=8f282e49ff08a59f3f8732a1c1ddf7692be46c1326d44e8609261b35c31d43bd

# Iyzico Payment Gateway (Opsiyonel)
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# SMS API (Opsiyonel)
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
```

### NEXTAUTH_SECRET Oluşturma

Terminal'de:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🧪 Bağlantıyı Test Etme

### 1. Development Server Başlatma
```bash
npm run dev
```

### 2. Test Endpointleri

#### Ana Sayfa
```
http://localhost:3000
```

#### MongoDB Bağlantı Testi
```
http://localhost:3000/api/test-db
```
✅ Başarılı: `{"success": true, "message": "MongoDB bağlantısı başarılı"}`
❌ Hata: Connection string'i kontrol edin

#### Login Sayfası
```
http://localhost:3000/login
```

---

## 🚀 Vercel Production Deployment

### 1. Vercel Dashboard
1. https://vercel.com/dashboard adresine gidin
2. Projenizi seçin
3. **Settings** → **Environment Variables**

### 2. Environment Variables Ekleme

Her değişken için **Add New** tıklayın:

| Key | Value | Environment |
|-----|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://admin:PASSWORD@...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `NEXTAUTH_SECRET` | (Local'deki secret) | Production, Preview, Development |
| `IYZICO_API_KEY` | (Opsiyonel) | Production |
| `IYZICO_SECRET_KEY` | (Opsiyonel) | Production |
| `IYZICO_BASE_URL` | (Opsiyonel) | Production |

⚠️ **Önemli:**
- **NEXTAUTH_URL** → Production URL'i kullanın: `https://your-domain.vercel.app`
- Tüm değişkenleri ekledikten sonra **Redeploy** yapın

### 3. Redeploy
1. **Deployments** sekmesine gidin
2. Son deployment'ın sağındaki **⋮** → **Redeploy**
3. Build loglarını kontrol edin

---

## 🔒 Güvenlik Notları

### MongoDB Atlas
- ✅ Güçlü şifre kullanın
- ✅ Network Access'te sadece gerekli IP'leri ekleyin (production için)
- ✅ Database user'a sadece gerekli yetkileri verin

### Environment Variables
- ❌ Asla GitHub'a commit etmeyin (.env.local .gitignore'da)
- ✅ Production'da farklı secret key kullanın
- ✅ Şifreleri güvenli yerlerde saklayın (password manager)

---

## 🐛 Sorun Giderme

### "MongoNetworkError" / "Connection Timeout"
- ✅ Network Access'te 0.0.0.0/0 eklenmiş mi kontrol edin
- ✅ Connection string'deki şifre doğru mu?
- ✅ Şifrede özel karakter varsa encode edilmiş mi?

### "Authentication failed"
- ✅ Database user oluşturulmuş mu?
- ✅ Username ve password doğru mu?
- ✅ User'ın database'e erişim yetkisi var mı?

### Vercel Build Başarısız
- ✅ Environment variables eklenmiş mi?
- ✅ MONGODB_URI değişkeni tüm environment'larda var mı?
- ✅ Connection string formatı doğru mu?

### Local'de Çalışıyor, Vercel'de Çalışmıyor
- ✅ Vercel environment variables kontrol edin
- ✅ NEXTAUTH_URL production URL'i mi?
- ✅ MongoDB Network Access'te 0.0.0.0/0 var mı?

---

## 📞 Destek

**webrek tasarım**
- 📱 Telefon: [0553 854 68 53](tel:+905538546853)
- 📧 Email: [destek@webrektasarim.com](mailto:destek@webrektasarim.com)
- 🌐 Website: [www.webrektasarim.com](https://www.webrektasarim.com)
- ⏰ Çalışma Saatleri: Pazartesi-Cuma 09:00-18:00

---

## ✅ Checklist

### MongoDB Atlas
- [ ] Hesap oluşturuldu
- [ ] Cluster oluşturuldu (M0 FREE)
- [ ] Database user oluşturuldu
- [ ] Network Access ayarlandı (0.0.0.0/0)
- [ ] Connection string alındı
- [ ] Şifre encode edildi (özel karakter varsa)

### Local Development
- [ ] .env.local dosyası oluşturuldu
- [ ] MONGODB_URI eklendi
- [ ] NEXTAUTH_SECRET oluşturuldu
- [ ] npm run dev çalıştırıldı
- [ ] http://localhost:3000/api/test-db test edildi

### Vercel Production
- [ ] Vercel'de environment variables eklendi
- [ ] NEXTAUTH_URL production URL'i
- [ ] Redeploy yapıldı
- [ ] Production'da test edildi

---

**Son Güncelleme:** 2025-01-11
**Repository:** https://github.com/webrektasarim-dev/yasamevleri

