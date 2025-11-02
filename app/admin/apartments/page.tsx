"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/components/ui/toast";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function ApartmentsPage() {
  const [apartments, setApartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    blockNumber: "",
    apartmentNumber: "",
    floor: "",
    squareMeters: "",
    parkingSpot: { spotNumber: "", licensePlate: "" },
    duesCoefficient: "1",
  });
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await fetch("/api/apartments");
      const data = await response.json();

      if (data.success) {
        setApartments(data.data);
      }
    } catch (error) {
      showToast("Daireler yüklenemedi", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId ? `/api/apartments/${editingId}` : "/api/apartments";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockNumber: parseInt(formData.blockNumber),
          apartmentNumber: formData.apartmentNumber,
          floor: parseInt(formData.floor),
          squareMeters: parseInt(formData.squareMeters),
          parkingSpot: formData.parkingSpot.spotNumber ? formData.parkingSpot : undefined,
          duesCoefficient: parseFloat(formData.duesCoefficient),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || "İşlem başarılı", "success");
        setShowForm(false);
        resetForm();
        fetchApartments();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const handleEdit = (apartment: any) => {
    setEditingId(apartment._id);
    setFormData({
      blockNumber: apartment.blockNumber.toString(),
      apartmentNumber: apartment.apartmentNumber,
      floor: apartment.floor.toString(),
      squareMeters: apartment.squareMeters.toString(),
      parkingSpot: apartment.parkingSpot || { spotNumber: "", licensePlate: "" },
      duesCoefficient: apartment.duesCoefficient.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu daireyi silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/apartments/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Daire silindi", "success");
        fetchApartments();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      blockNumber: "",
      apartmentNumber: "",
      floor: "",
      squareMeters: "",
      parkingSpot: { spotNumber: "", licensePlate: "" },
      duesCoefficient: "1",
    });
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daire Yönetimi</h1>
        <Button onClick={() => { setShowForm(!showForm); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Daire
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Daire Düzenle" : "Yeni Daire"}</CardTitle>
            <CardDescription>
              Daire bilgilerini girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blockNumber">Blok Numarası (1-46)</Label>
                  <Input
                    id="blockNumber"
                    type="number"
                    min="1"
                    max="46"
                    value={formData.blockNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, blockNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartmentNumber">Daire No</Label>
                  <Input
                    id="apartmentNumber"
                    type="text"
                    value={formData.apartmentNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, apartmentNumber: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Kat</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squareMeters">Metrekare</Label>
                  <Input
                    id="squareMeters"
                    type="number"
                    value={formData.squareMeters}
                    onChange={(e) =>
                      setFormData({ ...formData, squareMeters: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spotNumber">Otopark Yeri No</Label>
                  <Input
                    id="spotNumber"
                    type="text"
                    value={formData.parkingSpot.spotNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parkingSpot: { ...formData.parkingSpot, spotNumber: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Araç Plakası</Label>
                  <Input
                    id="licensePlate"
                    type="text"
                    value={formData.parkingSpot.licensePlate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        parkingSpot: { ...formData.parkingSpot, licensePlate: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duesCoefficient">Aidat Katsayısı</Label>
                  <Input
                    id="duesCoefficient"
                    type="number"
                    step="0.1"
                    value={formData.duesCoefficient}
                    onChange={(e) =>
                      setFormData({ ...formData, duesCoefficient: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Kaydet</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); resetForm(); }}
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
          <CardTitle>Daireler ({apartments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Blok</TableHead>
                <TableHead>Daire No</TableHead>
                <TableHead>Kat</TableHead>
                <TableHead>m²</TableHead>
                <TableHead>Otopark</TableHead>
                <TableHead className="min-w-[200px]">Sakinler</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apartments.map((apartment) => (
                <TableRow key={apartment._id}>
                  <TableCell>{apartment.blockNumber}</TableCell>
                  <TableCell>{apartment.apartmentNumber}</TableCell>
                  <TableCell>{apartment.floor}</TableCell>
                  <TableCell>{apartment.squareMeters}</TableCell>
                  <TableCell>
                    {apartment.parkingSpot?.spotNumber || "-"}
                  </TableCell>
                  <TableCell>
                    {apartment.residents && apartment.residents.length > 0 ? (
                      <div className="text-sm">
                        {apartment.residents.map((resident: any, index: number) => (
                          <span key={resident._id || index}>
                            <span className="font-medium text-zinc-900">
                              {resident.firstName} {resident.lastName}
                            </span>
                            {index < apartment.residents.length - 1 && (
                              <span className="text-zinc-400">, </span>
                            )}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-sm">Boş</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(apartment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(apartment._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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







