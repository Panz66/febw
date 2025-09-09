// src/pages/LoginAdmin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Hardcode login dulu
    if (formData.username === "admin" && formData.password === "12345") {
      alert("Login berhasil!");
      navigate("/admindashboard"); // redirect ke dashboard
    } else {
      alert("Username atau password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222831] font-[Poppins]">
      <div className="bg-[#393E46] shadow-lg rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#EEEEEE]">
          Login Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#222831] text-[#EEEEEE] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-[#222831] text-[#EEEEEE] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#00ADB5] hover:bg-[#019ca3] text-[#EEEEEE] py-3 rounded-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
