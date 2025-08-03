import React from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { auth, providerForGoogle, isConfigured } from "../../Firebase.config";
import { signInWithPopup } from "firebase/auth";

const EnterDetailsStep = ({
  email,
  setEmail,
  emailError,
  setEmailError,
  name,
  setName,
  nameError,
  setNameError,
  onNext,
  loading,
  onGoogleSignIn,
}) => {
  const handleGoogleSignIn = async () => {
    if (!isConfigured) {
      return;
    }

    try {
      const result = await signInWithPopup(auth, providerForGoogle);
      const user = result.user;
      
      // Auto-fill the form with Google data
      setName(user.displayName || user.email.split('@')[0]);
      setEmail(user.email);
      setEmailError(null);
      setNameError(null);
      
      // Call the parent's Google sign-in handler
      if (onGoogleSignIn) {
        onGoogleSignIn(user);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="signup-form-container">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Sign up with email or Google</p>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        className="w-full mb-4 p-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 mobile-google-btn"
        onClick={handleGoogleSignIn}
        disabled={!isConfigured}
      >
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
          className="w-5 h-5"
        />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

              <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <InputText
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-3 border rounded-lg mobile-input ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
          </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <InputText
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-3 border rounded-lg mobile-input ${
              emailError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email address"
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>
      </div>

      <Button
        type="button"
        onClick={onNext}
        disabled={loading || !name.trim() || !email.trim()}
        className="w-full mt-6 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mobile-continue-btn"
      >
        {loading ? "Processing..." : "Continue"}
      </Button>
    </div>
  );
};

export default EnterDetailsStep;
