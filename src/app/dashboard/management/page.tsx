import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersManagement from "@/components/dashboard/management/users-management";
import TeamsManagement from "@/components/dashboard/management/teams-management";

export default function ManagementPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Management</h1>
                <p className="text-muted-foreground">
                    Kelola pengguna dan tim dalam sistem Anda.
                </p>
            </div>
            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4">
                    <UsersManagement />
                </TabsContent>
                <TabsContent value="teams" className="space-y-4">
                    <TeamsManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
