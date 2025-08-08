import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import client from "../../services/restClient";
import { emailRegex } from "../../utils/regex";
import { auth, providerForGoogle, isConfigured } from "./Firebase.config";
import { signInWithPopup } from "firebase/auth";
import "./LoginPage.css";

const LoginPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = /login/.test(location.pathname);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [maskPassword, setMaskPassword] = useState(true);

  useEffect(() => {
    if (props.isLoggedIn === true) navigate("/", { replace: true });
  }, [props.isLoggedIn]);

  const onEnter = (e) => {
    if (e.key === "Enter") login();
  };

  const login = async () => {
    setLoading(true);
    if (validate()) {
      try {
        const loginResponse = await props.login({ email: username, password });
        
        if (loginResponse?.user) {
          try {
            // Save login history
            await client.service("loginHistory").create({
              userId: loginResponse.user._id,
            });
          } catch (historyError) {
            console.error("Failed to save login history:", historyError);
          }

          navigate("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        props.alert({
          title: "User Login failed.",
          type: "error",
          message: "Invalid Login",
        });
      }
    }
    setLoading(false);
  };

  const validate = () => {
    let isValid = true;
    setUsernameError(null);
    setPasswordError(null);

    if (!username.trim()) {
      setUsernameError("Please enter your email");
      isValid = false;
    } else if (!username.includes('@')) {
      setUsernameError("Please enter a valid email address");
      isValid = false;
    }
    if (password.length < 6) {
      setPasswordError(
        "Please enter a valid password. Must be at least 6 characters",
      );
      isValid = false;
    }
    return isValid;
  };

  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      props.alert({
        title: "Firebase Configuration Required",
        type: "warning",
        message: "Please configure Firebase settings in Firebase.config.js",
      });
      return;
    }

    setLoading(true);
    
    // Show loading message
    props.alert({
      title: "Google Sign-In",
      type: "info",
      message: "Opening Google account selector...",
    });
    
    try {
      const result = await signInWithPopup(auth, providerForGoogle);
      const user = result.user;
      
      // Show success message
      props.alert({
        title: "Google Sign-In",
        type: "success",
        message: `Signed in as ${user.email}`,
      });
      
      // Check if user exists in our database
      try {
        const existingUser = await client.service("users").find({
          query: {
            email: user.email,
            $limit: 1
          }
        });

        if (existingUser.data.length > 0) {
          // User exists, login with OAuth
          const name = user.displayName || user.email.split('@')[0];
          const imageUrl = user.photoURL;
          const provider = 'google';
          const providerId = user.uid;
          
          // Check if user already has OAuth password set
          const existingUserData = existingUser.data[0];
          const hasOAuthPassword = existingUserData.password && existingUserData.password.length > 20;
          
          // Store OAuth password in dedicated field (non-critical operation)
          try {
            console.log("🔍 Debug - Attempting to update user with OAuth password");
            const patchData = {
              oauthPassword: user.uid,
              provider: 'google',
              providerId: user.uid,
              emailVerified: user.emailVerified
            };
            
            // If user doesn't have a main password, set OAuth password as main password
            if (!existingUserData.password) {
              console.log("🔍 Debug - User has no main password, setting OAuth password as main password");
              patchData.password = user.uid;
            }
            
            await client.service("users").patch(existingUserData._id, patchData);
            console.log("🔍 Debug - Successfully updated user with OAuth password");
          } catch (updateError) {
            console.log("🔍 Debug - Failed to update user OAuth password (non-critical):", updateError);
            // Don't throw or propagate this error - it's not critical for login
          }
          
          // Check if user has stored OAuth password
          let oauthPassword = user.uid; // Default to Firebase UID
          if (existingUserData.oauthPassword) {
            oauthPassword = existingUserData.oauthPassword;
            console.log("🔍 Debug - Using stored OAuth password for Google Sign-In");
          }
          
          // For now, always use the OAuth method to ensure it works
          console.log("🔍 Debug - Using OAuth method for Google Sign-In");
          await props.loginForOAuth({ 
            email: user.email, 
            password: user.uid,
            name,
            imageUrl,
            provider,
            providerId
          });
          navigate("/");
        } else {
          // New user, create account
          const userData = {
            username: user.displayName || user.email.split('@')[0],
            email: user.email,
            password: user.uid,
            oauthPassword: user.uid, // Store OAuth password separately
            profileImage: user.photoURL,
            isActive: true,
            points: 0,
            address: "",
            aboutMe: "Welcome! Tell us about yourself...", // Default description
            phoneNumber: "",
            provider: 'google',
            providerId: user.uid,
            emailVerified: user.emailVerified
          };

          await props.createUserForOauth(userData);
          navigate("/");
        }
      } catch (error) {
        console.error("OAuth error:", error);
        props.alert({
          title: "Authentication Error",
          type: "error",
          message: "Failed to authenticate with Google. Please try again.",
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = error.message || "Failed to sign in with Google";
      
      // Handle specific Firebase errors with user-friendly messages
      if (error.code === 'auth/user-disabled') {
        errorMessage = "This Google account has been disabled. Please contact support or try with a different account.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = "An account already exists with the same email address but different sign-in credentials.";
      }
      
      props.alert({
        title: "Google Sign In Failed",
        type: "error",
        message: errorMessage,
      });
    }
    setLoading(false);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page or show modal
    console.log("Forgot password clicked");
    props.alert({
      title: "Forgot Password",
      type: "info",
      message: "Forgot password functionality will be implemented soon.",
    });
  };

  const handleSignUp = () => {
    // Navigate to sign up page
    navigate("/signup");
  };

  return (
    <div className="login-page relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Redeemo</h2>
          </div>
          <div className="flex flex-1 justify-end">
            <button
              className="signup-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transition-colors"
              onClick={handleSignUp}
            >
              <span className="truncate">Sign Up</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content flex flex-1 items-center justify-center px-4 py-8">
          <div className="layout-content-container flex flex-col w-full max-w-md mx-auto">
            {/* Welcome Title */}
            <h2 className="page-title text-[#0d141c] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Welcome back</h2>

            {/* Username Input */}
            <div className="flex w-full px-4 py-3">
              <label className="form-label flex flex-col w-full">
                <p className="label-text text-[#0d141c] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="text"
                  placeholder="Enter your email"
                  className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-14 placeholder:text-[#49709c] p-4 text-base font-normal leading-normal ${usernameError ? 'error' : ''}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={onEnter}
                />
                {usernameError && (
                  <p className="error-text text-red-500 text-sm mt-1">{usernameError}</p>
                )}
              </label>
            </div>

            {/* Password Input */}
            <div className="flex w-full px-4 py-3">
              <label className="form-label flex flex-col w-full">
                <p className="label-text text-[#0d141c] text-base font-medium leading-normal pb-2">Password</p>
                <div className="password-input-container relative">
                  <input
                    type={maskPassword ? "password" : "text"}
                    placeholder="Enter your password"
                    className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-14 placeholder:text-[#49709c] p-4 text-base font-normal leading-normal pr-12 ${passwordError ? 'error' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={onEnter}
                  />
                  <button
                    type="button"
                    className="password-toggle absolute right-3 top-1/2 transform -translate-y-1/2 text-[#49709c] hover:text-[#0d141c] transition-colors"
                    onClick={() => setMaskPassword(!maskPassword)}
                  >
                    <i className={`pi ${maskPassword ? 'pi-eye' : 'pi-eye-slash'}`}></i>
                  </button>
                </div>
                {passwordError && (
                  <p className="error-text text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </label>
            </div>

            {/* Forgot Password Link */}
            <p 
              className="forgot-password text-[#49709c] text-sm font-normal leading-normal pb-3 pt-1 px-4 underline cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </p>

            {/* Login Button */}
            <div className="flex w-full px-4 py-3">
              <button
                className={`login-btn flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#095fc2] hover:bg-blue-700'}`}
                onClick={login}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="truncate">Logging in...</span>
                  </>
                ) : (
                  <span className="truncate">Login</span>
                )}
              </button>
            </div>

            {/* Google Sign In Button */}
            <div className="flex w-full px-4 py-3">
              <button
                className="google-btn flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200 transition-colors"
                onClick={handleGoogleSignIn}
              >
                <i className="pi pi-google mr-2"></i>
                <span className="truncate">Sign in with Google</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p 
              className="signup-link text-[#49709c] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleSignUp}
            >
              Don't have an account? Sign up now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapState = (state) => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
  };
};

const mapDispatch = (dispatch) => ({
  login: (data) => dispatch.auth.login(data),
  alert: (data) => dispatch.toast.alert(data),
  loginForOAuth: (data) => dispatch.auth.loginForOAuth(data),
  createUserForOauth: (data) => dispatch.auth.createUserForOauth(data),
});

export default connect(mapState, mapDispatch)(LoginPage);
