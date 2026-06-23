import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { app } from './firebase';

import { getSessionFingerprint } from '../utils/session';

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

export const logAuditEvent = async (uid, eventType, metadata = {}) => {
  if (!uid) return;
  try {
    const TRACKED_EVENTS = [
      'login', 'logout', 'phone_login', 'google_login',
      'session_restore', 'session_expiry', 'session_created', 'session_terminated',
      'provider_linked', 'provider_unlinked', 'account_merge',
      'trusted_device_added', 'trusted_device_removed', 'security_alert'
    ];

    if (!TRACKED_EVENTS.includes(eventType)) return;

    const fingerprint = getSessionFingerprint();
    const currentSessionId = sessionStorage.getItem('sa_current_sid') || '';
    
    // Determine risk score
    let riskLevel = 'LOW';
    const highRiskEvents = ['account_merge', 'provider_unlinked', 'session_terminated'];
    const mediumRiskEvents = ['security_alert'];
    
    if (highRiskEvents.includes(eventType)) {
      riskLevel = 'HIGH';
    } else if (mediumRiskEvents.includes(eventType)) {
      riskLevel = 'MEDIUM';
    } else if (['login', 'phone_login', 'google_login', 'session_created', 'session_restore'].includes(eventType)) {
      const trustedDevices = JSON.parse(localStorage.getItem('sa_trusted_devices') || '[]');
      const isDeviceTrusted = trustedDevices.includes(fingerprint.stableId);
      riskLevel = isDeviceTrusted ? 'LOW' : 'MEDIUM';
    }

    const logData = {
      eventType,
      timestamp: new Date().toISOString(),
      device: fingerprint.deviceName,
      browser: fingerprint.browserName,
      os: fingerprint.operatingSystem,
      sessionId: currentSessionId,
      riskLevel,
      metadata: {
        ...metadata,
        stableId: fingerprint.stableId,
      }
    };

    await addUserSubcollectionDoc(uid, 'audit_logs', logData);
  } catch (error) {
    console.error("Failed to log audit event in Firestore:", error);
  }
};

export const getAuditLogs = async (uid, limitCount = 20, lastDoc = null) => {
  if (!uid) return { logs: [], lastVisible: null };
  try {
    const db = getFirestore(app);
    let q = query(
      collection(db, 'users', uid, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), docSnapshot: doc }));
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    return { logs, lastVisible };
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return { logs: [], lastVisible: null };
  }
};


