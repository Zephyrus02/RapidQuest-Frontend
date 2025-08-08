import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  MessageCircle,
  Phone,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import api from "../services/api";

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;
      // Normalize the user object to use `_id` which the app expects.
      const normalizedUser = { ...user, _id: user.id };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      onLogin();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to log in."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
        phone,
        bio: bio || "Hey there! I am using WhatsApp.",
        profilePhoto:
          profilePhoto ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      });

      const { user, token } = response.data;
      // Normalize the user object to use `_id` which the app expects.
      localStorage.setItem("token", token);
      console.log("User data:", user);
      localStorage.setItem("user", JSON.stringify(user));
      onLogin();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to sign up."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-wa-bg-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <MessageCircle size={64} className="mx-auto text-wa-green" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-wa-text-dark mt-4">
            WhatsApp
          </h1>
          <p className="text-gray-600 dark:text-wa-text-secondary-dark mt-2">
            {isLoginView ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <div className="bg-white dark:bg-wa-panel-bg-dark shadow-2xl rounded-lg p-8">
          <form onSubmit={isLoginView ? handleLoginSubmit : handleSignupSubmit}>
            {!isLoginView && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                    placeholder="Your Name"
                    required
                  />
                </div>
              </div>
            )}
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                  placeholder="example@domain.com"
                  required
                />
              </div>
            </div>
            {!isLoginView && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                  htmlFor="phone"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                    placeholder="123-456-7890"
                    required
                  />
                </div>
              </div>
            )}
            <div className="mb-6">
              <label
                className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {!isLoginView && (
              <>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                    htmlFor="confirm-password"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                    htmlFor="bio"
                  >
                    Bio (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Info className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="bio"
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                      placeholder="A short bio about yourself"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 dark:text-wa-text-dark text-sm font-bold mb-2"
                    htmlFor="profilePhoto"
                  >
                    Profile Photo URL (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="profilePhoto"
                      type="text"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-wa-hover-dark border border-gray-300 dark:border-wa-border-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green text-gray-900 dark:text-wa-text-dark"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="text-red-500 text-xs italic mb-4">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-wa-green hover:bg-wa-green-dark text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading
                  ? "Processing..."
                  : isLoginView
                  ? "Log In"
                  : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError("");
            }}
            className="inline-block align-baseline font-bold text-sm text-wa-green hover:text-wa-green-dark"
          >
            {isLoginView
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
