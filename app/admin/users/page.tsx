"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
import { useToast } from "@/components/ui/toast";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    migrateUsers();
    fetchUsers();
    fetchApartments();
  }, []);

  const migrateUsers = async () => {
    try {
      await fetch("/api/admin/migrate-users", {
        method: "POST",
      });
    } catch (error) {
      // Migration failed, continue anyway
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      showToast("Kullanıcılar yüklenemedi", "error");
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
      // Error fetching apartments
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Kullanıcı güncellendi", "success");
        setEditingUser(null);
        fetchUsers();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        showToast("Kullanıcı silindi", "success");
        fetchUsers();
      } else {
        showToast(data.error, "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await handleUpdateUser(userId, { role: newRole });
  };

  const handleApartmentChange = async (userId: string, apartmentId: string) => {
    await handleUpdateUser(userId, { apartmentId: apartmentId || null });
  };

  const handleApprovalToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          newStatus ? "Kullanıcı onaylandı ✓" : "Kullanıcı onayı kaldırıldı",
          "success"
        );
        
        // Veritabanından yeniden yükle
        await fetchUsers();
      } else {
        showToast(data.error || "Güncelleme başarısız", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Daire</TableHead>
                <TableHead>Onay Durumu</TableHead>
                <TableHead>Doğrulama</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="w-32"
                    >
                      <option value="user">Kullanıcı</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.apartmentId?._id || ""}
                      onChange={(e) =>
                        handleApartmentChange(user._id, e.target.value)
                      }
                      className="w-40"
                    >
                      <option value="">Daire Seçin</option>
                      {apartments.map((apt) => (
                        <option key={apt._id} value={apt._id}>
                          Blok {apt.blockNumber} - {apt.apartmentNumber}
                        </option>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge variant="default" className="bg-purple-600">
                        Admin
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={Boolean(user.isApproved) ? "default" : "outline"}
                        onClick={() => handleApprovalToggle(user._id, Boolean(user.isApproved))}
                        className={Boolean(user.isApproved) ? "bg-green-600 hover:bg-green-700" : "border-orange-500 text-orange-600 hover:bg-orange-50"}
                      >
                        {Boolean(user.isApproved) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Onaylı
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Onayla
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.isEmailVerified ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Email
                        </Badge>
                      )}
                      {user.isPhoneVerified ? (
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Telefon
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Telefon
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteUser(user._id)}
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







