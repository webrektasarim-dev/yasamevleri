"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { FileText, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DuesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dues, setDues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDues, setSelectedDues] = useState<any>(null);

  useEffect(() => {
    if (session && (session.user as any)?.apartmentId) {
      fetchDues();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchDues = async () => {
    try {
      const apartmentId = (session?.user as any)?.apartmentId;
      const response = await fetch(`/api/dues?apartmentId=${apartmentId}`);
      const data = await response.json();

      if (data.success) {
        setDues(data.data);
      }
    } catch (error) {
      console.error("Dues fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Ödendi</Badge>;
      case "partial":
        return <Badge variant="warning">Kısmi Ödendi</Badge>;
      case "unpaid":
        return <Badge variant="destructive">Ödenmedi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePayment = (due: any) => {
    router.push(`/dashboard/payment?duesId=${due._id}`);
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!(session?.user as any)?.apartmentId) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Aidat Bilgileri</h1>
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
      <h1 className="text-3xl font-bold mb-6">Aidat Bilgileri</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                dues
                  .filter((d) => d.status !== "paid")
                  .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ödenen Aidat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dues.filter((d) => d.status === "paid").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Bekleyen Aidat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dues.filter((d) => d.status !== "paid").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aidat Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dönem</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Ödenen</TableHead>
                <TableHead>Kalan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Tarih</TableHead>
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dues.map((due) => (
                <TableRow key={due._id}>
                  <TableCell>
                    {new Date(2024, due.period.month - 1).toLocaleDateString("tr-TR", {
                      month: "long",
                    })}{" "}
                    {due.period.year}
                  </TableCell>
                  <TableCell>{formatCurrency(due.amount)}</TableCell>
                  <TableCell>{formatCurrency(due.paidAmount)}</TableCell>
                  <TableCell>
                    {formatCurrency(due.amount - due.paidAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(due.status)}</TableCell>
                  <TableCell>{formatDate(due.dueDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedDues(due)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {due.status !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() => handlePayment(due)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Öde
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedDues && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Aidat Dökümü</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Yönetim:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.management)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Elektrik:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.electricity)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Su:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.water)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Doğalgaz:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.naturalGas)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Temizlik:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.cleaning)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Bakım:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.maintenance)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-secondary rounded">
                <span>Diğer:</span>
                <span className="font-semibold">
                  {formatCurrency(selectedDues.breakdown.other)}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-primary text-primary-foreground rounded font-bold">
                <span>Toplam:</span>
                <span>{formatCurrency(selectedDues.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







