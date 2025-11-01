"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Calendar, Clock, X } from "lucide-react";

const facilityTypes = [
  { value: "Spor Salonu", color: "#3b82f6", icon: "🏋️" },
  { value: "Yüzme Havuzu", color: "#06b6d4", icon: "🏊" },
  { value: "Tenis Kortu", color: "#10b981", icon: "🎾" },
  { value: "Basketbol Sahası", color: "#f59e0b", icon: "🏀" },
  { value: "Toplantı Odası", color: "#8b5cf6", icon: "👥" },
];

export default function ReservationsPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState<any[]>([]); // TÜM rezervasyonlar (takvim için)
  const [myReservations, setMyReservations] = useState<any[]>([]); // Sadece benim rezervasyonlarım (liste için)
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [facilitySettings, setFacilitySettings] = useState<any>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchReservations();
    fetchMyReservations();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      fetchFacilitySettings();
    }
  }, [selectedFacility]);

  const fetchReservations = async () => {
    try {
      // Tüm rezervasyonları getir (takvim için - dolu saatleri görmek için)
      const response = await fetch("/api/reservations");
      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
      }
    } catch (error) {
      showToast("Rezervasyonlar yüklenemedi", "error");
    }
  };

  const fetchMyReservations = async () => {
    try {
      // Sadece kendi rezervasyonlarımı getir (liste için)
      const response = await fetch("/api/reservations?myOnly=true");
      const data = await response.json();

      if (data.success) {
        setMyReservations(data.data);
      }
    } catch (error) {
      console.error("Rezervasyonlar yüklenemedi", error);
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

  const getDefaultTitle = (facilityType: string) => {
    switch (facilityType) {
      case "Spor Salonu": return "Fitness Antrenmanı";
      case "Yüzme Havuzu": return "Yüzme Seansı";
      case "Tenis Kortu": return "Tenis Maçı";
      case "Basketbol Sahası": return "Basketbol Maçı";
      case "Toplantı Odası": return "Toplantı";
      default: return "Rezervasyon";
    }
  };

  const handleDateClick = async (arg: any) => {
    if (!selectedFacility) {
      showToast("Lütfen önce bir tesis seçin", "error");
      return;
    }

    const clickedDate = new Date(arg.date);

    // Bu saatte başka rezervasyon var mı kontrol et
    const clickedTime = clickedDate.getTime();
    const hasExistingReservation = filteredReservations.some(res => {
      const resStart = new Date(res.startTime).getTime();
      const resEnd = new Date(res.endTime).getTime();
      return clickedTime >= resStart && clickedTime < resEnd;
    });

    if (hasExistingReservation) {
      showToast("Bu saat dolu! Başka bir saat seçin ⏰", "error");
      return;
    }

    // Tesis ayarlarını kontrol et
    if (facilitySettings) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[clickedDate.getDay()];
      const daySettings = facilitySettings.weeklySchedule[dayName];

      if (!daySettings.isOpen) {
        showToast(`${selectedFacility} ${dayNames[clickedDate.getDay()].charAt(0).toUpperCase() + dayNames[clickedDate.getDay()].slice(1)} günü kapalı!`, "error");
        return;
      }

      // Tıklanan saati kontrol et
      const clickedHour = clickedDate.getHours();
      if (daySettings.closedHours && daySettings.closedHours.includes(clickedHour)) {
        showToast(`${selectedFacility} bu saatlerde kapalı! (${clickedHour}:00)`, "error");
        return;
      }
    }
    
    const startTime = new Date(arg.date);
    const endTime = new Date(arg.date);
    endTime.setHours(endTime.getHours() + 1);
    
    const facility = facilityTypes.find(f => f.value === selectedFacility);
    const defaultTitle = getDefaultTitle(selectedFacility);
    
    const timeStr = startTime.toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const endTimeStr = endTime.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Onay dialogu göster
    const confirmed = confirm(
      `${facility?.icon} ${selectedFacility}\n\n` +
      `📅 ${timeStr} - ${endTimeStr}\n\n` +
      `📝 ${defaultTitle}\n\n` +
      `Bu rezervasyonu oluşturmak istiyor musunuz?`
    );

    if (confirmed) {
      try {
        const response = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityType: selectedFacility,
            title: defaultTitle,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            notes: "",
          }),
        });

        const data = await response.json();

        if (data.success) {
          showToast("Rezervasyon başarıyla oluşturuldu! 🎉", "success");
          fetchReservations(); // Tüm rezervasyonları yenile (takvim için)
          fetchMyReservations(); // Kendi rezervasyonlarımı yenile (liste için)
        } else {
          showToast(data.error, "error");
        }
      } catch (error) {
        showToast("Bir hata oluştu", "error");
      }
    }
  };


  const handleDeleteReservation = async (id: string) => {
    if (!confirm("Bu rezervasyonu silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Rezervasyon silindi", "success");
        fetchReservations(); // Tüm rezervasyonları yenile
        fetchMyReservations(); // Kendi rezervasyonlarımı yenile
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  // Takvim için: Seçilen tesise göre TÜM rezervasyonları filtrele (dolu saatleri görmek için)
  // İptal edilmiş rezervasyonları gösterme
  const filteredReservations = selectedFacility
    ? reservations.filter(res => res.facilityType === selectedFacility && res.status !== 'cancelled')
    : [];

  // Liste için: Sadece benim rezervasyonlarım
  const filteredMyReservations = selectedFacility
    ? myReservations.filter(res => res.facilityType === selectedFacility)
    : [];

  const calendarEvents = filteredReservations.map((res) => {
    const facility = facilityTypes.find(f => f.value === res.facilityType);
    const isMyReservation = res.userId?._id === (session?.user as any)?.id;
    
    return {
      id: res._id,
      title: isMyReservation ? `✓ ${res.title}` : `${res.userId?.firstName || 'Kullanıcı'} - ${res.title}`,
      start: res.startTime,
      end: res.endTime,
      backgroundColor: isMyReservation ? (facility?.color || '#3b82f6') : '#9ca3af',
      borderColor: isMyReservation ? (facility?.color || '#3b82f6') : '#6b7280',
      textColor: '#ffffff',
      extendedProps: {
        status: res.status,
        notes: res.notes,
        reservationId: res._id,
        facilityType: res.facilityType,
        userId: res.userId?._id,
        isMyReservation,
      },
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Rezervasyonlar
          </h1>
          <p className="text-gray-600 mt-1">Spor alanları ve ortak kullanım rezervasyonları</p>
        </div>
        {selectedFacility && (
          <Button 
            onClick={() => setSelectedFacility("")}
            variant="outline"
            className="border-2"
          >
            <X className="h-4 w-4 mr-2" />
            Tesis Seçimini Değiştir
          </Button>
        )}
      </div>

      {/* Tesis Seçimi - Sadece tesis seçilmemişse göster */}
      {!selectedFacility && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Rezervasyon Yapmak İstediğiniz Tesisi Seçin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilityTypes.map((facility) => (
              <button
                key={facility.value}
                onClick={() => setSelectedFacility(facility.value)}
                className="p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 duration-300"
                style={{ backgroundColor: facility.color }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{facility.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{facility.value}</h3>
                  <p className="text-sm opacity-90">Rezervasyon yapmak için tıklayın</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Takvim ve rezervasyonlar - Sadece tesis seçilmişse göster */}
      {selectedFacility && (
        <>
          {/* Tesis Çalışma Saatleri Bilgisi */}
          {facilitySettings && (
            <Card className="border-0 shadow-lg mb-6" style={{ backgroundColor: `${facilityTypes.find(f => f.value === selectedFacility)?.color}10` }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" style={{ color: facilityTypes.find(f => f.value === selectedFacility)?.color }} />
                  <span style={{ color: facilityTypes.find(f => f.value === selectedFacility)?.color }}>
                    {selectedFacility} Çalışma Saatleri
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { key: "monday", label: "Pzt" },
                    { key: "tuesday", label: "Sal" },
                    { key: "wednesday", label: "Çar" },
                    { key: "thursday", label: "Per" },
                    { key: "friday", label: "Cum" },
                    { key: "saturday", label: "Cmt" },
                    { key: "sunday", label: "Paz" },
                  ].map((day) => {
                    const daySettings = facilitySettings.weeklySchedule[day.key] || { isOpen: true, closedHours: [] };
                    const closedHours = daySettings.closedHours || [];
                    
                    return (
                      <div 
                        key={day.key}
                        className="text-center p-3 rounded-lg border-2"
                        style={{
                          backgroundColor: !daySettings.isOpen ? '#fee2e2' : (closedHours.length > 0 ? '#fef3c7' : `${facilityTypes.find(f => f.value === selectedFacility)?.color}20`),
                          borderColor: !daySettings.isOpen ? '#fca5a5' : (closedHours.length > 0 ? '#fbbf24' : `${facilityTypes.find(f => f.value === selectedFacility)?.color}40`)
                        }}
                      >
                        <p className="font-bold text-sm mb-1">{day.label}</p>
                        {!daySettings.isOpen ? (
                          <Badge variant="destructive" className="text-xs">Kapalı</Badge>
                        ) : closedHours.length > 0 ? (
                          <Badge variant="warning" className="text-xs">{closedHours.length} Saat</Badge>
                        ) : (
                          <Badge style={{ backgroundColor: facilityTypes.find(f => f.value === selectedFacility)?.color, color: 'white' }} className="text-xs">24 Saat</Badge>
                        )}
                        {closedHours.length > 0 && daySettings.isOpen && (
                          <p className="text-xs text-gray-500 mt-1">
                            {closedHours.slice(0, 3).map(h => `${h}:00`).join(', ')}
                            {closedHours.length > 3 && '...'}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: `${facilityTypes.find(f => f.value === selectedFacility)?.color}40` }}></div>
                    <span>Açık</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-200"></div>
                    <span>Kısmi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-200"></div>
                    <span>Kapalı</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: facilityTypes.find(f => f.value === selectedFacility)?.color + '20' }}>
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
          <CardDescription>
            Boş saatlere tıklayın, onaylayın ve hızlıca rezervasyon oluşturun! ⚡
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            initialDate={new Date()}
            locale={trLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "timeGridWeek,timeGridDay",
            }}
            buttonText={{
              today: "Bugün",
              week: "Hafta",
              day: "Gün",
            }}
            events={allEvents}
            validRange={{
              start: new Date().toISOString().split('T')[0]
            }}
            selectConstraint={{
              start: new Date(),
              end: '2100-01-01'
            }}
            selectAllow={(selectInfo) => {
              const now = new Date();
              return selectInfo.start >= now;
            }}
            dateClick={handleDateClick}
            eventClick={(info) => {
              // Kapalı slot'a tıklanırsa uyarı göster
              if (info.event.extendedProps.isClosed) {
                showToast("Bu saat dilimi kapalı - rezervasyon yapılamaz ❌", "error");
                return;
              }
              
              const reservationId = info.event.extendedProps.reservationId;
              const facilityType = info.event.extendedProps.facilityType;
              const isMyReservation = info.event.extendedProps.isMyReservation;
              
              if (!isMyReservation) {
                showToast("Bu saat dolu - başka bir kullanıcı tarafından rezerve edilmiş ⏰", "error");
                return;
              }
              
              if (confirm(`${facilityType} - ${info.event.title}\n\nBu rezervasyonu silmek ister misiniz?`)) {
                handleDeleteReservation(reservationId);
              }
            }}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="01:00:00"
            slotLabelInterval="01:00"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            allDaySlot={false}
            height="700px"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            nowIndicator={true}
            firstDay={new Date().getDay()}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Rezervasyonlarım ({filteredMyReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMyReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Henüz rezervasyonunuz yok</p>
              <p className="text-sm text-gray-400 mt-2">Yukarıdaki takvimden rezervasyon oluşturabilirsiniz</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyReservations.map((reservation) => {
                const facility = facilityTypes.find(f => f.value === reservation.facilityType);
                return (
                  <div
                    key={reservation._id}
                    className="flex items-center justify-between p-5 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden relative"
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
                      <div className="flex-1">
                        <p className="font-bold text-xl mb-1" style={{ color: facility?.color }}>{reservation.title}</p>
                        <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: facility?.color, opacity: 0.8 }}>
                          {reservation.facilityType}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-4 w-4" />
                          {new Date(reservation.startTime).toLocaleString("tr-TR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {" - "}
                          {new Date(reservation.endTime).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                      <Badge
                        className="font-semibold"
                        variant={
                          reservation.status === "approved"
                            ? "success"
                            : reservation.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {reservation.status === "approved"
                          ? "✓ Onaylandı"
                          : reservation.status === "pending"
                          ? "⏳ Bekliyor"
                          : "✕ İptal"}
                      </Badge>
                      <Button
                        size="sm"
                        className="font-semibold shadow-md hover:shadow-lg"
                        style={{ 
                          backgroundColor: facility?.color,
                          color: 'white'
                        }}
                        onClick={() => handleDeleteReservation(reservation._id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Sil
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
      {ToastComponent}
    </div>
  );
}



