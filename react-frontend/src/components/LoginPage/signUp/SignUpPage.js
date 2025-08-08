import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import client from "../../../services/restClient";
import _ from "lodash";
import SignUpStep from "./SignUpStep";
import { Toast } from "primereact/toast";
import { auth, providerForGoogle, isConfigured } from "../Firebase.config";
import { signInWithPopup } from "firebase/auth";

import { emailRegex } from "../../../utils/regex";
import { codeGen } from "../../../utils/codegen";
import EnterDetailsStep from "./step/EnterDetails";
import VerificationStep from "./step/Verification";
import SetUpPassword from "./step/SetUpPassword";
import AppFooter from "../../Layouts/AppFooter";
import "./SignUpPage.css";

const SignUpPage = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState();
  const [sysCode, setSysCode] = useState();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [step, setStep] = useState(1);

  const toast = useRef(null);
  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: message,
      life: 3000,
    });
  };

  const showFailure = (summary, message) => {
    toast.current.show({
      severity: "error",
      summary: summary,
      detail: message,
      life: 3000,
    });
  };

  // Google Sign In Handler
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
    try {
      const result = await signInWithPopup(auth, providerForGoogle);
      const user = result.user;
      
      // Check if user already exists
      const existingUser = await client.service("users").find({
        query: {
          email: user.email,
          $limit: 1
        }
      });

      if (existingUser.data.length > 0) {
        props.alert({
          title: "Account Already Exists",
          type: "warning",
          message: "An account with this email already exists. Please login instead.",
        });
        navigate("/login");
        return;
      }

      // Create new user with Google OAuth data
      const userData = {
        name: user.displayName || user.email.split('@')[0], // Map to name field
        username: user.displayName || user.email.split('@')[0], // Map to username field
        email: user.email,
        password: user.uid, // Use UID as password for OAuth users
        profileImage: user.photoURL, // Map to profileImage field
        isActive: true, // Set user as active
        // Remove points: 0 to let backend hook set 500 points
        address: "", // Empty address
        aboutMe: JSON.stringify({
          provider: 'google',
          providerId: user.uid,
          emailVerified: user.emailVerified,
          originalName: user.displayName
        }),
        phoneNumber: "" // Empty phone number
      };

      await props.createUserForOauth(userData);
      props.alert({
        title: "Account Created Successfully",
        type: "success",
        message: "Your account has been created with Google. You can now login.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = error.message || "Failed to sign in with Google";
      
      // Handle specific Firebase errors with user-friendly messages
      if (error.code === 'auth/user-disabled') {
        errorMessage = "This Google account has been disabled. Please contact support or try with a different account.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Popup was blocked by your browser. Please allow popups for this site and try again.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-up was cancelled. Please try again.";
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

  const _getInviteEmail = async () => {
    return await client.service("userInvites").find({
      query: {
        emailToInvite: email,
      },
    });
  };

  const _getUserEmail = async () => {
    return await client.service("users").find({
      query: {
        email: email,
      },
    });
  };

  const _setCounter = async (id, count) => {
    return await client.service("userInvites").patch(id, {
      sendMailCounter: count,
    });
  };

  const onFinishStepOne = async () => {
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return;
    }
    if (!name.length) {
      setNameError("Username is required");
      return;
    }
    resendMail();
  };

  const validateEmail = async () => {
    let loginEmailData = await _getInviteEmail();
    if (loginEmailData.data.length === 0) {
      const _login = {
        emailToInvite: email,
        access: null,
        code: codeGen(),
        sendMailCounter: 0,
      };
      const data = await client.service("userInvites").create(_login);
      loginEmailData.data = [data];
    }
    return loginEmailData.data[0];
  };

  const validateEmailSending = (loginEmailData) => {
    if (loginEmailData?.sendMailCounter >= 3) {
      showFailure("Mail counter", "too many tries, please contact your admin");
      return false;
    }
    return true;
  };

  const validateCode = (loginEmailData) => {
    if (loginEmailData?.code > 10000) return true;
    showFailure("Code Generator", "code not found, please contact your admin");
    return false;
  };

  const resendMail = async () => {
    const loginEmailData = await validateEmail();
    if (!validateEmailSending(loginEmailData)) return;
    if (!validateCode(loginEmailData)) return;
    setSysCode(loginEmailData.code);
    const _mail = {
      name: "onCodeVerifyEmail",
      type: "signup",
      from: "info@cloudbasha.com",
      recipients: [email],
      status: true,
      data: { name: name, code: loginEmailData.code },
      subject: "email code verification process",
      templateId: "onCodeVerify",
    };
    setLoading(true);
    await client.service("mailQues").create(_mail);
    props.alert({
      title: "Verification email sent.",
      type: "success",
      message: "Proceed to check your email inbox.",
    });
    _setCounter(loginEmailData?._id, Number(++loginEmailData.sendMailCounter));
    setLoading(false);
    setStep(2);
    showSuccess(`Verification email sent to ${email}`);
  };

  const onFinishStepTwo = () => {
    if (!code || code.length !== 6) {
      setCodeError("Please enter the code");
      return;
    }
    setStep(3);
  };

  const onFinishStepThree = () => {
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Confirm Password is not correct");
      return;
    }

    signup();
  };

  const validate = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Please Enter a valid email");
      isValid = false;
    }

    if (!name.length) {
      setNameError("Username is required");
      isValid = false;
    } else if (name.length < 3) {
      setNameError("Username must be at least 3 characters long");
      isValid = false;
    }
    if (!password.length) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(
        "Must be at least 6 characters long and have at least one letter, digit, uppercase, lowercase and symbol",
      );
      isValid = false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Confirm Password is not correct");
      isValid = false;
    }

    return isValid;
  };

  const signup = async () => {
    const user = await _getUserEmail();
    if (validate()) {
      try {
        if (user?.data?.length === 0) {
          props
            .createUser({
              name: name,
              username: name,
              email: email,
              password,
              status: true,
            })
            .then(async () => {
              navigate("/login");
            });
          props.alert({
            title: "User account created successfully.",
            type: "success",
            message: "Proceed to login.",
          });
        } else {
          navigate("/login");
          props.alert({
            title: "User account already created.",
            type: "warn",
            message: "Proceed to login.",
          });
        }
      } catch (error) {
        props.alert({
          title: "User account failed to create.",
          type: "error",
          message: error.message || "Failed to sign in.",
        });
      }
    } else {
      props.alert({
        title: "Sign up failed.",
        type: "error",
        message: "Please contact admin.",
      });
      return;
    }
  };

  return (
    <div className="signup-page">
      <Toast ref={toast} position="bottom-center" />
      <div className="signup-header">
        <div className="signup-header-content">
          <div className="basis-auto">
            <p className="text-xl font-semibold text-primary"></p>
          </div>
          <div className="signup-step-container">
            <SignUpStep step={step} />
          </div>
          <div className="basis-auto"></div>
        </div>
        <div className="signup-back-link">
          <Link
            to="/login"
            className="flex items-center gap-2 font-semibold text-primary"
          >
            <i className="pi pi-angle-left"></i>
            <p>Back to login</p>
          </Link>
        </div>
      </div>
      <div className="signup-main-content">
        {step === 1 && (
          <EnterDetailsStep
            email={email}
            setEmail={setEmail}
            emailError={emailError}
            setEmailError={setEmailError}
            name={name}
            setName={setName}
            nameError={nameError}
            setNameError={setNameError}
            onNext={onFinishStepOne}
            loading={loading}
            onGoogleSignIn={handleGoogleSignIn}
          />
        )}
        {step === 2 && (
          <VerificationStep
            code={code}
            sysCode={sysCode}
            setCode={setCode}
            codeError={codeError}
            setCodeError={setCodeError}
            onNext={onFinishStepTwo}
            resendCode={resendMail}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {step === 3 && (
          <SetUpPassword
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            confirmPasswordError={confirmPasswordError}
            setConfirmPasswordError={setConfirmPasswordError}
            onNext={onFinishStepThree}
            loading={loading}
          />
        )}
      </div>
      <AppFooter />
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, passwordPolicyErrors } = state.auth;
  return { isLoggedIn, passwordPolicyErrors };
};
const mapDispatch = (dispatch) => ({
  createUser: (data) => dispatch.auth.createUser(data),
  alert: (data) => dispatch.toast.alert(data),
  createUserForOauth: (data) => dispatch.auth.createUserForOauth(data),
});

export default connect(mapState, mapDispatch)(SignUpPage);
