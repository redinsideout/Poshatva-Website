import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRA8J8px05_47w-lRBuiFum6XYrf9gFv8",
  authDomain: "poshatva-2025ecom.firebaseapp.com",
  projectId: "poshatva-2025ecom",
  storageBucket: "poshatva-2025ecom.firebasestorage.app",
  messagingSenderId: "604211122265",
  appId: "1:604211122265:web:7016b7e27e7db5c4192148",
  measurementId: "G-5FE7NXE1J6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
