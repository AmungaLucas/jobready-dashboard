'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebaseClient';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userWithData = { ...firebaseUser, ...userData };
            setUser(userWithData);
            setUserRole(userData.role);
            
            // Update last login
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              lastLogin: serverTimestamp(),
            }, { merge: true });

            // Set session cookie for middleware
            await setSessionCookie(firebaseUser.uid);
          } else {
            console.log('No user document found for:', firebaseUser.uid);
            setUser(firebaseUser);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
        // Clear session cookie
        await fetch('/api/logout', { method: 'POST' });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setSessionCookie = async (uid) => {
    try {
      // Get ID token
      const idToken = await auth.currentUser?.getIdToken();
      if (idToken) {
        // Set session cookie
        await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });
      }
    } catch (error) {
      console.error('Error setting session cookie:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/logout', { method: 'POST' });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};