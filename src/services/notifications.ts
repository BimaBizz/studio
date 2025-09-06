
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    writeBatch,
    serverTimestamp,
    query,
    orderBy,
    where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Notification } from "@/lib/types";

const notificationsCollection = collection(db, "notifications");

export const getNotifications = async (): Promise<Notification[]> => {
    const q = query(notificationsCollection, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const addNotification = async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> => {
    const docRef = await addDoc(notificationsCollection, {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, read: false, createdAt: new Date(), ...notificationData };
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    const q = query(notificationsCollection, where("read", "==", false));
    const unreadSnapshot = await getDocs(q);
    
    if (unreadSnapshot.empty) {
        return;
    }

    const batch = writeBatch(db);
    unreadSnapshot.docs.forEach(document => {
        batch.update(document.ref, { read: true });
    });
    
    await batch.commit();
};
