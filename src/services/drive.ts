
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DrivePage } from "@/lib/types";

const driveCollection = collection(db, "drivePages");

// Create a new page
export const createPage = async (pageData: { title: string; content: string }): Promise<string> => {
    const docRef = await addDoc(driveCollection, {
        ...pageData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

// Get all pages
export const getPages = async (): Promise<DrivePage[]> => {
    const q = query(driveCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DrivePage));
};

// Get a single page by ID
export const getPage = async (id: string): Promise<DrivePage | null> => {
    const docRef = doc(db, "drivePages", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DrivePage;
    }
    return null;
};

// Update a page
export const updatePage = async (id: string, updates: { title?: string; content?: string }): Promise<void> => {
    const docRef = doc(db, "drivePages", id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

// Delete a page
export const deletePage = async (id: string): Promise<void> => {
    const docRef = doc(db, "drivePages", id);
    await deleteDoc(docRef);
};
