import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCok7368B7fwj7DJ0w45XK8CYXmsL1eybo",
    authDomain: "e-commerce-platform-c1d3c.firebaseapp.com",
    projectId: "e-commerce-platform-c1d3c",
    storageBucket: "e-commerce-platform-c1d3c.appspot.com",
    messagingSenderId: "547188610571",
    appId: "1:547188610571:web:6d0c599afec0a6e881590e",
    measurementId: "G-6CXFEFRBHY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
