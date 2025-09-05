
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    deleteDoc as deleteFirestoreDoc,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SparePart } from "@/lib/types";

const sparePartsCollection = collection(db, "spareParts");

export const getSpareParts = async (): Promise<SparePart[]> => {
    const q = query(sparePartsCollection, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SparePart));
};

export const addSparePart = async (sparePartData: Omit<SparePart, 'id'>): Promise<SparePart> => {
    const docRef = await addDoc(sparePartsCollection, sparePartData);
    return { id: docRef.id, ...sparePartData };
};

export const updateSparePart = async (id: string, sparePartData: Partial<Omit<SparePart, 'id'>>): Promise<void> => {
    const docRef = doc(db, "spareParts", id);
    await updateDoc(docRef, sparePartData);
};

export const deleteSparePart = async (id: string): Promise<void> => {
    const docRef = doc(db, "spareParts", id);
    await deleteFirestoreDoc(docRef);
};
