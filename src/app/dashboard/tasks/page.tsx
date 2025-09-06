
import TaskBoard from "@/components/dashboard/tasks/task-board";

export default function TasksPage() {
    return (
        <div className="space-y-8 h-full flex flex-col">
            <div>
                <h1 className="text-3xl font-bold">Papan Tugas</h1>
                <p className="text-muted-foreground">
                    Kelola, lacak, dan delegasikan tugas tim Anda di sini.
                </p>
            </div>
            <TaskBoard />
        </div>
    );
}
