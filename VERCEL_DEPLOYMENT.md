# 🚀 Vercel Deployment Kılavuzu

## 📋 Ön Hazırlık

### 1. Environment Variables (.env.local)

Vercel dashboard'unda şu değişkenleri ekleyin:

```bash
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_key_here
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com (test için)
SMS_API_KEY=your_sms_api_key (opsiyonel)
SMS_API_SECRET=your_sms_secret (opsiyonel)
```

### 2. NEXTAUTH_SECRET Oluşturma

Terminal'de çalıştırın:
```bash
openssl rand -base64 32
```

veya

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🔧 Deployment Adımları

### 1. Git Repository'ye Push

```bash
git add -A
git commit -m "chore: Prepare for Vercel deployment"
git push origin main
```

### 2. Vercel'de Proje Oluşturma

1. **Vercel Dashboard**'a gidin: https://vercel.com
2. **"Add New Project"** tıklayın
3. **Git repository**'nizi seçin
4. **Framework Preset:** Next.js (otomatik algılanır)
5. **Root Directory:** ./ (default)

### 3. Environment Variables Ekleme

**Vercel Dashboard → Project Settings → Environment Variables**

Her bir değişken için:
- **Key:** Değişken adı (örn: `MONGODB_URI`)
- **Value:** Değişken değeri
- **Environments:** Production, Preview, Development (hepsini seçin)

### 4. Deploy

**"Deploy"** butonuna tıklayın!

## 📊 Build Özeti

```
✓ Build başarılı
✓ 23 sayfa
✓ 40 API route
✓ Toplam boyut: ~87.3 kB First Load JS
```

## 🌍 Domain Ayarları

### Özel Domain Ekleme

1. **Vercel Dashboard → Project → Settings → Domains**
2. Domain'inizi ekleyin (örn: `ornek-yasam-evleri.com`)
3. DNS ayarlarını yapılandırın:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## ⚙️ Vercel Ayarları

### Build & Development Settings

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### Environment Variables Kontrolü

Production'da çalıştığından emin olun:
- ✅ MONGODB_URI - MongoDB Atlas connection string
- ✅ NEXTAUTH_URL - Production URL (https://your-app.vercel.app)
- ✅ NEXTAUTH_SECRET - Güçlü bir secret key
- ✅ IYZICO_API_KEY - İyzico credentials
- ✅ IYZICO_SECRET_KEY - İyzico secret

## 🔐 Güvenlik Kontrol Listesi

- [ ] NEXTAUTH_SECRET güçlü ve benzersiz
- [ ] MongoDB IP whitelist'e Vercel IP'leri eklendi (veya 0.0.0.0/0)
- [ ] Environment variables production'da set edildi
- [ ] NEXTAUTH_URL production URL'e ayarlı
- [ ] İyzico production credentials kullanılıyor (canlı için)

## 🗄️ MongoDB Atlas Ayarları

### IP Whitelist

**MongoDB Atlas → Network Access → Add IP Address**

Seçenek 1: Vercel'in tüm IP'lerine izin ver
```
0.0.0.0/0 (Allow access from anywhere)
```

Seçenek 2: Vercel IP ranges (daha güvenli)
```
Vercel documentation'dan IP range'leri alın
```

### Database User

**MongoDB Atlas → Database Access → Add New Database User**

```
Username: vercel-app-user
Password: [güçlü şifre]
Built-in Role: Atlas Admin veya Read and write to any database
```

## 🧪 Deployment Sonrası Test

### 1. Ana Sayfa
```
https://your-app.vercel.app/
```

### 2. Login
```
https://your-app.vercel.app/login
```

### 3. API Health Check
```
https://your-app.vercel.app/api/check-role
```

### 4. Admin Panel
```
https://your-app.vercel.app/admin
```

## 🔄 Re-deployment

### Manuel Re-deploy

**Vercel Dashboard → Deployments → [Latest] → ... → Redeploy**

### Git Push ile Auto-deploy

```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel otomatik olarak yeniden deploy eder.

## 📱 Preview Deployments

Her branch için otomatik preview:

```bash
git checkout -b feature-xyz
git push origin feature-xyz
```

Vercel otomatik preview URL oluşturur:
```
https://your-app-git-feature-xyz.vercel.app
```

## 🐛 Troubleshooting

### Build Hatası

**Logs:** Vercel Dashboard → Deployments → Failed → View Function Logs

Yaygın sorunlar:
- Environment variables eksik
- MongoDB connection başarısız
- Dependencies eksik

### Runtime Hatası

**Logs:** Vercel Dashboard → Deployments → [Latest] → View Function Logs

### MongoDB Connection Timeout

- IP whitelist kontrolü
- Connection string formatı doğru mu?
- User credentials doğru mu?

### NextAuth Session Hatası

- `NEXTAUTH_URL` production URL'e ayarlı mı?
- `NEXTAUTH_SECRET` set edildi mi?
- Cookies çalışıyor mu? (HTTPS gerekli)

## 📊 Performance Monitoring

### Vercel Analytics

**Settings → Analytics → Enable**

- Real User Monitoring
- Web Vitals
- Traffic insights

### Speed Insights

**Settings → Speed Insights → Enable**

- Core Web Vitals
- Performance scores
- Lighthouse metrics

## 🔄 Continuous Deployment

### GitHub Actions (Opsiyonel)

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📝 Notlar

- **Build Time:** ~2-3 dakika
- **Cold Start:** İlk istek yavaş olabilir
- **Serverless Functions:** 10 saniye timeout (Hobby plan)
- **Bandwidth:** 100GB/ay (Hobby plan)

## 🆘 Destek

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

**Başarılı Deployment için tüm adımları takip edin!** ✅

