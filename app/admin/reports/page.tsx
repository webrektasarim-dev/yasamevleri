"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [dues, setDues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, duesRes] = await Promise.all([
        fetch("/api/admin/payments"),
        fetch("/api/dues"),
      ]);

      const paymentsData = await paymentsRes.json();
      const duesData = await duesRes.json();

      if (paymentsData.success) setPayments(paymentsData.data || []);
      if (duesData.success) setDues(duesData.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = dues
    .filter((d) => d.status !== "paid")
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const paidDuesCount = dues.filter((d) => d.status === "paid").length;
  const unpaidDuesCount = dues.filter((d) => d.status === "unpaid").length;

  // Group payments by month
  const paymentsByMonth: { [key: string]: number } = {};
  payments
    .filter((p) => p.status === "success")
    .forEach((payment) => {
      const date = new Date(payment.paymentDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      paymentsByMonth[monthKey] = (paymentsByMonth[monthKey] || 0) + payment.amount;
    });

  const monthlyData = Object.entries(paymentsByMonth)
    .sort()
    .slice(-6)
    .map(([month, amount]) => ({
      month: new Date(month + "-01").toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      }),
      amount,
    }));

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Raporlar ve İstatistikler</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tahsilat</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.filter((p) => p.status === "success").length} ödeme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Tahsilat</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaidDuesCount} ödenmemiş aidat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ödeme Oranı</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              %
              {dues.length > 0
                ? ((paidDuesCount / dues.length) * 100).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paidDuesCount} / {dues.length} aidat ödendi
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Aylık Tahsilat Grafiği</CardTitle>
          <CardDescription>Son 6 aylık tahsilat trendi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((item, index) => {
              const maxAmount = Math.max(...monthlyData.map((d) => d.amount));
              const percentage = (item.amount / maxAmount) * 100;

              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{item.month}</span>
                    <span className="text-sm font-bold">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Son Ödemeler</CardTitle>
          <CardDescription>En son alınan ödemeler</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Aidat Dönemi</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.slice(0, 10).map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>
                    {payment.userId?.firstName} {payment.userId?.lastName}
                  </TableCell>
                  <TableCell>
                    {payment.duesId?.period?.month &&
                      `${new Date(
                        2024,
                        payment.duesId.period.month - 1
                      ).toLocaleDateString("tr-TR", {
                        month: "long",
                      })} ${payment.duesId.period.year}`}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "success"
                          ? "success"
                          : payment.status === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {payment.status === "success"
                        ? "Başarılı"
                        : payment.status === "failed"
                        ? "Başarısız"
                        : "Bekliyor"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}






