import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCYmVw7fvvpL4kLZ8tltIq7AhZ1BLk46Qo',
  authDomain: 'tareeqalhaqqorg.firebaseapp.com',
  projectId: 'tareeqalhaqqorg',
  storageBucket: 'tareeqalhaqqorg.firebasestorage.app',
  messagingSenderId: '145363788648',
  appId: '1:145363788648:web:8119054fb3f9f9bd7facdd',
};

export const firebaseApp: FirebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
