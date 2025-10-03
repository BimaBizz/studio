import TroublesManagement from "@/components/dashboard/troubles/troubles-management";

export default function TroublesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Laporan Trouble</h1>
                <p className="text-muted-foreground">
                    Lihat dan kelola laporan masalah teknis.
                </p>
            </div>
            <TroublesManagement />
        </div>
    );
}
