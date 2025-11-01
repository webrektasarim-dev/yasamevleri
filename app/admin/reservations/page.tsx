"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, XCircle, Calendar, Clock, User } from "lucide-react";

const facilityTypes = [
  { value: "Spor Salonu", color: "#3b82f6", icon: "🏋️" },
  { value: "Yüzme Havuzu", color: "#06b6d4", icon: "🏊" },
  { value: "Tenis Kortu", color: "#10b981", icon: "🎾" },
  { value: "Basketbol Sahası", color: "#f59e0b", icon: "🏀" },
  { value: "Toplantı Odası", color: "#8b5cf6", icon: "👥" },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [facilitySettings, setFacilitySettings] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchReservations();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilitySettings();
    }
  }, [selectedFacility]);

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      const data = await response.json();
      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      showToast("Rezervasyonlar yüklenemedi", "error");
    }
  };

  const fetchFacilitySettings = async () => {
    try {
      const response = await fetch(`/api/facilities/settings?facilityType=${encodeURIComponent(selectedFacility)}`);
      const data = await response.json();
      if (data.success) {
        setFacilitySettings(data.data);
      }
    } catch (error) {
      console.error("Tesis ayarları yüklenemedi", error);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (data.success) {
        showToast("Rezervasyon güncellendi", "success");
        fetchReservations();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Bu rezervasyonu silmek istediğinizden emin misiniz?")) return;
    try {
      const response = await fetch(`/api/reservations/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        showToast("Rezervasyon silindi", "success");
        fetchReservations();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  // Seçilen tesise göre rezervasyonları filtrele
  // İptal edilmiş rezervasyonları takvimde gösterme (tamamen silinmiş gibi)
  const filteredReservations = selectedFacility
    ? reservations.filter(res => res.facilityType === selectedFacility && res.status !== 'cancelled')
    : [];

  const calendarEvents = filteredReservations.map((res) => {
    const facility = facilityTypes.find(f => f.value === res.facilityType);
    return {
      id: res._id,
      title: res.title,
      start: res.startTime,
      end: res.endTime,
      backgroundColor: facility?.color || '#6b7280',
      borderColor: facility?.color || '#6b7280',
      textColor: '#ffffff',
    };
  });

  // Kapalı saatleri event olarak ekle
  const closedSlotEvents: any[] = [];
  if (facilitySettings && selectedFacility) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date();
    
    // Önümüzdeki 30 gün için kapalı saatleri oluştur
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);
      
      const dayName = dayNames[date.getDay()];
      const daySettings = facilitySettings.weeklySchedule[dayName];
      
      if (!daySettings) continue;
      
      // Tüm gün kapalıysa
      if (!daySettings.isOpen) {
        const start = new Date(date);
        start.setHours(0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59);
        
        closedSlotEvents.push({
          title: '🔒 TESİS KAPALI',
          start,
          end,
          display: 'auto',
          backgroundColor: '#dc2626',
          borderColor: '#dc2626',
          textColor: '#ffffff',
          classNames: ['closed-slot-event'],
          editable: false,
          overlap: false,
          extendedProps: {
            isClosed: true,
          },
        });
      } else if (daySettings.closedHours && daySettings.closedHours.length > 0) {
        // Belirli saatler kapalıysa
        daySettings.closedHours.forEach((hour: number) => {
          const start = new Date(date);
          start.setHours(hour, 0, 0);
          const end = new Date(date);
          end.setHours(hour + 1, 0, 0);
          
          closedSlotEvents.push({
            title: '🔒 KAPALI',
            start,
            end,
            display: 'auto',
            backgroundColor: '#dc2626',
            borderColor: '#dc2626',
            textColor: '#ffffff',
            classNames: ['closed-slot-event'],
            editable: false,
            overlap: false,
            extendedProps: {
              isClosed: true,
            },
          });
        });
      }
    }
  }

  const allEvents = [...calendarEvents, ...closedSlotEvents];

  const pendingReservations = filteredReservations.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Rezervasyon Yönetimi
          </h1>
          <p className="text-gray-600 mt-1">Tüm spor alanı ve ortak kullanım rezervasyonları</p>
        </div>
        {selectedFacility && (
          <Button 
            onClick={() => setSelectedFacility("")}
            variant="outline"
            className="border-2"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Tesis Seçimini Değiştir
          </Button>
        )}
      </div>

      {/* Tesis Seçimi - Sadece tesis seçilmemişse göster */}
      {!selectedFacility && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Yönetmek İstediğiniz Tesisi Seçin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {facilityTypes.map((facility) => {
              const facilityReservations = reservations.filter(r => r.facilityType === facility.value);
              const pendingCount = facilityReservations.filter(r => r.status === "pending").length;
              
              return (
                <button
                  key={facility.value}
                  onClick={() => setSelectedFacility(facility.value)}
                  className="p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 duration-300 relative overflow-hidden"
                  style={{ backgroundColor: facility.color }}
                >
                  <div className="text-center relative z-10">
                    <div className="text-5xl mb-3">{facility.icon}</div>
                    <h3 className="text-lg font-bold mb-1">{facility.value}</h3>
                    <p className="text-sm opacity-90">{facilityReservations.length} Rezervasyon</p>
                    {pendingCount > 0 && (
                      <div className="mt-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 animate-pulse">
                        <Clock className="h-3 w-3" />
                        {pendingCount} Bekliyor
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-8xl opacity-10">
                    {facility.icon}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Onay bekleyen ve takvim - Sadece tesis seçilmişse göster */}
      {selectedFacility && pendingReservations.length > 0 && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="border-b bg-gradient-to-r from-yellow-100/50 to-orange-100/50">
            <CardTitle className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md"
                style={{ backgroundColor: facilityTypes.find(f => f.value === selectedFacility)?.color }}
              >
                {facilityTypes.find(f => f.value === selectedFacility)?.icon}
              </div>
              <span style={{ color: facilityTypes.find(f => f.value === selectedFacility)?.color }}>
                {selectedFacility}
              </span>
              <span className="text-gray-400">-</span>
              Onay Bekleyen
              <Badge variant="warning" className="ml-2 animate-pulse">{pendingReservations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {pendingReservations.map((reservation) => {
                const facility = facilityTypes.find(f => f.value === reservation.facilityType);
                return (
                  <div 
                    key={reservation._id} 
                    className="flex items-center justify-between p-5 rounded-xl shadow-md hover:shadow-xl transition-all relative overflow-hidden"
                    style={{ 
                      background: `linear-gradient(135deg, ${facility?.color}15 0%, ${facility?.color}05 100%)`,
                      border: `2px solid ${facility?.color}30`
                    }}
                  >
                    <div className="absolute top-0 right-0 text-6xl opacity-10" style={{ color: facility?.color }}>
                      {facility?.icon}
                    </div>
                    <div className="flex items-start gap-3 flex-1 relative z-10">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                        style={{ backgroundColor: facility?.color, color: 'white' }}
                      >
                        {facility?.icon}
                      </div>
                      <div>
                        <p className="font-bold text-xl mb-1" style={{ color: facility?.color }}>{reservation.title}</p>
                        <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: facility?.color, opacity: 0.8 }}>{reservation.facilityType}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          {new Date(reservation.startTime).toLocaleString("tr-TR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <User className="h-4 w-4" />
                          {reservation.userId?.firstName} {reservation.userId?.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <Button 
                        size="sm" 
                        className="font-semibold shadow-md hover:shadow-lg"
                        style={{ 
                          backgroundColor: '#10b981',
                          color: 'white'
                        }}
                        onClick={() => handleUpdateStatus(reservation._id, "approved")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button 
                        size="sm" 
                        className="font-semibold shadow-md hover:shadow-lg"
                        style={{ 
                          backgroundColor: '#ef4444',
                          color: 'white'
                        }}
                        onClick={() => handleUpdateStatus(reservation._id, "cancelled")}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFacility && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader 
          className="border-b relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${facilityTypes.find(f => f.value === selectedFacility)?.color}15 0%, ${facilityTypes.find(f => f.value === selectedFacility)?.color}05 100%)`
          }}
        >
          <div className="absolute top-0 right-0 text-9xl opacity-5" style={{ color: facilityTypes.find(f => f.value === selectedFacility)?.color }}>
            {facilityTypes.find(f => f.value === selectedFacility)?.icon}
          </div>
          <CardTitle className="flex items-center gap-3 relative z-10">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md"
              style={{ backgroundColor: facilityTypes.find(f => f.value === selectedFacility)?.color, color: 'white' }}
            >
              {facilityTypes.find(f => f.value === selectedFacility)?.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ color: facilityTypes.find(f => f.value === selectedFacility)?.color }}>{selectedFacility}</span>
                <span className="text-gray-400">-</span>
                <span>Rezervasyon Takvimi</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="relative z-10">Tüm rezervasyonları görüntüleyin ve yönetin</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={new Date()}
            locale={trLocale}
            headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridWeek,timeGridDay" }}
            buttonText={{ today: "Bugün", week: "Hafta", day: "Gün" }}
            events={allEvents}
            validRange={{ start: new Date().toISOString().split('T')[0] }}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            allDaySlot={false}
            height="700px"
            nowIndicator={true}
            selectable={false}
            dayMaxEvents={true}
            weekends={true}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            firstDay={new Date().getDay()}
            eventClick={(info) => {
              // Kapalı slot'a tıklanırsa bilgi göster
              if (info.event.extendedProps.isClosed) {
                showToast("Bu saat dilimi kapalı - tesis kullanıma kapalı", "error");
                return;
              }
              
              const res = reservations.find(r => r._id === info.event.id);
              setSelectedReservation(res);
            }}
          />
        </CardContent>
      </Card>
      )}

      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedReservation(null)}>
          <Card className="w-full max-w-md border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader 
              className="border-b relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}15 0%, ${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}05 100%)`
              }}
            >
              <div className="absolute top-0 right-0 text-9xl opacity-5" style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color }}>
                {facilityTypes.find(f => f.value === selectedReservation.facilityType)?.icon}
              </div>
              <CardTitle className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md"
                    style={{ backgroundColor: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color, color: 'white' }}
                  >
                    {facilityTypes.find(f => f.value === selectedReservation.facilityType)?.icon}
                  </div>
                  <span style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color }}>
                    Rezervasyon Detayı
                  </span>
                </div>
                <button onClick={() => setSelectedReservation(null)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg"
                  style={{ backgroundColor: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color, color: 'white' }}
                >
                  {facilityTypes.find(f => f.value === selectedReservation.facilityType)?.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl" style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color }}>{selectedReservation.title}</h3>
                  <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color, opacity: 0.7 }}>
                    {selectedReservation.facilityType}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div 
                  className="flex items-center gap-2 p-4 rounded-lg border-2"
                  style={{ 
                    backgroundColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}10`,
                    borderColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}30`
                  }}
                >
                  <User 
                    className="h-5 w-5" 
                    style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color }}
                  />
                  <div>
                    <p className="text-xs text-gray-500">Rezervasyon Yapan</p>
                    <p className="font-semibold text-gray-800">
                      {selectedReservation.userId?.firstName} {selectedReservation.userId?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{selectedReservation.userId?.email}</p>
                  </div>
                </div>

                <div 
                  className="flex items-center gap-2 p-4 rounded-lg border-2"
                  style={{ 
                    backgroundColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}10`,
                    borderColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}30`
                  }}
                >
                  <Clock 
                    className="h-5 w-5" 
                    style={{ color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color }}
                  />
                  <div>
                    <p className="text-xs text-gray-500">Tarih ve Saat</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedReservation.startTime).toLocaleString("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      Bitiş: {new Date(selectedReservation.endTime).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div 
                  className="flex items-center gap-2 p-4 rounded-lg border-2"
                  style={{ 
                    backgroundColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}10`,
                    borderColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}30`
                  }}
                >
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Durum</p>
                    <Badge 
                      className="font-semibold"
                      variant={selectedReservation.status === "approved" ? "success" : selectedReservation.status === "pending" ? "warning" : "destructive"}
                    >
                      {selectedReservation.status === "approved" ? "✓ Onaylandı" : selectedReservation.status === "pending" ? "⏳ Bekliyor" : "✕ İptal"}
                    </Badge>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div 
                    className="p-4 rounded-lg border-2"
                    style={{ 
                      backgroundColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}10`,
                      borderColor: `${facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color}30`
                    }}
                  >
                    <p className="text-xs text-gray-500 mb-1">Notlar</p>
                    <p className="text-sm text-gray-700">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {selectedReservation.status === "pending" && (
                  <>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                      onClick={() => { handleUpdateStatus(selectedReservation._id, "approved"); setSelectedReservation(null); }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Onayla
                    </Button>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => { 
                        if (confirm("Bu rezervasyonu reddetmek istediğinizden emin misiniz? Rezervasyon tamamen silinecek.")) {
                          handleDeleteReservation(selectedReservation._id); 
                          setSelectedReservation(null); 
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reddet ve Sil
                    </Button>
                  </>
                )}
                
                {selectedReservation.status === "approved" && (
                  <>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      style={{ backgroundColor: '#f59e0b', color: 'white' }}
                      onClick={() => { 
                        if (confirm("Bu rezervasyonun onayını kaldırmak istediğinizden emin misiniz? (Bekliyor durumuna dönecek)")) {
                          handleUpdateStatus(selectedReservation._id, "pending"); 
                          setSelectedReservation(null); 
                        }
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Onayı Kaldır
                    </Button>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      style={{ backgroundColor: '#ef4444', color: 'white' }}
                      onClick={() => { 
                        if (confirm("Bu rezervasyonu iptal etmek istediğinizden emin misiniz? Rezervasyon tamamen silinecek.")) {
                          handleDeleteReservation(selectedReservation._id); 
                          setSelectedReservation(null); 
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      İptal Et ve Sil
                    </Button>
                  </>
                )}

                {selectedReservation.status === "cancelled" && (
                  <>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      style={{ backgroundColor: '#10b981', color: 'white' }}
                      onClick={() => { 
                        if (confirm("Bu iptal edilmiş rezervasyonu yeniden onaylamak ister misiniz?")) {
                          handleUpdateStatus(selectedReservation._id, "approved"); 
                          setSelectedReservation(null); 
                        }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yeniden Onayla
                    </Button>
                    <Button 
                      className="flex-1 font-semibold shadow-md"
                      variant="destructive"
                      onClick={() => { 
                        if (confirm("Bu rezervasyonu kalıcı olarak silmek istediğinizden emin misiniz?")) {
                          handleDeleteReservation(selectedReservation._id); 
                          setSelectedReservation(null); 
                        }
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Kalıcı Sil
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  className="font-semibold"
                  style={{ 
                    borderColor: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color,
                    color: facilityTypes.find(f => f.value === selectedReservation.facilityType)?.color
                  }}
                  onClick={() => setSelectedReservation(null)}
                >
                  Kapat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}


