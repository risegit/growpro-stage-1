// src/pages/auth/SignIn.jsx
import React, { useState, useEffect } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

export function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 🧹 Always clean leftover login data when Sign-In page loads
  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
  }, []);

  const fixedUsers = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "manager", password: "manager123", role: "manager" },
    { username: "tech", password: "tech123", role: "technician" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please fill both Username and Password");
      return;
    }

    const foundUser = fixedUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!foundUser) {
      setError("Invalid username or password");
      return;
    }

    setError("");

    // Save user + role
    localStorage.setItem("user", JSON.stringify(foundUser));
    localStorage.setItem("loggedIn", "true");

    navigate("/dashboard/home", { replace: true });
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

          <Button type="submit" className="mt-6" fullWidth>
            Sign In
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