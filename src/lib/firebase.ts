import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

// Inlined configuration for total compilation and runtime robustness
const firebaseConfig = {
  apiKey: "AIzaSyBCwEzAOj5xtl00bjqwPL56alnQpM07s-k",
  authDomain: "gen-lang-client-0383124257.firebaseapp.com",
  projectId: "gen-lang-client-0383124257",
  storageBucket: "gen-lang-client-0383124257.firebasestorage.app",
  messagingSenderId: "1022203448615",
  appId: "1:1022203448615:web:a00469c9f1cd4b3f776d02",
  firestoreDatabaseId: "ai-studio-realestateplatfo-d6afd6fc-63f0-4b38-af03-a680dcf1c51d"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Local simulation keys for session caching and offline sandbox mode
const LOCAL_USERS_KEY = 'realestate_simulated_users';
const CURRENT_USER_KEY = 'realestate_current_user';

// Setup standard seed data if not present in localStorage
const getSimulatedUsers = (): UserProfile[] => {
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  if (!data) {
    const defaults: UserProfile[] = [
      {
        id: 'user-buyer-1',
        email: 'buyer@example.com',
        role: 'buyer',
        name: 'Alex Johnson',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        phone: '+1 (555) 123-4567',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-seller-1',
        email: 'seller@example.com',
        role: 'seller',
        name: 'Sarah Jenkins (Horizon Homes)',
        companyName: 'Horizon Real Estate',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        phone: '+1 (555) 987-6543',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-admin-1',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Marcus Vance (Platform Admin)',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        phone: '+1 (555) 000-1111',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

// Helper error handler conforming to standard FirestoreErrorInfo
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Firestore Connection as required by the skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network.");
    }
  }
}
testConnection();

// Set up onAuthStateChanged listener to automatically update local cache when real Firebase Auth state changes
onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
  if (firebaseUser) {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      } else {
        // Fallback or lazy create profile if signed in via Google but profile document doesn't exist
        const profile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous User',
          role: 'buyer', // Default new Google signups to buyer role
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.uid)}`,
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, profile);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn("Auth state changed profile load error (might be offline or rules-related):", e);
    }
  } else {
    // If signed out in Firebase and we have a non-simulated user, remove it
    const localUser = localStorage.getItem(CURRENT_USER_KEY);
    if (localUser) {
      const parsed = JSON.parse(localUser);
      // Only clear if the user was an actual Firebase authenticated user (ID doesn't start with simulated 'user-')
      if (parsed && !parsed.id.startsWith('user-')) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
  }
});

// Authentication service utilizing real Firebase capabilities with standard fallback
export const authService = {
  /**
   * Sign up with email, name, and role.
   * If Firebase Email/Password Auth is disabled in their console, it falls back to Simulated sandbox with clear console guidance.
   */
  async signUp(
    email: string, 
    name: string, 
    role: UserRole, 
    phone?: string, 
    companyName?: string
  ): Promise<{ user: UserProfile | null; error: string | null; providerAlert?: boolean }> {
    try {
      const password = 'TemporaryPassword123!'; // Simplified password for platform-friendly signup
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const profile: UserProfile = {
        id: userCredential.user.uid,
        email: userCredential.user.email || email,
        role,
        name,
        phone,
        companyName,
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString()
      };

      // Write to Firestore users collection
      try {
        await setDoc(doc(db, 'users', profile.id), profile);
      } catch (firestoreErr) {
        handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${profile.id}`);
      }

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
      return { user: profile, error: null };

    } catch (authErr: any) {
      console.warn("Firebase Auth signUp warning:", authErr.message);
      
      // If Email/Password provider is disabled in Firebase console (default state on new projects)
      if (authErr.code === 'auth/operation-not-allowed' || authErr.message?.includes('disabled')) {
        // Standard sandbox registration fallback
        const users = getSimulatedUsers();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          return { user: null, error: 'User with this email already exists' };
        }

        const newId = `user-${Math.random().toString(36).substring(2, 9)}`;
        const profile: UserProfile = {
          id: newId,
          email,
          role,
          name,
          phone,
          companyName,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          createdAt: new Date().toISOString()
        };

        users.push(profile);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));

        return { 
          user: profile, 
          error: null,
          providerAlert: true // Alert the frontend to display instructions on how to enable Email/Password provider
        };
      }
      
      return { user: null, error: authErr.message || 'Error signing up with Firebase' };
    }
  },

  /**
   * Sign in with email.
   * If Firebase Email/Password Auth is disabled in their console, it falls back to Simulated sandbox.
   */
  async signIn(email: string): Promise<{ user: UserProfile | null; error: string | null; providerAlert?: boolean }> {
    try {
      const password = 'TemporaryPassword123!';
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch profile from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        return { user: profile, error: null };
      } else {
        // Create matching profile in Firestore if it was somehow missing
        const profile: UserProfile = {
          id: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: email.split('@')[0],
          role: 'buyer',
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(userCredential.user.uid)}`,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profile);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        return { user: profile, error: null };
      }

    } catch (authErr: any) {
      console.warn("Firebase Auth signIn warning:", authErr.message);

      // If the email provider is disabled or user not found, fallback to Sandbox mode
      if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/user-not-found' || authErr.message?.includes('disabled')) {
        const users = getSimulatedUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          return { user: null, error: 'Account not found. Please click Sign Up to register a new account.' };
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { 
          user, 
          error: null,
          providerAlert: authErr.code === 'auth/operation-not-allowed' || authErr.message?.includes('disabled')
        };
      }

      return { user: null, error: authErr.message || 'Error signing in with Firebase' };
    }
  },

  /**
   * Real Google Sign-In via Popup (Enabled and functional by default on our provisioned project!)
   */
  async signInWithGoogle(): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        return { user: profile, error: null };
      } else {
        // Create new user profile document in Firestore on first sign-in
        const profile: UserProfile = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
          role: 'buyer', // Default new accounts to buyer
          avatarUrl: result.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(result.user.uid)}`,
          createdAt: new Date().toISOString()
        };
        
        try {
          await setDoc(userRef, profile);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
        }
        
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
        return { user: profile, error: null };
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      return { user: null, error: err.message || 'Google authentication failed' };
    }
  },

  /**
   * Sign out from Firebase and clear cache
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Firebase Auth signOut error:', err);
    }
    
    localStorage.removeItem(CURRENT_USER_KEY);
    return { error: null };
  },

  /**
   * Retrieve the current logged-in user profile
   */
  getCurrentUser(): UserProfile | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) {
      // Seed and return default buyer on initial load for frictionless exploration
      const defaults = getSimulatedUsers();
      const defaultBuyer = defaults.find(u => u.role === 'buyer') || defaults[0];
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultBuyer));
      return defaultBuyer;
    }
    return JSON.parse(data);
  },

  /**
   * Switch roles dynamically for testing different views.
   * If real user is logged in, syncs the role change directly to Firestore!
   */
  switchRole(role: UserRole): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updatedProfile = { ...current, role };

    // If it's a real Firebase user (non-simulated), write updated role to Firestore in the background
    if (!current.id.startsWith('user-')) {
      const userRef = doc(db, 'users', current.id);
      updateDoc(userRef, { role }).catch(err => {
        console.warn("Could not sync updated role to Firestore (might be rules or offline):", err);
      });
    } else {
      // If simulated user, update their profile inside the local listings array
      const users = getSimulatedUsers();
      const updatedUsers = users.map(u => u.id === current.id ? { ...u, role } : u);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updatedUsers));
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedProfile));
    return updatedProfile;
  },

  /**
   * Retrieve all users (useful for admin list dashboards)
   */
  getAllUsers(): UserProfile[] {
    // Return the cached list of simulated/real profiles loaded so far
    return getSimulatedUsers();
  },

  /**
   * Admin-level: Update user's role
   */
  updateUserRole(userId: string, newRole: UserRole): UserProfile[] {
    const users = getSimulatedUsers();
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...current, role: newRole }));
    }

    if (!userId.startsWith('user-')) {
      const userRef = doc(db, 'users', userId);
      updateDoc(userRef, { role: newRole }).catch(err => {
        console.error("Failed to update user role in Firestore:", err);
      });
    }
    
    return updated;
  }
};
