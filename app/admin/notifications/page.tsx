"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { 
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Save,
  Info
} from "lucide-react";

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: {
      enabled: true,
      newDues: true,
      paymentConfirmation: true,
      reservationStatus: true,
      announcements: true,
      systemUpdates: false,
    },
    smsNotifications: {
      enabled: false,
      paymentReminder: false,
      reservationConfirmation: false,
      urgentAnnouncements: false,
    },
    pushNotifications: {
      enabled: false,
      realTimeUpdates: false,
      duesReminder: false,
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleToggle = (category: string, field: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: !prev[category as keyof typeof prev][field as any],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast("Bildirim ayarları kaydedildi! ✅", "success");
    } catch (error) {
      showToast("Kayıt başarısız oldu", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
          Bildirim Ayarları
        </h1>
        <p className="text-sm md:text-base text-zinc-600 mt-1">
          Email, SMS ve push bildirimlerini yönetin
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-zinc-900">Email Bildirimleri</CardTitle>
                  <CardDescription>Kullanıcılara email ile bildirim gönder</CardDescription>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications.enabled}
                  onChange={() => handleToggle('emailNotifications', 'enabled')}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'newDues', label: 'Yeni Aidat Bildirimi', desc: 'Yeni aidat dönemi oluşturulduğunda' },
                { key: 'paymentConfirmation', label: 'Ödeme Onayı', desc: 'Ödeme başarılı olduğunda' },
                { key: 'reservationStatus', label: 'Rezervasyon Durumu', desc: 'Rezervasyon onaylandığında/reddedildiğinde' },
                { key: 'announcements', label: 'Duyurular', desc: 'Yeni duyuru yayınlandığında' },
                { key: 'systemUpdates', label: 'Sistem Güncellemeleri', desc: 'Önemli sistem güncellemeleri' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications[item.key as keyof typeof settings.emailNotifications] as boolean}
                      onChange={() => handleToggle('emailNotifications', item.key)}
                      disabled={!settings.emailNotifications.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-zinc-900">SMS Bildirimleri</CardTitle>
                  <CardDescription>Kullanıcılara SMS ile bildirim gönder</CardDescription>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.smsNotifications.enabled}
                  onChange={() => handleToggle('smsNotifications', 'enabled')}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <p className="text-sm text-orange-900">
                  <span className="font-medium">Not:</span> SMS gönderimi için SMS API ayarlarının .env.local dosyasında tanımlanması gerekir.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'paymentReminder', label: 'Ödeme Hatırlatıcı', desc: 'Aidat son ödeme tarihinden önce' },
                { key: 'reservationConfirmation', label: 'Rezervasyon Onayı', desc: 'Rezervasyon onaylandığında' },
                { key: 'urgentAnnouncements', label: 'Acil Duyurular', desc: 'Sadece acil duyurular için' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications[item.key as keyof typeof settings.smsNotifications] as boolean}
                      onChange={() => handleToggle('smsNotifications', item.key)}
                      disabled={!settings.smsNotifications.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="border border-zinc-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-zinc-900">Push Bildirimleri</CardTitle>
                  <CardDescription>Tarayıcı üzerinden anlık bildirimler (PWA)</CardDescription>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications.enabled}
                  onChange={() => handleToggle('pushNotifications', 'enabled')}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-900">
                  <span className="font-medium">PWA:</span> Kullanıcılar uygulamayı telefonlarına yüklediklerinde push bildirimleri alabilirler.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { key: 'realTimeUpdates', label: 'Anlık Güncellemeler', desc: 'Önemli değişiklikler anında' },
                { key: 'duesReminder', label: 'Aidat Hatırlatıcı', desc: 'Ödeme tarihi yaklaştığında' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-3">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications[item.key as keyof typeof settings.pushNotifications] as boolean}
                      onChange={() => handleToggle('pushNotifications', item.key)}
                      disabled={!settings.pushNotifications.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
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
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
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

