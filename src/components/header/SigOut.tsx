import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogoutClick() {
    setShowLogoutConfirm(true);
    closeDropdown();
  }

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogoutConfirm(false);
    navigate("/");
  }

  function handleCancelLogout() {
    setShowLogoutConfirm(false);
    navigate("/");
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-sm w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Apakah anda ingin keluar dari tampilan admin?
          </h3>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancelLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              Tidak
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Iya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}