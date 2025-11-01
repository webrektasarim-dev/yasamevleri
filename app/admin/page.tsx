"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Users, CreditCard, TrendingUp, Calendar, Bell, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      // Error fetching stats
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-zinc-600 mt-1">Sistem genel görünümü</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Toplam Daire</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 mb-2">{stats?.totalApartments || 0}</div>
            <Link href="/admin/apartments">
              <Button variant="link" className="px-0 h-auto text-sm text-zinc-600 hover:text-zinc-900 font-medium">
                Yönet →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Toplam Kullanıcı</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 mb-2">{stats?.totalUsers || 0}</div>
            <Link href="/admin/users">
              <Button variant="link" className="px-0 h-auto text-sm text-zinc-600 hover:text-zinc-900 font-medium">
                Yönet →
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Aylık Tahsilat</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 mb-1">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-sm text-zinc-600">
              Bu ay toplanan
            </p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 hover:border-zinc-300 transition-all bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Bekleyen Aidat</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-zinc-900 mb-1">
              {formatCurrency(stats?.pendingDues || 0)}
            </div>
            <p className="text-sm text-zinc-600">
              Toplanmayı bekliyor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-zinc-900">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              Tahsilat Oranı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                <span className="text-sm font-medium text-zinc-600">Toplam Aidat:</span>
                <span className="font-semibold text-zinc-900">{formatCurrency(stats?.totalDues || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg">
                <span className="text-sm font-medium text-zinc-600">Toplanan:</span>
                <span className="font-semibold text-zinc-900">
                  {formatCurrency(stats?.collectedDues || 0)}
                </span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-2 mt-4">
                <div
                  className="bg-zinc-900 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.collectionRate || 0}%` }}
                ></div>
              </div>
              <p className="text-center text-lg font-bold text-zinc-900 mt-3">
                %{stats?.collectionRate?.toFixed(1) || 0} tahsil edildi
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold text-zinc-900">Bekleyen Rezervasyonlar</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-zinc-900 mb-4">
              {stats?.pendingReservations || 0}
            </div>
            <p className="text-sm text-zinc-600 mb-4">
              rezervasyon onay bekliyor
            </p>
            <Link href="/admin/reservations">
              <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                Rezervasyonları Yönet
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg text-zinc-900">Hızlı İşlemler</CardTitle>
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/dues">
              <Button variant="outline" className="w-full justify-start border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                <CreditCard className="h-4 w-4 mr-2" />
                Aidat Oluştur
              </Button>
            </Link>
            <Link href="/admin/announcements">
              <Button variant="outline" className="w-full justify-start border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                <Bell className="h-4 w-4 mr-2" />
                Duyuru Yayınla
              </Button>
            </Link>
            <Link href="/admin/apartments">
              <Button variant="outline" className="w-full justify-start border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                <Building2 className="h-4 w-4 mr-2" />
                Yeni Daire Ekle
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button variant="outline" className="w-full justify-start border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                <BarChart3 className="h-4 w-4 mr-2" />
                Raporları Görüntüle
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
