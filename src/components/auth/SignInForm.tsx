import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || "Login gagal");
      }
  
      const data = await response.json();
  
      // Simpan token & user ke localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
  
      // Arahkan ke dashboard atau halaman sesuai role
      if (data.user.role === "admin") {
        navigate("/");
      } else {
        navigate("/");
      }
  
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login");
    }
  };
  

  return (
    <div className="flex flex-col min-w-md justify-center mr-30 ml-20 items-center">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-900 rounded shadow">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Login Akun</h1>
        <p className="text-sm font-semibold text-gray-500 dark:text-white mb-4">Isi Data Dibawah Ini Untuk Login Sebagai Penghuni</p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Email <span className="text-error-500">*</span></Label>
            <Input
              type="email"
              placeholder="info@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Password <span className="text-error-500">*</span></Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-700 dark:text-gray-400">Keep me logged in</span>
            </div>
            <a href="/reset-password" className="text-sm text-brand-500 hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full">
            Login Akun
          </Button>
        </form>
      </div>
    </div>
  );
}
