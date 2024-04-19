import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { auth } from "./firebase";
import ValidateQR from "./pages/validate_qr"
import RecommendationPage from "./pages/recomendationPage";
import FeedbackPage from "./pages/FeedbackPage";

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // If loading, show loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/validate/:id" element={<ValidateQR />} />
        <Route path="/recommendations" element={<RecommendationPage />} />
        <Route path="/feedback/:id" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App;
