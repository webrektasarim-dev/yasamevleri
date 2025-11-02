"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { 
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Clock,
  Users,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  Info,
  MessageSquare,
  Mail,
  Database
} from "lucide-react";

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    passwordPolicy: {
      minLength: 6,
      requireUppercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
      expirationDays: 0,
    },
    sessionSettings: {
      sessionTimeout: 24,
      maxConcurrentSessions: 3,
      autoLogoutInactive: true,
      inactivityTimeout: 30,
    },
    twoFactorAuth: {
      enabled: false,
      requireForAdmin: false,
      method: 'sms',
    },
    loginSecurity: {
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      requireEmailVerification: true,
      requirePhoneVerification: false,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings?type=security');
      const data = await response.json();
      
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      showToast("Ayarlar yüklenemedi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (category: string, field: string) => {
    setSettings(prev => {
      const categoryData = prev[category as keyof typeof prev] as any;
      return {
        ...prev,
        [category]: {
          ...categoryData,
          [field]: !categoryData[field],
        },
      };
    });
  };

  const handleNumberChange = (category: string, field: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'security',
          settings,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Güvenlik ayarları kaydedildi! ✅", "success");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      showToast(error.message || "Kayıt başarısız oldu", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent tracking-tight">
          Güvenlik Ayarları
        </h1>
        <p className="text-sm md:text-base text-zinc-600 mt-1">
          Sistem güvenliği ve kullanıcı doğrulama ayarları
        </p>
      </div>

      <div className="space-y-6">
        {/* Password Policy */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-900">Şifre Politikası</CardTitle>
                <CardDescription>Kullanıcı şifrelerine ilişkin güvenlik kuralları</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Şifre Uzunluğu</Label>
                <Input
                  id="minLength"
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => handleNumberChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDays">Şifre Geçerlilik Süresi (Gün)</Label>
                <Input
                  id="expirationDays"
                  type="number"
                  min="0"
                  max="365"
                  value={settings.passwordPolicy.expirationDays}
                  onChange={(e) => handleNumberChange('passwordPolicy', 'expirationDays', parseInt(e.target.value))}
                />
                <p className="text-xs text-zinc-500">0 = Süresiz</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'requireUppercase', label: 'Büyük Harf Zorunlu' },
                { key: 'requireNumbers', label: 'Rakam Zorunlu' },
                { key: 'requireSpecialChars', label: 'Özel Karakter Zorunlu' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                  <span className="font-medium text-sm text-zinc-900">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.passwordPolicy[item.key as keyof typeof settings.passwordPolicy] as boolean}
                    onChange={() => handleToggle('passwordPolicy', item.key)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-900">Oturum Ayarları</CardTitle>
                <CardDescription>Kullanıcı oturum yönetimi ve zaman aşımı</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Oturum Süresi (Saat)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.sessionSettings.sessionTimeout}
                  onChange={(e) => handleNumberChange('sessionSettings', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inactivityTimeout">Hareketsizlik Süresi (Dakika)</Label>
                <Input
                  id="inactivityTimeout"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.sessionSettings.inactivityTimeout}
                  onChange={(e) => handleNumberChange('sessionSettings', 'inactivityTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSessions">Maksimum Eşzamanlı Oturum</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.sessionSettings.maxConcurrentSessions}
                  onChange={(e) => handleNumberChange('sessionSettings', 'maxConcurrentSessions', parseInt(e.target.value))}
                />
              </div>

              <label className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                <span className="font-medium text-sm text-zinc-900">Hareketsizlikte Otomatik Çıkış</span>
                <input
                  type="checkbox"
                  checked={settings.sessionSettings.autoLogoutInactive}
                  onChange={() => handleToggle('sessionSettings', 'autoLogoutInactive')}
                  className="w-5 h-5 text-green-600 rounded"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Login Security */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-900">Giriş Güvenliği</CardTitle>
                <CardDescription>Kullanıcı giriş ve doğrulama ayarları</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Maksimum Başarısız Giriş Denemesi</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="3"
                  max="10"
                  value={settings.loginSecurity.maxLoginAttempts}
                  onChange={(e) => handleNumberChange('loginSecurity', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Hesap Kilitleme Süresi (Dakika)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  min="5"
                  max="60"
                  value={settings.loginSecurity.lockoutDuration}
                  onChange={(e) => handleNumberChange('loginSecurity', 'lockoutDuration', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'requireEmailVerification', label: 'Email Doğrulama Zorunlu', desc: 'Yeni kullanıcılar için' },
                { key: 'requirePhoneVerification', label: 'Telefon Doğrulama Zorunlu', desc: 'SMS ile doğrulama' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.loginSecurity[item.key as keyof typeof settings.loginSecurity] as boolean}
                    onChange={() => handleToggle('loginSecurity', item.key)}
                    className="w-5 h-5 text-orange-600 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-zinc-900">İki Faktörlü Doğrulama (2FA)</CardTitle>
                  <CardDescription>Ekstra güvenlik katmanı</CardDescription>
                </div>
              </div>
              <Badge variant={settings.twoFactorAuth.enabled ? "default" : "secondary"}>
                {settings.twoFactorAuth.enabled ? "Aktif" : "Pasif"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-900">
                  <span className="font-medium">Önemli:</span> 2FA etkinleştirildiğinde, tüm admin kullanıcıları her girişte doğrulama kodu girmek zorunda kalacaktır.
                </p>
              </div>
            </div>

            <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors">
              <div>
                <span className="font-medium text-zinc-900">İki Faktörlü Doğrulamayı Etkinleştir</span>
                <p className="text-xs text-zinc-600 mt-1">Tüm sistem için 2FA zorunlu hale gelir</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth.enabled}
                  onChange={() => handleToggle('twoFactorAuth', 'enabled')}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </label>

            {settings.twoFactorAuth.enabled && (
              <div className="space-y-3 pl-4 border-l-2 border-red-200">
                <label className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200 cursor-pointer">
                  <span className="font-medium text-sm text-zinc-900">Admin Kullanıcılar İçin Zorunlu</span>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth.requireForAdmin}
                    onChange={() => handleToggle('twoFactorAuth', 'requireForAdmin')}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                </label>

                <div className="space-y-2">
                  <Label>Doğrulama Yöntemi</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSettings(prev => ({...prev, twoFactorAuth: {...prev.twoFactorAuth, method: 'sms'}}))}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        settings.twoFactorAuth.method === 'sms' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <MessageSquare className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">SMS</div>
                    </button>
                    <button
                      onClick={() => setSettings(prev => ({...prev, twoFactorAuth: {...prev.twoFactorAuth, method: 'email'}}))}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        settings.twoFactorAuth.method === 'email' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <Mail className="h-5 w-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Email</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-900">Oturum Yönetimi</CardTitle>
                <CardDescription>Oturum süresi ve güvenlik ayarları</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {settings.sessionSettings.sessionTimeout}h
                </div>
                <div className="text-sm text-zinc-600">Maksimum Oturum Süresi</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {settings.sessionSettings.inactivityTimeout}dk
                </div>
                <div className="text-sm text-zinc-600">Hareketsizlik Zaman Aşımı</div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {settings.sessionSettings.maxConcurrentSessions}
                </div>
                <div className="text-sm text-zinc-600">Max. Eşzamanlı Oturum</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Security */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-zinc-900">Giriş Güvenliği</CardTitle>
                <CardDescription>Başarısız giriş denemeleri ve hesap kilitleme</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {settings.loginSecurity.maxLoginAttempts}
                </div>
                <div className="text-sm text-zinc-600">Max. Başarısız Deneme</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {settings.loginSecurity.lockoutDuration}dk
                </div>
                <div className="text-sm text-zinc-600">Kilitleme Süresi</div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-center">
                {settings.loginSecurity.requireEmailVerification ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
                <div className="text-sm text-zinc-600 ml-2">Email Doğrulama</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Güvenlik Özeti */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="h-5 w-5" />
              Güvenlik Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Şifre Şifreleme</p>
                  <p className="text-xs text-zinc-600">bcrypt algoritması aktif</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <Lock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">HTTPS Bağlantı</p>
                  <p className="text-xs text-zinc-600">Şifreli veri aktarımı</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <Eye className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">Oturum Yönetimi</p>
                  <p className="text-xs text-zinc-600">NextAuth güvenli token</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-zinc-900">MongoDB Atlas</p>
                  <p className="text-xs text-zinc-600">Şifreli bağlantı</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/settings">
            <Button variant="outline">
              İptal
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Button>
        </div>
      </div>

      {ToastComponent}
    </div>
  );
}

