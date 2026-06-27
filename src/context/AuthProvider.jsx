import { useEffect, useReducer, useCallback, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithPhoneNumber, 
  signInWithPopup,
  linkWithPopup,
  unlink,
  reauthenticateWithCredential,
  deleteUser,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { AuthContext } from './AuthContext';
import { toast } from 'react-hot-toast';
import { logAuditEvent } from '../services/firestore';

const initialState = {
  user: null,
  loading: true,
  error: null,
  confirmationResult: null, // Still used for sign-in
  verificationId: null,      // Used for linking
  status: 'IDLE' // IDLE, LOADING, AUTHENTICATED, ERROR
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null, status: 'LOADING' };
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null, status: 'AUTHENTICATED' };
    case 'AUTH_FAILURE':
      return { ...state, loading: false, error: action.payload, status: 'ERROR' };
    case 'AUTH_STATE_CHANGED':
      return { ...state, user: action.payload, loading: false, status: action.payload ? 'AUTHENTICATED' : 'IDLE' };
    case 'SET_CONFIRMATION_RESULT':
      return { ...state, confirmationResult: action.payload, loading: false };
    case 'SET_VERIFICATION_ID':
      return { ...state, verificationId: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [mergeCredential, setMergeCredential] = useState(null);

  const mergeAccount = useCallback(async () => {
    if (!mergeCredential || !auth.currentUser) return;
    dispatch({ type: 'AUTH_START' });
    try {
      console.log("[MERGE STEP 1] Initiating merge");
      await linkWithCredential(auth.currentUser, mergeCredential);
      await auth.currentUser.reload();
      const freshUser = { ...auth.currentUser };
      console.log("[MERGE STEP 2] Merge successful");
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: freshUser });
      setMergeCredential(null);
      toast.success('Accounts merged successfully');
      logAuditEvent(freshUser.uid, 'account_merge', { details: 'Google and Phone accounts merged successfully.' }).catch(err => {
        console.error("Failed to log account merge:", err);
      });
      console.log("[MERGE STEP 3] Merge completed");
    } catch (error) {
      console.error("[MERGE ERROR]", error);
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      toast.error('Failed to merge accounts.');
    }
  }, [mergeCredential]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: currentUser });
    });

    return () => unsubscribe();
  }, []);

  const loginWithPhone = useCallback(async (phoneNumber, appVerifier) => {
    dispatch({ type: 'AUTH_START' });
    try {
      console.log("[STEP signInWithPhoneNumber ENTER]");
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      console.log("[STEP signInWithPhoneNumber EXIT]");
      dispatch({ type: 'SET_CONFIRMATION_RESULT', payload: result });
      return result;
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (otp) => {
    // Check if we are linking (verificationId) or signing in (confirmationResult)
    if (state.verificationId) {
      dispatch({ type: 'AUTH_START' });
      try {
        console.log("[AuthProvider] Linking phone with credential...");
        const credential = PhoneAuthProvider.credential(state.verificationId, otp);
        console.log("[STEP linkWithCredential ENTER]");
        const result = await linkWithCredential(auth.currentUser, credential);
        console.log("[STEP linkWithCredential EXIT]");
        
        await result.user.reload();
        const freshUser = { ...auth.currentUser };
        
        console.log("[PROVIDER SYNC] old providers:", state.user?.providerData.map(p => p.providerId));
        console.log("[PROVIDER SYNC] new providers:", freshUser.providerData.map(p => p.providerId));
        console.log("[PROVIDER SYNC] user reference changed: true");

        console.log("[AuthProvider] Phone linked. User UID:", freshUser.uid);
        dispatch({ type: 'AUTH_STATE_CHANGED', payload: freshUser });
        dispatch({ type: 'SET_VERIFICATION_ID', payload: null });
        toast.success('Phone linked successfully');
        return result;
      } catch (error) {
        console.group("FULL PHONE AUTH ERROR");
        console.log("RAW ERROR:", error);
        console.log("CODE:", error?.code);
        console.groupEnd();
        
        if (error.code === 'auth/credential-already-in-use') {
          console.log("[MERGE DETECTED]");
          console.log("current UID:", auth.currentUser.uid);
          console.log("credential owner UID:", error.credential?.uid); // May not be available directly in error
          
          setMergeCredential(error.credential);
          toast.error('This phone number is already linked to another account. A merge option is available.');
        } else {
           let friendlyMessage = error.message;
           if (error.code === 'auth/invalid-verification-code') friendlyMessage = 'The verification code is invalid. Please check and try again.';
           if (error.code === 'auth/code-expired') friendlyMessage = 'The verification code has expired. Please request a new one.';
           if (error.code === 'auth/requires-recent-login') friendlyMessage = 'For security, please sign out and sign in again before linking a new provider.';
           toast.error(friendlyMessage);
        }
        dispatch({ type: 'AUTH_FAILURE', payload: error.message });
        throw error;
      }
    }

    if (!state.confirmationResult) {
      console.error("[AuthProvider] No confirmation result or verification ID found.");
      throw new Error('No verification session found. Please try again.');
    }

    dispatch({ type: 'AUTH_START' });
    try {
      console.log("[AuthProvider] Verifying OTP for Sign-in...");
      console.log("[STEP confirmationResult.confirm ENTER]");
      const result = await state.confirmationResult.confirm(otp);
      console.log("[STEP confirmationResult.confirm EXIT]");
      await result.user.reload();
      const freshUser = auth.currentUser;
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: freshUser });
      return result;
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  }, [state.confirmationResult, state.verificationId, state.user]);

  const loginWithGoogle = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      let errorMessage = error.message;
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different credential. Please use your original sign-in method.';
      }
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const linkGoogle = useCallback(async () => {
    if (!auth.currentUser) return;
    dispatch({ type: 'AUTH_START' });
    try {
      await linkWithPopup(auth.currentUser, googleProvider);
      await auth.currentUser.reload();
      const freshUser = { ...auth.currentUser };
      
      console.log("[PROVIDER SYNC] old providers:", state.user?.providerData.map(p => p.providerId));
      console.log("[PROVIDER SYNC] new providers:", freshUser.providerData.map(p => p.providerId));
      console.log("[PROVIDER SYNC] user reference changed: true");

      dispatch({ type: 'AUTH_STATE_CHANGED', payload: freshUser });
      toast.success('Google account linked successfully');
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("CODE:", error?.code);
      console.groupEnd();
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      toast.error(error.message);
      throw error;
    }
  }, [state.user]);

  const linkPhone = useCallback(async (phoneNumber, appVerifier) => {
    if (!auth.currentUser) {
      console.error("[AuthProvider] linkPhone failed: No current user.");
      return;
    }
    dispatch({ type: 'AUTH_START' });
    try {
      console.log("[AuthProvider] Initiating phone verification for linking:", {
        uid: auth.currentUser.uid,
        phone: phoneNumber,
        providers: auth.currentUser.providerData.map(p => p.providerId)
      });
      
      const phoneProvider = new PhoneAuthProvider(auth);
      console.log("[STEP verifyPhoneNumber ENTER]");
      const verificationId = await phoneProvider.verifyPhoneNumber(phoneNumber, appVerifier);
      console.log("[STEP verifyPhoneNumber EXIT]");
      
      console.log("[AuthProvider] Verification ID obtained:", verificationId);
      dispatch({ type: 'SET_VERIFICATION_ID', payload: verificationId });
      return verificationId;
      } catch (error) {
        console.group("FULL PHONE AUTH ERROR");
        console.log("RAW ERROR:", error);
        console.log("TYPE:", typeof error);
        console.log("INSTANCEOF ERROR:", error instanceof Error);
        console.log("CODE:", error?.code);
        console.log("MESSAGE:", error?.message);
        console.log("NAME:", error?.name);
        console.log("STACK:", error?.stack);
        console.log("STRINGIFIED:");
        try {
          console.log(JSON.stringify(error, null, 2));
        } catch {
          console.log("Unable to stringify");
        }
        console.groupEnd();
        
        dispatch({ type: 'AUTH_FAILURE', payload: error.message });
        
        let friendlyMessage = error.message;
      if (error.code === 'auth/provider-already-linked') friendlyMessage = 'This phone number is already linked to your account.';
      if (error.code === 'auth/credential-already-in-use') friendlyMessage = 'This phone number is already associated with another account.';
      if (error.code === 'auth/invalid-phone-number') friendlyMessage = 'The phone number provided is invalid.';
      if (error.code === 'auth/too-many-requests') friendlyMessage = 'Too many requests. Please try again later.';
      if (error.code === 'auth/internal-error') friendlyMessage = 'A Firebase internal error occurred. Please verify your reCAPTCHA configuration.';
      
      toast.error(friendlyMessage);
      throw error;
    }
  }, []);

  const unlinkProvider = useCallback(async (providerId) => {
    if (!auth.currentUser) return;
    if (auth.currentUser.providerData.length <= 1) {
      toast.error('Cannot unlink the last available provider.');
      return;
    }
    dispatch({ type: 'AUTH_START' });
    try {
      await unlink(auth.currentUser, providerId);
      await auth.currentUser.reload();
      const freshUser = { ...auth.currentUser };
      
      console.log("[PROVIDER SYNC] old providers:", state.user?.providerData.map(p => p.providerId));
      console.log("[PROVIDER SYNC] new providers:", freshUser.providerData.map(p => p.providerId));
      console.log("[PROVIDER SYNC] user reference changed: true");
      
      dispatch({ type: 'AUTH_STATE_CHANGED', payload: freshUser });
      toast.success('Provider unlinked successfully');
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("CODE:", error?.code);
      console.groupEnd();
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      toast.error(error.message);
      throw error;
    }
  }, [state.user]);

  const reauthenticate = useCallback(async (credential) => {
    if (!auth.currentUser) return;
    try {
      await reauthenticateWithCredential(auth.currentUser, credential);
      toast.success('Reauthentication successful');
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      toast.error('Reauthentication failed. Please try again.');
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      await deleteUser(auth.currentUser);
      dispatch({ type: 'LOGOUT' });
      toast.success('Account deleted successfully');
    } catch (error) {
      console.group("FULL PHONE AUTH ERROR");
      console.log("RAW ERROR:", error);
      console.log("TYPE:", typeof error);
      console.log("INSTANCEOF ERROR:", error instanceof Error);
      console.log("CODE:", error?.code);
      console.log("MESSAGE:", error?.message);
      console.log("NAME:", error?.name);
      console.log("STACK:", error?.stack);
      console.log("STRINGIFIED:");
      try {
        console.log(JSON.stringify(error, null, 2));
      } catch {
        console.log("Unable to stringify");
      }
      console.groupEnd();
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please reauthenticate before deleting your account.');
      } else {
        toast.error(error.message);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to logout');
    }
  }, []);

  const value = {
    ...state,
    loginWithPhone,
    verifyOtp,
    loginWithGoogle,
    linkGoogle,
    linkPhone,
    unlinkProvider,
    reauthenticate,
    deleteAccount,
    logout,
    mergeCredential,
    setMergeCredential,
    mergeAccount,
    setConfirmationResult: (result) => dispatch({ type: 'SET_CONFIRMATION_RESULT', payload: result })
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
