
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    deleteDoc as deleteFirestoreDoc,
    query,
    orderBy,
    serverTimestamp,
    where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Task, TaskStatus } from "@/lib/types";

const tasksCollection = collection(db, "tasks");

export const getTasks = async (): Promise<Task[]> => {
    const q = query(tasksCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            dueDate: data.dueDate,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Task;
    });
};

export const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    const docRef = await addDoc(tasksCollection, {
        ...taskData,
        createdAt: serverTimestamp(),
    });
    return { 
        id: docRef.id, 
        ...taskData,
        createdAt: new Date().toISOString() 
    };
};

export const updateTask = async (id: string, taskData: Partial<Omit<Task, 'id'>>): Promise<void> => {
    const docRef = doc(db, "tasks", id);
    await updateDoc(docRef, taskData);
};

export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
    const docRef = doc(db, "tasks", id);
    await updateDoc(docRef, { status });
};

export const deleteTask = async (id: string): Promise<void> => {
    const docRef = doc(db, "tasks", id);
    await deleteFirestoreDoc(docRef);
};
