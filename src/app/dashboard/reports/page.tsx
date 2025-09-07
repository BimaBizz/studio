import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BeritaAcaraManagement from "@/components/dashboard/reports/berita-acara-management";

export default function ReportsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Laporan</h1>
                <p className="text-muted-foreground">
                    Buat dan kelola berbagai jenis laporan.
                </p>
            </div>
            <Tabs defaultValue="berita-acara" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="berita-acara">Berita Acara</TabsTrigger>
                </TabsList>
                <TabsContent value="berita-acara" className="space-y-4">
                    <BeritaAcaraManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
