# VPS Deployment Rehberi

## Ubuntu 22.04 Sunucuda Next.js Kurulumu

### 1. SSH ile Bağlanın
```bash
ssh root@SUNUCU_IP
```

### 2. Node.js Kurun
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # v18.x.x olmalı
```

### 3. PM2 Kurun (Process Manager)
```bash
npm install -g pm2
```

### 4. Nginx Kurun (Web Server)
```bash
sudo apt update
sudo apt install nginx -y
```

### 5. Projenizi Yükleyin
```bash
cd /var/www
git clone https://github.com/webrektasarim-dev/ornek-yasam-evleri.git
cd ornek-yasam-evleri
npm install
```

### 6. Environment Variables (.env.local)
```bash
nano .env.local
```

İçeriği:
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://ornekevler.com
IYZICO_API_KEY=...
IYZICO_SECRET_KEY=...
IYZICO_BASE_URL=...
```

### 7. Build & Start
```bash
npm run build
pm2 start npm --name "ornek-evler" -- start
pm2 save
pm2 startup
```

### 8. Nginx Ayarları
```bash
sudo nano /etc/nginx/sites-available/ornekevler.com
```

İçerik:
```nginx
server {
    listen 80;
    server_name ornekevler.com www.ornekevler.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9. Nginx Aktif Et
```bash
sudo ln -s /etc/nginx/sites-available/ornekevler.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. SSL Sertifikası (Let's Encrypt - Ücretsiz)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ornekevler.com -d www.ornekevler.com
```

### 11. Domain DNS Ayarları
Domain sağlayıcınızda:
```
A Record:
Name: @
Value: SUNUCU_IP_ADRESINIZ

A Record:
Name: www
Value: SUNUCU_IP_ADRESINIZ
```

## Güncelleme Yapmak
```bash
cd /var/www/ornek-yasam-evleri
git pull
npm install
npm run build
pm2 restart ornek-evler
```

## Logları Görüntüleme
```bash
pm2 logs ornek-evler
```

