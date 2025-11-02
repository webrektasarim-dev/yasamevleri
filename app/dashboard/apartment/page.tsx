"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, MapPin, Car, Users } from "lucide-react";

export default function ApartmentPage() {
  const { data: session } = useSession();
  const [apartment, setApartment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session && (session.user as any)?.apartmentId) {
      fetchApartment();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchApartment = async () => {
    try {
      const apartmentId = (session?.user as any)?.apartmentId;
      const response = await fetch(`/api/apartments/${apartmentId}`);
      const data = await response.json();

      if (data.success) {
        setApartment(data.data);
      }
    } catch (error) {
      // Error handled
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!apartment) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Daire Bilgileri</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Henüz bir daireye atanmamışsınız. Lütfen site yönetimiyle iletişime geçin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Daire Bilgileri</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Daire Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Blok Numarası</p>
                <p className="text-lg font-semibold">{apartment.blockNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daire Numarası</p>
                <p className="text-lg font-semibold">{apartment.apartmentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kat</p>
                <p className="text-lg font-semibold">{apartment.floor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metrekare</p>
                <p className="text-lg font-semibold">{apartment.squareMeters} m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {apartment.parkingSpot?.spotNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Otopark Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Otopark Yeri</p>
                <p className="text-lg font-semibold">
                  {apartment.parkingSpot.spotNumber}
                </p>
              </div>
              {apartment.parkingSpot.licensePlate && (
                <div>
                  <p className="text-sm text-muted-foreground">Araç Plakası</p>
                  <p className="text-lg font-semibold">
                    {apartment.parkingSpot.licensePlate}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sakinler
              {apartment.residents && apartment.residents.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({apartment.residents.length} kişi)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {apartment.residents && apartment.residents.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {apartment.residents.map((resident: any) => (
                  <div key={resident._id || resident.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {resident.firstName?.[0]?.toUpperCase() || 'U'}
                        {resident.lastName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {resident.firstName || 'İsimsiz'} {resident.lastName || 'Kullanıcı'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {resident.email || 'Email yok'}
                      </p>
                      {resident.phone && (
                        <p className="text-xs text-muted-foreground truncate">
                          {resident.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Bu dairede henüz kayıtlı sakin bulunmuyor.</p>
                <p className="text-sm mt-1">Yönetici tarafından daire ataması yapıldığında burada görünecektir.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}







