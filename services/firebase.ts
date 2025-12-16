
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDPBUVJcTu4gr8ClObkG_pVZT_GvGVn_CA",
  authDomain: "blucell-51f99.firebaseapp.com",
  projectId: "blucell-51f99",
  storageBucket: "blucell-51f99.firebasestorage.app",
  messagingSenderId: "37054256504",
  appId: "1:37054256504:web:1d3995fd6150e4359fe48d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  doc, 
  setDoc, 
  getDoc,
  collection,
  addDoc,
  ref, 
  uploadBytes, 
  getDownloadURL
};
export type { FirebaseUser };
