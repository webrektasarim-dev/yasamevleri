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
      console.error("Apartment fetch error:", error);
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

        {apartment.residents && apartment.residents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sakinler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {apartment.residents.map((resident: any) => (
                  <li key={resident._id} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {resident.firstName[0]}
                        {resident.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {resident.firstName} {resident.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {resident.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}






