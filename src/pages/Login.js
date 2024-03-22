// src/pages/Login.js

import React from "react";
import { auth, googleProvider } from "../firebase";

const Login = () => {
  const handleLogin = async () => {
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
        Login with Google
      </button>
    </div>
  );
};

export default Login;
