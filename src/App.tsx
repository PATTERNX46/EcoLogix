import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // This listener fires automatically when the app loads, or when login/logout happens
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // User exists in Firebase Auth, now grab their specific role from Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          } else {
            // Safety fallback
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "Authorized Personnel",
              role: "analyst",
              createdAt: Date.now(),
            });
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
          setUser(null);
        }
      } else {
        // No valid session found
        setUser(null);
      }
      
      // CRITICAL: Turn off the infinite loading screen
      setLoading(false); 
    });

    // Cleanup the listener when the app closes
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <RouterProvider router={router} />;
}

export default App;