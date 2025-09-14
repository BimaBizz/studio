
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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { MaintenanceApproval } from "@/lib/types";

const reportsCollection = collection(db, "maintenanceApprovals");

export const getMaintenanceApprovals = async (): Promise<MaintenanceApproval[]> => {
    const q = query(reportsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
        } as MaintenanceApproval;
    });
};

export const addMaintenanceApproval = async (reportData: Omit<MaintenanceApproval, 'id' | 'createdAt'>): Promise<MaintenanceApproval> => {
    const docRef = await addDoc(reportsCollection, {
        ...reportData,
        createdAt: serverTimestamp(),
    });
    return { 
        id: docRef.id, 
        ...reportData,
        createdAt: new Date()
    };
};

export const updateMaintenanceApproval = async (id: string, reportData: Partial<Omit<MaintenanceApproval, 'id'>>): Promise<void> => {
    const docRef = doc(db, "maintenanceApprovals", id);
    await updateDoc(docRef, reportData);
};

export const deleteMaintenanceApproval = async (id: string): Promise<void> => {
    const docRef = doc(db, "maintenanceApprovals", id);
    await deleteFirestoreDoc(docRef);
};
