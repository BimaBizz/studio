
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    deleteDoc as deleteFirestoreDoc,
    serverTimestamp,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DriveFile, DriveFileCreate } from "@/lib/types";

const driveCollection = collection(db, "driveFiles");

// This function is for internal use by the API route
export const createFileRecord = async (fileData: DriveFileCreate): Promise<string> => {
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
