import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { setIsLogin, setIdToken, setLoginStatus } from "../../store/authSlice";
import {
  signInUserEmailAndPass,
  createUserEmailAndPass,
  signOutUser,
  signInWithGoogle,
} from "../../firebase/auth";

const Auth = () => {
  // Redux state and dispatch
  const isLogin = useSelector((state) => state.auth.isLogin);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state for form data
  const [authData, setAuthData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Local state for form errors
  const [formErrors, setFormErrors] = useState({});

  // Login handler
  const loginHandler = async (email, password) => {
    const response = await signInUserEmailAndPass(email, password);
    const token = response.user.accessToken;

    // Store token in local storage and update redux state
    localStorage.setItem("idToken", token);
    dispatch(setIdToken(token));
    dispatch(setLoginStatus());

    // Navigate to home page after successful login
    navigate("/home");
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAuthData({ ...authData, [name]: value });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!authData.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(authData.email)) {
      errors.email = "Email is invalid.";
    }

    if (!authData.password) {
      errors.password = "Password is required.";
    } else if (authData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!isLogin && !authData.name) {
      errors.name = "Full name is required for signup.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const { email, password, name } = authData;

    try {
      if (isLogin) {
        await loginHandler(email, password);
      } else {
        // Signup and then login the user
        await createUserEmailAndPass(email, password);
        await loginHandler(email, password);
      }
      dispatch(setIsLogin(true));
    } catch (error) {
      console.error("Authentication error:", error.message);
    }
  };

  // Toggle between login and signup
  const toggleAuthMode = () => {
    dispatch(setIsLogin(!isLogin));
  };

  // Handle Google sign-in
  const loginWithGoogleHandler = async () => {
    try {
      const result = await signInWithGoogle();
      const token = result.token;

      // Store token in local storage and update redux state
      localStorage.setItem("idToken", token);
      dispatch(setIdToken(token));
      dispatch(setLoginStatus());
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  // Handle user sign-out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      localStorage.removeItem("idToken");
      dispatch(setIdToken(null));
      dispatch(setLoginStatus());
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-800 mb-6 text-center">
          {isLogin ? "Login" : "Signup"}
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Show full name field only if it's a signup form */}
          {!isLogin && (
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-800 font-semibold mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={authData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              />
              {formErrors.name && (
                <p className="text-red-600 text-sm">{formErrors.name}</p>
              )}
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-800 font-semibold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your Email"
              value={authData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {formErrors.email && (
              <p className="text-red-600 text-sm">{formErrors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-800 font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Your Password"
              value={authData.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {formErrors.password && (
              <p className="text-red-600 text-sm">{formErrors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-900 transition duration-300 w-full"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
          <button
            type="button"
            className="px-2 py-3 border border-black bg-red-400 w-full mt-3"
            onClick={loginWithGoogleHandler}
          >
            Login With Google
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-700 transition duration-300 w-full my-3"
            onClick={toggleAuthMode}
          >
            {isLogin
              ? "Don't Have an Account? Signup"
              : "Already Have an Account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
