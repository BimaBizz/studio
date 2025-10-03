
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
    where,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Trouble } from "@/lib/types";

const troublesCollection = collection(db, "troubles");

export const getTroubles = async (dateRange?: { from: Date, to: Date }): Promise<Trouble[]> => {
    let q;
    if (dateRange) {
        q = query(
            troublesCollection,
            where("date", ">=", Timestamp.fromDate(dateRange.from)),
            where("date", "<=", Timestamp.fromDate(dateRange.to)),
            orderBy("date", "desc")
        );
    } else {
        q = query(troublesCollection, orderBy("createdAt", "desc"));
    }
    
    const snapshot = await getDocs(q);
    const troubles = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
            date: data.date.toDate().toISOString(),
            timeOff: data.timeOff.toDate().toISOString(),
            timeOn: data.timeOn.toDate().toISOString(),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        } as Trouble;
    });

    // Sort by timeOff descending in the client
    return troubles.sort((a, b) => new Date(b.timeOff).getTime() - new Date(a.timeOff).getTime());
};

export const addTrouble = async (troubleData: Omit<Trouble, 'id' | 'createdAt'>): Promise<Trouble> => {
    const docRef = await addDoc(troublesCollection, {
        ...troubleData,
        date: Timestamp.fromDate(new Date(troubleData.date)),
        timeOff: Timestamp.fromDate(new Date(troubleData.timeOff)),
        timeOn: Timestamp.fromDate(new Date(troubleData.timeOn)),
        createdAt: serverTimestamp(),
    });
    return { 
        id: docRef.id, 
        ...troubleData,
        createdAt: new Date().toISOString() 
    };
};

export const updateTrouble = async (id: string, troubleData: Partial<Omit<Trouble, 'id'>>): Promise<void> => {
    const docRef = doc(db, "troubles", id);
    const dataToUpdate: {[key: string]: any} = { ...troubleData };
    
    if (troubleData.date) {
        dataToUpdate.date = Timestamp.fromDate(new Date(troubleData.date));
    }
    if (troubleData.timeOff) {
        dataToUpdate.timeOff = Timestamp.fromDate(new Date(troubleData.timeOff));
    }
     if (troubleData.timeOn) {
        dataToUpdate.timeOn = Timestamp.fromDate(new Date(troubleData.timeOn));
    }

    await updateDoc(docRef, dataToUpdate);
};


export const deleteTrouble = async (id: string): Promise<void> => {
    const docRef = doc(db, "troubles", id);
    await deleteFirestoreDoc(docRef);
};
