
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    deleteDoc as deleteFirestoreDoc,
    serverTimestamp,
    query,
    orderBy,
    writeBatch,
    updateDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DriveFile, DriveFileCreate, DriveCategory } from "@/lib/types";

const driveCollection = collection(db, "driveFiles");
const categoriesCollection = collection(db, "driveCategories");

// This function is for internal use by the API route
export const createFileRecord = async (fileData: Omit<DriveFileCreate, 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(driveCollection, {
        ...fileData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// Get all file records
export const getFiles = async (): Promise<DriveFile[]> => {
    const q = query(driveCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriveFile));
};

// Delete a file record and its corresponding file via API
export const deleteFile = async (id: string): Promise<void> => {
    const response = await fetch(`/api/drive?id=${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to delete file.");
    }
};

// This function is for internal use by the API route
export const deleteFileRecord = async (id: string): Promise<void> => {
    const docRef = doc(db, "driveFiles", id);
    await deleteFirestoreDoc(docRef);
};

// Category Management
export const getCategories = async (): Promise<DriveCategory[]> => {
    const q = query(categoriesCollection, orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DriveCategory));
}

export const addCategory = async (name: string): Promise<DriveCategory> => {
    const docRef = await addDoc(categoriesCollection, { name });
    return { id: docRef.id, name };
}

export const updateCategory = async (id: string, name: string): Promise<void> => {
    const categoryRef = doc(db, "driveCategories", id);
    await updateDoc(categoryRef, { name });
}

export const deleteCategory = async (id: string): Promise<void> => {
    const categoryRef = doc(db, "driveCategories", id);
    await deleteFirestoreDoc(categoryRef);
    // Note: This does not handle files associated with the category.
    // A more robust solution might involve a cloud function to update/re-categorize files.
}
