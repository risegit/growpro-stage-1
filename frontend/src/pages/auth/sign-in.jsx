// src/pages/auth/SignIn.jsx
import React, { useState, useEffect } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // useEffect(() => {
  //   localStorage.removeItem("user");
  //   localStorage.removeItem("loggedIn");
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill both Username and Password");
      return;
    }

    setLoading(true);

    try {
      // Prepare POST Body
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // 🔥 SEND TO API
      const res = await fetch(`${import.meta.env.VITE_API_URL}api/signin-out.php`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      console.log("Login API Response:", data);

      if (!data.status || data.status !== "success") {
        setError(data.error || "Invalid username or password");
        setLoading(false);
        return;
      }

      // Save logged-in user info
      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedIn", "true");
      
      // Redirect
      navigate("/dashboard/home", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      setError("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="w-full lg:w-3/5 mt-24">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">
            Sign In
          </Typography>
          <Typography variant="paragraph" color="blue-gray">
            Enter your username and password to Sign In.
          </Typography>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2"
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small">Username</Typography>
            <Input
              size="lg"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <Typography variant="small">Password</Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <Button type="submit" className="mt-6" fullWidth disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>

      <div className="w-2/5 h-full hidden lg:block">
        <img
          src={`${import.meta.env.BASE_URL}img/Gropro.jpg`}
          className="h-full w-full object-cover rounded-3xl"
          alt="GrowPro"
        />
      </div>
    </section>
  );
}

export default SignIn;
