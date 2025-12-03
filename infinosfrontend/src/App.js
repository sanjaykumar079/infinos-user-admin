// ✅ App.js
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./App.css";
import logo from "./logo.svg";

// Existing pages
import Home from "./Home";
import Devices from "./Devices";
import Control from "./Control";

// New pages
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🧠 Step 1: Get logged-in user from Supabase
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoadingUser(false);
    }
    getUser();

    // 🪄 Step 2: Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <div className="App">
      <Router>
        {/* 🧭 If not logged in → show login page */}
        {!user ? (
          <Login />
        ) : (
          <Routes>
            {/* ✅ Keep all your old routes */}
            <Route path="/" element={<Home />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/control" element={<Control />} />

            {/* 🆕 Add new Dashboard */}
            <Route path="/dashboard" element={<Dashboard user={user} />} />

            {/* Optional: Logout route */}
            <Route
              path="/logout"
              element={<Logout setUser={setUser} />}
            />
          </Routes>
        )}
      </Router>
    </div>
  );
}

// 🧹 Simple logout component (optional)
function Logout({ setUser }) {
  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/";
    }
    logout();
  }, [setUser]);

  return <div>Logging out...</div>;
}

export default App;
