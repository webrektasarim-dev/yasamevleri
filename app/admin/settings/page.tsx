"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Clock, Save, CheckCircle, XCircle, Calendar, ChevronRight, Settings2, Bell, Shield, Database, HelpCircle } from "lucide-react";
import Link from "next/link";

const facilityTypes = [
  { value: "Spor Salonu", color: "#3b82f6", icon: "🏋️" },
  { value: "Yüzme Havuzu", color: "#06b6d4", icon: "🏊" },
  { value: "Tenis Kortu", color: "#10b981", icon: "🎾" },
  { value: "Basketbol Sahası", color: "#f59e0b", icon: "🏀" },
  { value: "Toplantı Odası", color: "#8b5cf6", icon: "👥" },
];

const daysOfWeek = [
  { key: "monday", label: "Pazartesi", short: "Pzt" },
  { key: "tuesday", label: "Salı", short: "Sal" },
  { key: "wednesday", label: "Çarşamba", short: "Çar" },
  { key: "thursday", label: "Perşembe", short: "Per" },
  { key: "friday", label: "Cuma", short: "Cum" },
  { key: "saturday", label: "Cumartesi", short: "Cmt" },
  { key: "sunday", label: "Pazar", short: "Paz" },
];

export default function SettingsPage() {
  const [showFacilitySettings, setShowFacilitySettings] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (selectedFacility) {
      fetchSettings();
    }
  }, [selectedFacility]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/facilities/settings?facilityType=${encodeURIComponent(selectedFacility)}`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      showToast("Ayarlar yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSettings({
      ...settings,
      weeklySchedule: {
        ...settings.weeklySchedule,
        [day]: {
          ...settings.weeklySchedule[day],
          isOpen: !settings.weeklySchedule[day].isOpen,
        },
      },
    });
  };

  const toggleHour = (day: string, hour: number) => {
    const schedule = settings.weeklySchedule[day];
    let closedHours = schedule.closedHours || [];

    if (closedHours.includes(hour)) {
      closedHours = closedHours.filter((h: number) => h !== hour);
    } else {
      closedHours = [...closedHours, hour];
    }

    const newSettings = {
      ...settings,
      weeklySchedule: {
        ...settings.weeklySchedule,
        [day]: {
          ...settings.weeklySchedule[day],
          closedHours: closedHours.sort((a: number, b: number) => a - b),
        },
      },
    };
    
    setSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const saveData = {
        facilityType: selectedFacility,
        weeklySchedule: settings.weeklySchedule,
        closedDates: settings.closedDates || [],
      };
      
      const response = await fetch("/api/facilities/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Tesis ayarları kaydedildi! ✅", "success");
        // Ayarları yeniden yükle
        await fetchSettings();
      } else {
        showToast(data.error, "error");
      }
    } catch (error: any) {
      showToast("Bir hata oluştu: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const facility = facilityTypes.find(f => f.value === selectedFacility);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Sistem Ayarları
        </h1>
        <p className="text-gray-600 mt-1">Genel sistem ayarlarını ve tesis çalışma saatlerini yönetin</p>
      </div>

      {/* Ana Ayarlar Menüsü - Sadece kategori seçilmemişse göster */}
      {!showFacilitySettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tesis Çalışma Saatleri Kartı */}
          <button
            onClick={() => setShowFacilitySettings(true)}
            className="text-left p-6 rounded-2xl bg-white border-2 border-blue-200 hover:border-blue-400 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <ChevronRight className="h-6 w-6 text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tesis Çalışma Saatleri</h3>
            <p className="text-sm text-gray-600">Tesislerin hangi gün ve saatlerde açık olacağını belirleyin</p>
          </button>

          {/* Yedekleme Kartı */}
          <Link href="/admin/backup">
            <div className="text-left p-6 rounded-2xl bg-white border-2 border-green-200 hover:border-green-400 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Database className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-green-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Yedekleme</h3>
              <p className="text-sm text-gray-600">Veritabanını yedekleyin ve geri yükleyin</p>
            </div>
          </Link>

          {/* Bildirim Ayarları Kartı */}
          <Link href="/admin/notifications">
            <div className="text-left p-6 rounded-2xl bg-white border-2 border-orange-200 hover:border-orange-400 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-orange-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Bildirim Ayarları</h3>
              <p className="text-sm text-gray-600">Email, SMS ve push bildirimlerini yönetin</p>
            </div>
          </Link>

          {/* Güvenlik Ayarları Kartı */}
          <Link href="/admin/security">
            <div className="text-left p-6 rounded-2xl bg-white border-2 border-red-200 hover:border-red-400 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-red-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Güvenlik Ayarları</h3>
              <p className="text-sm text-gray-600">Şifre politikası ve oturum yönetimi</p>
            </div>
          </Link>

          {/* Yardım ve Destek Kartı - En Sonda */}
          <Link href="/admin/help">
            <div className="text-left p-6 rounded-2xl bg-white border-2 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 group cursor-pointer">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <HelpCircle className="h-7 w-7 text-white" />
                </div>
                <ChevronRight className="h-6 w-6 text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Yardım ve Destek</h3>
              <p className="text-sm text-gray-600">Kullanım kılavuzu ve teknik destek</p>
            </div>
          </Link>
        </div>
      )}

      {/* Tesis Çalışma Saatleri - Kategori seçildiğinde göster */}
      {showFacilitySettings && (
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Tesis Çalışma Saatleri
                </CardTitle>
                <CardDescription>
                  Tesislerin hangi gün ve saatlerde açık olacağını belirleyin
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowFacilitySettings(false);
                  setSelectedFacility("");
                  setSettings(null);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!selectedFacility ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Tesis Seçin</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {facilityTypes.map((facility) => (
                  <button
                    key={facility.value}
                    onClick={() => setSelectedFacility(facility.value)}
                    className="p-4 rounded-xl text-white shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300"
                    style={{ backgroundColor: facility.color }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{facility.icon}</div>
                      <h3 className="text-sm font-bold">{facility.value}</h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : settings ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: facility?.color, color: 'white' }}
                  >
                    {facility?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: facility?.color }}>{selectedFacility}</h2>
                    <p className="text-sm text-gray-600">Haftalık çalışma programı (Gün ve Saat bazlı)</p>
                  </div>
                </div>
                <Button onClick={() => setSelectedFacility("")} variant="outline" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Tesis Değiştir
                </Button>
              </div>

              {/* Haftalık Program - Saat Bazlı */}
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const daySchedule = settings.weeklySchedule[day.key] || { isOpen: true, closedHours: [] };
                  const closedHours = daySchedule.closedHours || [];
                  
                  return (
                    <div key={day.key} className="border-2 rounded-xl p-4" style={{ borderColor: `${facility?.color}30` }}>
                      {/* Gün Başlığı */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg text-gray-800">{day.label}</h3>
                          {!daySchedule.isOpen ? (
                            <Badge variant="destructive" className="font-semibold">Tüm Gün Kapalı</Badge>
                          ) : closedHours.length > 0 ? (
                            <Badge variant="warning" className="font-semibold">{closedHours.length} Saat Kapalı</Badge>
                          ) : (
                            <Badge style={{ backgroundColor: facility?.color, color: 'white' }} className="font-semibold">24 Saat Açık</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {daySchedule.isOpen && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => toggleDay(day.key)}
                            >
                              Tüm Günü Kapat
                            </Button>
                          )}
                          {!daySchedule.isOpen && (
                            <Button
                              size="sm"
                              style={{ backgroundColor: facility?.color, color: 'white' }}
                              onClick={() => toggleDay(day.key)}
                            >
                              Tüm Günü Aç
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Saatler Grid - Sadece gün açıksa göster */}
                      {daySchedule.isOpen && (
                        <div className="grid grid-cols-12 gap-1">
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                            const isClosed = closedHours.includes(hour);
                            return (
                              <button
                                key={hour}
                                onClick={() => toggleHour(day.key, hour)}
                                className="aspect-square rounded-lg text-xs font-semibold transition-all hover:scale-110 shadow-sm"
                                style={{
                                  backgroundColor: isClosed ? '#fca5a5' : `${facility?.color}`,
                                  color: 'white',
                                  opacity: isClosed ? 0.7 : 1,
                                }}
                                title={isClosed ? `${hour}:00 Kapalı - Açmak için tıklayın` : `${hour}:00 Açık - Kapatmak için tıklayın`}
                              >
                                {hour}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFacility("")}
                >
                  İptal
                </Button>
                <Button
                  className="font-semibold shadow-lg"
                  style={{ backgroundColor: facility?.color, color: 'white' }}
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-500">Yükleniyor...</p>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {ToastComponent}
    </div>
  );
}





