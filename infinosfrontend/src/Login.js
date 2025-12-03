// src/Login.js
import { supabase } from "./supabaseClient";

function Login() {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      console.error("Login error:", error.message);
    }
    // After login, Supabase redirects back to your app.
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ padding: 24, borderRadius: 12, border: "1px solid #ddd", background: "white" }}>
        <h2 style={{ marginBottom: 16 }}>Sign in to INFINOS</h2>
        <button
          onClick={handleGoogleLogin}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#f97316",
            color: "white",
            fontWeight: 600,
          }}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
