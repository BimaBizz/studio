
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
import type { BeritaAcara } from "@/lib/types";

const reportsCollection = collection(db, "beritaAcaraReports");

export const getReports = async (): Promise<BeritaAcara[]> => {
    const q = query(reportsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            createdAt: data.createdAt // Keep as Firestore Timestamp for date formatting
        } as BeritaAcara;
    });
};

export const addReport = async (reportData: Omit<BeritaAcara, 'id' | 'createdAt'>): Promise<BeritaAcara> => {
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

export const updateReport = async (id: string, reportData: Partial<Omit<BeritaAcara, 'id'>>): Promise<void> => {
    const docRef = doc(db, "reports", id);
    await updateDoc(docRef, reportData);
};

export const deleteReport = async (id: string): Promise<void> => {
    const docRef = doc(db, "reports", id);
    await deleteFirestoreDoc(docRef);
};
