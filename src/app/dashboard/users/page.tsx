import { UserTable } from "@/components/dashboard/users/user-table";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Users Management</h1>
                    <p className="text-muted-foreground">
                        Add, edit, and manage user details and documents.
                    </p>
                </div>
                 {/* This button is a placeholder for the add user functionality */}
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>
            <UserTable />
        </div>
    );
}
