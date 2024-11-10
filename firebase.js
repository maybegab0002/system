// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';

const firebaseConfig = {
    apiKey: "AIzaSyAWrbiVnG6k_w_JZbjOmnDAW5xaBb8Riw0",
    authDomain: "personal-project-ffcb2.firebaseapp.com",
    projectId: "personal-project-ffcb2",
    storageBucket: "personal-project-ffcb2.firebasestorage.app",
    messagingSenderId: "1081374352989",
    appId: "1:1081374352989:web:7d64510bb12b306dcf0fb4",
    measurementId: "G-DBKD55X6H5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;