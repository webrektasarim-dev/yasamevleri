"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Building2, CreditCard, Calendar } from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dues, setDues] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    if ((session?.user as any)?.apartmentId) {
      fetchDues();
      fetchReservations();
    }
  }, [session]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data.slice(0, 5));
      }
    } catch (error) {
      // Error fetching announcements
    }
  };

  const fetchDues = async () => {
    try {
      const apartmentId = (session?.user as any)?.apartmentId;
      const response = await fetch(`/api/dues?apartmentId=${apartmentId}`);
      const data = await response.json();
      if (data.success) {
        setDues(data.data);
      }
    } catch (error) {
      // Error fetching dues
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      const data = await response.json();
      if (data.success) {
        setReservations(data.data.slice(0, 3));
      }
    } catch (error) {
      // Error fetching reservations
    }
  };

  const unpaidDues = dues.filter((d) => d.status !== "paid");
  const totalDebt = unpaidDues.reduce(
    (sum, d) => sum + (d.amount - d.paidAmount),
    0
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
        Hoş Geldiniz, {session?.user?.name}
      </h1>
        <p className="text-zinc-600 mt-1">Hesap özeti ve son işlemler</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Toplam Borç</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">
              {formatCurrency(totalDebt)}
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              {unpaidDues.length} ödenmemiş aidat
            </p>
            <Link href="/dashboard/dues">
              <Button variant="link" className="px-0 mt-2 text-zinc-600 hover:text-zinc-900 font-medium">
                Detayları Gör →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Rezervasyonlarım</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">{reservations.length}</div>
            <p className="text-sm text-zinc-600 mt-1">
              Aktif rezervasyon
            </p>
            <Link href="/dashboard/reservations">
              <Button variant="link" className="px-0 mt-2 text-zinc-600 hover:text-zinc-900 font-medium">
                Tümünü Gör →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Dairem</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900">
              {(session?.user as any)?.apartmentId ? "Kayıtlı" : "Atanmamış"}
            </div>
            <p className="text-sm text-zinc-600 mt-1">
              Daire bilgileri
            </p>
            <Link href="/dashboard/apartment">
              <Button variant="link" className="px-0 mt-2 text-zinc-600 hover:text-zinc-900 font-medium">
                Detayları Gör →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              Son Duyurular
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-zinc-500">Henüz duyuru yok</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className={`p-4 rounded-lg border transition-all hover:border-zinc-300 ${
                      announcement.priority === "urgent"
                        ? "bg-red-50 border-red-200"
                        : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        announcement.priority === "urgent"
                          ? "bg-red-100"
                          : "bg-zinc-200"
                      }`}>
                        {announcement.priority === "urgent" ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Bell className="h-5 w-5 text-zinc-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-zinc-900">{announcement.title}</h3>
                          {announcement.priority === "urgent" && (
                            <Badge variant="destructive">Acil</Badge>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mb-2">
                          {formatDateTime(announcement.publishDate)}
                        </p>
                        <p className="text-sm text-zinc-700 line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              Yaklaşan Ödemeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unpaidDues.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Tüm ödemeleriniz tamamlandı
              </p>
            ) : (
              <div className="space-y-3">
                {unpaidDues.slice(0, 5).map((due) => (
                  <div
                    key={due._id}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-all bg-white"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {new Date(2024, due.period.month - 1).toLocaleDateString("tr-TR", {
                          month: "long",
                        })}{" "}
                        {due.period.year}
                      </p>
                      <p className="text-sm text-zinc-600 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateTime(due.dueDate).split(" ")[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-zinc-900">
                        {formatCurrency(due.amount - due.paidAmount)}
                      </p>
                      <Badge
                        variant={due.status === "partial" ? "warning" : "destructive"}
                        className="mt-1"
                      >
                        {due.status === "partial" ? "Kısmi" : "Ödenmedi"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
