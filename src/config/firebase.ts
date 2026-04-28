import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUVP-MD2lttnxC51rMcaPRIhvhpXKvZmE",
  authDomain: "resiliochain-ai.firebaseapp.com",
  projectId: "resiliochain-ai",
  storageBucket: "resiliochain-ai.firebasestorage.app",
  messagingSenderId: "905075265892",
  appId: "1:905075265892:web:fcd1403cf9f4195e8aea71",
  measurementId: "G-5SCXTNTBTC"
};

const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Optional: Set custom parameters for Google Auth
googleProvider.setCustomParameters({ prompt: 'select_account' });