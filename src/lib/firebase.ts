import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe4k3Cr0kBfhbaiwMzHm5lz89GwlHtiQI",
  authDomain: "siddharth-vibe-events.firebaseapp.com",
  projectId: "siddharth-vibe-events",
  storageBucket: "siddharth-vibe-events.firebasestorage.app",
  messagingSenderId: "876872991999",
  appId: "1:876872991999:web:551cb57ce696ddf20638ca",
  measurementId: "G-LSG7WJ931T",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
