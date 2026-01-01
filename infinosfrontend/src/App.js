// FILE: infinosfrontend/src/App.js
// User Frontend - Admin routes removed (now in separate infinosfrontend-admin project)

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./App.css";

// User Pages
import Home from "./Home";
import Devices from "./Devices";
import BagControl from "./BagControl";
import Login from "./Login";
import Dashboard from "./Dashboard";

function AppContent() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoadingUser(false);
    }
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* User Routes */}
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/bag-control" element={<BagControl />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/logout" element={<Logout setUser={setUser} />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

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

function App() {
  return (
    <div className="App">
      <AppContent />
    </div>
  );
}

export default App;
