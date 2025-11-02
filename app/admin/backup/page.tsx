"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { 
  Download, 
  Upload, 
  Database, 
  AlertTriangle,
  CheckCircle2,
  FileJson,
  RefreshCw,
  Info,
  ArrowLeft,
  Trash2
} from "lucide-react";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importResults, setImportResults] = useState<any>(null);
  const [clearResults, setClearResults] = useState<any>(null);
  const [confirmText, setConfirmText] = useState("");
  const { showToast, ToastComponent } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/backup/export');
      
      if (!response.ok) {
        throw new Error('Yedekleme başarısız');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `backup-${Date.now()}.json`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Yedekleme başarıyla indirildi! ✅', 'success');
    } catch (error) {
      showToast('Yedekleme başarısız oldu', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        showToast('Lütfen geçerli bir JSON dosyası seçin', 'error');
        return;
      }
      setSelectedFile(file);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('Lütfen bir yedek dosyası seçin', 'error');
      return;
    }

    const confirmMessage = importMode === 'replace'
      ? 'UYARI: Mevcut tüm veriler silinecek ve yedekle değiştirilecek! Devam etmek istediğinize emin misiniz?'
      : 'Yedek veriler mevcut verilerle birleştirilecek. Devam etmek istiyor musunuz?';

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsImporting(true);
    try {
      // Read file
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      // Send to API
      const response = await fetch('/api/admin/backup/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: backupData.data,
          mode: importMode,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setImportResults(result.data);
        showToast('Yedek başarıyla geri yüklendi! ✅', 'success');
        setSelectedFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('backup-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      showToast(error.message || 'Yedek geri yüklenemedi', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (confirmText !== "TEMİZLE") {
      showToast('Lütfen "TEMİZLE" yazarak onaylayın', 'error');
      return;
    }

    const finalConfirm = confirm(
      '⚠️ SON UYARI ⚠️\n\n' +
      'Tüm test verileri silinecek!\n' +
      '- Tüm kullanıcılar (admin hariç)\n' +
      '- Tüm daireler\n' +
      '- Tüm aidatlar\n' +
      '- Tüm ödemeler\n' +
      '- Tüm rezervasyonlar\n' +
      '- Tüm duyurular\n\n' +
      'Bu işlem GERİ ALINMAZ!\n\n' +
      'Devam etmek istediğinize EMİN MİSİNİZ?'
    );

    if (!finalConfirm) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/admin/clear-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmText }),
      });

      const result = await response.json();

      if (result.success) {
        setClearResults(result.data);
        setConfirmText("");
        showToast('Veritabanı başarıyla temizlendi! ✅', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      showToast(error.message || 'Veritabanı temizlenemedi', 'error');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ayarlara Dön
            </Button>
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Yedekleme</h1>
        <p className="text-sm md:text-base text-zinc-600 mt-1">
          Veritabanını yedekleyin ve geri yükleyin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Backup */}
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <Download className="h-5 w-5 text-green-600" />
              Yedek Oluştur
            </CardTitle>
            <CardDescription>
              Tüm veritabanını JSON dosyası olarak indirin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Yedekleme şunları içerir:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800">
                    <li>Tüm kullanıcılar</li>
                    <li>Daireler</li>
                    <li>Aidatlar</li>
                    <li>Ödemeler</li>
                    <li>Rezervasyonlar</li>
                    <li>Duyurular</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Yedekleniyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Yedek İndir
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Import Backup */}
        <Card className="border border-zinc-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900">
              <Upload className="h-5 w-5 text-orange-600" />
              Yedek Geri Yükle
            </CardTitle>
            <CardDescription>
              Önceden oluşturulmuş yedeği geri yükleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-medium mb-1">Dikkat!</p>
                    <p className="text-red-800">
                      &quot;Değiştir&quot; modu mevcut tüm verileri silecektir. 
                      İşleme başlamadan önce mutlaka mevcut veritabanının yedeğini alın!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Duplicate Kontrolü</p>
                    <p className="text-blue-800">
                      Mevcut kayıtlarla çakışan veriler (aynı email, telefon veya daire numarası) 
                      otomatik olarak atlanır ve import edilmez.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-file" className="text-zinc-700">
                Yedek Dosyası Seçin
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="flex-1 text-sm text-zinc-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                />
                {selectedFile && (
                  <FileJson className="h-5 w-5 text-green-600" />
                )}
              </div>
              {selectedFile && (
                <p className="text-xs text-zinc-600">
                  Seçili: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-700">Geri Yükleme Modu</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportMode('replace')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    importMode === 'replace'
                      ? 'border-red-500 bg-red-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-900">Değiştir</div>
                  <div className="text-xs text-zinc-600 mt-1">Mevcut verileri sil</div>
                </button>
                <button
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                    importMode === 'merge'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-sm font-medium text-zinc-900">Birleştir</div>
                  <div className="text-xs text-zinc-600 mt-1">Mevcut verileri koru</div>
                </button>
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={isImporting || !selectedFile}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Geri Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Geri Yükle
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Clear Database */}
      <Card className="border border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Trash2 className="h-5 w-5" />
            Test Verilerini Temizle
          </CardTitle>
          <CardDescription className="text-red-800">
            Tüm test verilerini veritabanından kalıcı olarak silin (Admin kullanıcı korunur)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <p className="font-bold mb-2 text-base">⚠️ TEHLİKELİ İŞLEM ⚠️</p>
                <p className="mb-2">Bu işlem aşağıdaki verileri <span className="font-bold">KALICI OLARAK SİLER</span>:</p>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Tüm kullanıcılar (admin hariç)</li>
                  <li>Tüm daireler</li>
                  <li>Tüm aidatlar ve ödemeler</li>
                  <li>Tüm rezervasyonlar</li>
                  <li>Tüm duyurular</li>
                  <li>SMS doğrulama kayıtları</li>
                </ul>
                <p className="mt-2 font-bold">Bu işlem GERİ ALINAMAZ!</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-zinc-700">
              Onaylamak için <span className="font-bold text-red-600">&quot;TEMİZLE&quot;</span> yazın
            </Label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="TEMİZLE"
              className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <Button
            onClick={handleClearDatabase}
            disabled={isClearing || confirmText !== "TEMİZLE"}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Temizleniyor...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Veritabanını Temizle
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Clear Results */}
      {clearResults && (
        <Card className="border border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Temizleme Başarılı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(clearResults).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-2xl font-bold text-red-600">{value as number}</div>
                  <div className="text-xs text-zinc-600 capitalize">{key} silindi</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card className="mt-6 border border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Geri Yükleme Başarılı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(importResults).map(([key, value]) => (
                <div key={key} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{value as number}</div>
                  <div className="text-xs text-zinc-600 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-6 border border-zinc-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-900">
            <Database className="h-5 w-5" />
            Yedekleme Hakkında
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <div>
            <p className="font-medium text-zinc-900 mb-1">🔄 Yedekleme Sıklığı</p>
            <p>Düzenli olarak (günlük veya haftalık) yedekleme yapmanız önerilir.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 mb-1">💾 Yedek Saklama</p>
            <p>Yedek dosyalarını güvenli bir yerde (harici disk, bulut depolama) saklayın.</p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 mb-1">⚠️ Geri Yükleme Öncesi</p>
            <p>Geri yüklemeden önce mutlaka mevcut veritabanının yedeğini alın!</p>
          </div>
          <div>
            <p className="font-medium text-zinc-900 mb-1">🔐 Güvenlik</p>
            <p>Yedek dosyaları hassas bilgiler içerir. Güvenli şekilde saklayın ve paylaşmayın.</p>
          </div>
        </CardContent>
      </Card>

      {ToastComponent}
    </div>
  );
}

