"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DuesPage() {
  const [dues, setDues] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [createForAll, setCreateForAll] = useState(true);
  const [formData, setFormData] = useState({
    apartmentId: "",
    period: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    dueDate: "",
    breakdown: {
      management: 0,
      electricity: 0,
      water: 0,
      naturalGas: 0,
      cleaning: 0,
      maintenance: 0,
      other: 0,
    },
  });
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchDues();
    fetchApartments();
  }, []);

  const fetchDues = async () => {
    try {
      const response = await fetch("/api/dues");
      const data = await response.json();

      if (data.success) {
        setDues(data.data);
      }
    } catch (error) {
      showToast("Aidatlar yüklenemedi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const response = await fetch("/api/apartments");
      const data = await response.json();

      if (data.success) {
        setApartments(data.data);
      }
    } catch (error) {
      console.error("Apartments fetch error:", error);
    }
  };

  const calculateTotal = () => {
    return Object.values(formData.breakdown).reduce((sum: number, val: number) => sum + val, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const totalAmount = calculateTotal();

      const response = await fetch("/api/dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createForAll,
          amount: totalAmount,
          status: "unpaid",
          paidAmount: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || "Aidat oluşturuldu", "success");
        setShowForm(false);
        fetchDues();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu aidatı silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/dues/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Aidat silindi", "success");
        fetchDues();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Ödendi</Badge>;
      case "partial":
        return <Badge variant="warning">Kısmi</Badge>;
      case "unpaid":
        return <Badge variant="destructive">Ödenmedi</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Aidat Yönetimi</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Aidat
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Yeni Aidat Oluştur</CardTitle>
            <CardDescription>
              Aidat bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="createForAll"
                  checked={createForAll}
                  onChange={(e) => setCreateForAll(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="createForAll">
                  Tüm daireler için oluştur
                </Label>
              </div>

              {!createForAll && (
                <div className="space-y-2">
                  <Label htmlFor="apartmentId">Daire</Label>
                  <Select
                    id="apartmentId"
                    value={formData.apartmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, apartmentId: e.target.value })
                    }
                    required={!createForAll}
                  >
                    <option value="">Daire Seçin</option>
                    {apartments.map((apt) => (
                      <option key={apt._id} value={apt._id}>
                        Blok {apt.blockNumber} - Daire {apt.apartmentNumber}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Ay</Label>
                  <Select
                    id="month"
                    value={formData.period.month.toString()}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period: { ...formData.period, month: parseInt(e.target.value) },
                      })
                    }
                    required
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2024, i).toLocaleDateString("tr-TR", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Yıl</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.period.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period: { ...formData.period, year: parseInt(e.target.value) },
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Son Ödeme Tarihi</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Aidat Dökümü</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="management">Yönetim (₺)</Label>
                    <Input
                      id="management"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.management}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            management: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="electricity">Elektrik (₺)</Label>
                    <Input
                      id="electricity"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.electricity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            electricity: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water">Su (₺)</Label>
                    <Input
                      id="water"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.water}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            water: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="naturalGas">Doğalgaz (₺)</Label>
                    <Input
                      id="naturalGas"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.naturalGas}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            naturalGas: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cleaning">Temizlik (₺)</Label>
                    <Input
                      id="cleaning"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.cleaning}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            cleaning: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance">Bakım (₺)</Label>
                    <Input
                      id="maintenance"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.maintenance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            maintenance: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other">Diğer (₺)</Label>
                    <Input
                      id="other"
                      type="number"
                      step="0.01"
                      value={formData.breakdown.other}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          breakdown: {
                            ...formData.breakdown,
                            other: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <p className="text-lg font-semibold">
                    Toplam: {formatCurrency(calculateTotal())}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Oluştur</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Aidatlar ({dues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Daire</TableHead>
                <TableHead>Dönem</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Ödenen</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dues.map((due) => (
                <TableRow key={due._id}>
                  <TableCell>
                    Blok {due.apartmentId?.blockNumber} - {due.apartmentId?.apartmentNumber}
                  </TableCell>
                  <TableCell>
                    {new Date(2024, due.period.month - 1).toLocaleDateString("tr-TR", {
                      month: "long",
                    })}{" "}
                    {due.period.year}
                  </TableCell>
                  <TableCell>{formatCurrency(due.amount)}</TableCell>
                  <TableCell>{formatCurrency(due.paidAmount)}</TableCell>
                  <TableCell>{getStatusBadge(due.status)}</TableCell>
                  <TableCell>{formatDate(due.dueDate)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(due._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {ToastComponent}
    </div>
  );
}






