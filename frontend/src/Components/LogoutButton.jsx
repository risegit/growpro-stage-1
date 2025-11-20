import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();                          // clear roles + user + flags
    navigate("/sign-in", { replace: true });       // correct redirect route
  }, []);

  return null; // no UI required
}