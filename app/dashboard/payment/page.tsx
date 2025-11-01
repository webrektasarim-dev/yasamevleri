"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { CreditCard, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PaymentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const duesId = searchParams.get("duesId");
  const { showToast, ToastComponent } = useToast();

  const [dues, setDues] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardData, setCardData] = useState({
    cardHolderName: "",
    cardNumber: "",
    expireMonth: "",
    expireYear: "",
    cvc: "",
  });
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    if (duesId) {
      fetchDues();
    } else {
      setIsLoading(false);
    }
  }, [duesId]);

  const fetchDues = async () => {
    try {
      const response = await fetch(`/api/dues/${duesId}`);
      const data = await response.json();

      if (data.success) {
        setDues(data.data);
        setPaymentAmount((data.data.amount - data.data.paidAmount).toString());
      } else {
        showToast("Aidat bulunamadı", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const amount = parseFloat(paymentAmount);

      if (amount <= 0 || amount > dues.amount - dues.paidAmount) {
        showToast("Geçersiz tutar", "error");
        setIsProcessing(false);
        return;
      }

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duesId,
          amount,
          cardData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentSuccess(true);
        showToast("Ödeme başarılı!", "success");
        setTimeout(() => {
          router.push("/dashboard/dues");
        }, 3000);
      } else {
        showToast(data.error || "Ödeme başarısız", "error");
      }
    } catch (error) {
      showToast("Bir hata oluştu", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  if (!duesId || !dues) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Ödeme</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Geçersiz aidat seçimi. Lütfen aidat sayfasından ödeme yapın.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard/dues")}>
              Aidat Sayfasına Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ödeme Başarılı!</h2>
            <p className="text-muted-foreground mb-4">
              {formatCurrency(parseFloat(paymentAmount))} tutarındaki ödemeniz alınmıştır.
            </p>
            <p className="text-sm text-muted-foreground">
              Aidat sayfasına yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingAmount = dues.amount - dues.paidAmount;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Aidat Ödemesi</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dönem:</span>
                <span className="font-semibold">
                  {new Date(2024, dues.period.month - 1).toLocaleDateString("tr-TR", {
                    month: "long",
                  })}{" "}
                  {dues.period.year}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Tutar:</span>
                <span className="font-semibold">{formatCurrency(dues.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödenen:</span>
                <span className="font-semibold">{formatCurrency(dues.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Kalan Tutar:</span>
                <span className="font-bold text-primary">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Kart Bilgileri
            </CardTitle>
            <CardDescription>
              Güvenli ödeme için kart bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Ödenecek Tutar (₺)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Kart Sahibinin Adı</Label>
                <Input
                  id="cardHolderName"
                  type="text"
                  placeholder="AD SOYAD"
                  value={cardData.cardHolderName}
                  onChange={(e) =>
                    setCardData({ ...cardData, cardHolderName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Kart Numarası</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={cardData.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                    setCardData({ ...cardData, cardNumber: value });
                  }}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expireMonth">Ay</Label>
                  <Input
                    id="expireMonth"
                    type="text"
                    placeholder="MM"
                    maxLength={2}
                    value={cardData.expireMonth}
                    onChange={(e) =>
                      setCardData({ ...cardData, expireMonth: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expireYear">Yıl</Label>
                  <Input
                    id="expireYear"
                    type="text"
                    placeholder="YY"
                    maxLength={2}
                    value={cardData.expireYear}
                    onChange={(e) =>
                      setCardData({ ...cardData, expireYear: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    value={cardData.cvc}
                    onChange={(e) =>
                      setCardData({ ...cardData, cvc: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={isProcessing}>
                  {isProcessing ? "İşleniyor..." : `${formatCurrency(parseFloat(paymentAmount || "0"))} Öde`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/dues")}
                >
                  İptal
                </Button>
              </div>

              <div className="text-xs text-muted-foreground text-center mt-4">
                Ödemeniz iyzico güvencesi altında işlenmektedir.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {ToastComponent}
    </div>
  );
}






