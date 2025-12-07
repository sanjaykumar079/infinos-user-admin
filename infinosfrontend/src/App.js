import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./App.css";

// Pages
import Home from "./Home";
import Devices from "./Devices";
import BagControl from "./BagControl";  // NEW - replaces Control
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
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
    <div className="App">
      <Router>
        {!user ? (
          <Login />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/bag-control" element={<BagControl />} />  {/* NEW ROUTE */}
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/logout" element={<Logout setUser={setUser} />} />
          </Routes>
        )}
      </Router>
    </div>
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

export default App;