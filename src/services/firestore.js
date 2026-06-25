import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  getDocs,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { app } from './firebase';

const db = getFirestore(app);

export const getUserDoc = async (uid) => {
  return await getDoc(doc(db, 'users', uid));
};

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), data);
};

export const getUserSubcollection = async (uid, collectionName) => {
  const querySnapshot = await getDocs(collection(db, 'users', uid, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addUserSubcollectionDoc = async (uid, collectionName, data) => {
  return await addDoc(collection(db, 'users', uid, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const setUserDoc = async (uid, path, data) => {
  await setDoc(doc(db, 'users', uid, ...path), data);
};

export const deleteUserDoc = async (uid, path) => {
  await deleteDoc(doc(db, 'users', uid, ...path));
};
