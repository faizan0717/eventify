// src/firebase.js

import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
    apiKey: "AIzaSyChTVK4JyiP3GTPvIn1kzVFTWzgjzOy_rk",
    authDomain: "smart-event-1d987.firebaseapp.com",
    projectId: "smart-event-1d987",
    storageBucket: "smart-event-1d987.appspot.com",
    messagingSenderId: "963848592033",
    appId: "1:963848592033:web:c4f2abb0573c181925eee0",
    measurementId: "G-D46KBRRMFB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

// Create a GoogleAuthProvider instance
const provider = new firebase.auth.GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = () => {
    return firebase.auth().signInWithPopup(provider)
      .then((result) => {
        // Handle successful sign-in
        const user = result.user;
        console.log("User signed in with Google:", user);
        
        // Save user information in local storage
        localStorage.setItem('user', JSON.stringify(user));
        
        // Navigate to the dashboard
        window.location.href = '/dashboard'; // This will force a full page reload, you can replace it with React Router navigation if you prefer
      })
      .catch((error) => {
        // Handle errors
        console.error("Google sign-in error:", error);
      });
  };

export default firebase;
