import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const sampleUsers = [
  { email: "student@fpt.edu.vn", password: "student123", role: "student", name: "Student User" },
  { email: "teacher@fpt.edu.vn", password: "teacher123", role: "teacher", name: "Teacher User" },
  { email: "admin@fpt.edu.vn", password: "admin123", role: "admin", name: "Admin User" }
];

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password");
      return;
    }
    
    const user = sampleUsers.find(
      (user) => user.email === credentials.email && user.password === credentials.password
    );
    
    if (user) {
      console.log("Logging in with:", user);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify({
        email: user.email,
        name: user.name,
        role: user.role
      }));
      navigate("/");
    } else {
      setError("Invalid email or password. Try one of the sample accounts shown below.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="text-2xl font-bold text-orange-500">
            FPT University
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-16 w-auto"
              src="/images/logo.jpg"
              alt="FPT Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                to="/register"
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Sign in
              </button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Register now
                </Link>
              </p>
            </div>
          </form>
          
          {/* Sample credentials */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Sample Login Credentials</h3>
            <div className="mt-4 bg-gray-50 rounded-md p-4 text-xs">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Student Account:</p>
                  <p><span className="text-gray-500">Email:</span> student@fpt.edu.vn</p>
                  <p><span className="text-gray-500">Password:</span> student123</p>
                </div>
                <div>
                  <p className="font-semibold">Teacher Account:</p>
                  <p><span className="text-gray-500">Email:</span> teacher@fpt.edu.vn</p>
                  <p><span className="text-gray-500">Password:</span> teacher123</p>
                </div>
                <div>
                  <p className="font-semibold">Admin Account:</p>
                  <p><span className="text-gray-500">Email:</span> admin@fpt.edu.vn</p>
                  <p><span className="text-gray-500">Password:</span> admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} FPT University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
