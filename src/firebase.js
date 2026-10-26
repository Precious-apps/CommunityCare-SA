import{initializeApp}from"firebase/app";
import{getFirestore}from"firebase/firestore";

const firebaseConfig={
  apiKey: "AIzaSyCU5WFtz1gzxxlH7kmpaYR64DMOa3ikCUg",
  authDomain: "communitycare-sa.firebaseapp.com",
  projectId: "communitycare-sa",
  storageBucket: "communitycare-sa.firebasestorage.app",
  messagingSenderId: "439691202108",
  appId: "1:439691202108:web:43bb5d56107b2b4af5bd39"
};

const app = initializeApp(firebaseConfig);

export const db=getFirestore(app);