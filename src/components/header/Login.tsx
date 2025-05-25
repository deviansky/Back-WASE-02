import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Periksa status login saat komponen dimuat
    checkLoginStatus();
  }, []);

  // Fungsi untuk memeriksa status login
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  // Fungsi untuk navigasi ke halaman login
  const handleLogin = () => {
    navigate("/login");
  };

  // Hanya tampilkan tombol jika user belum login
  if (isLoggedIn) {
    return null; // Tidak menampilkan apa-apa jika sudah login
  }

  // Tampilkan tombol login jika user belum login
  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-3 px-2 py-2   font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
    >
      Login Admin
    </button>
  );
}