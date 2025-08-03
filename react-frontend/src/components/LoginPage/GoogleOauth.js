import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { auth, providerForGoogle } from "./Firebase.config";
import { signInWithPopup } from "firebase/auth";

const GoogleOauth = (props) => {
  const { type } = props;
  const navigate = useNavigate();

  useEffect(() => {
    if (props.isLoggedIn === true) navigate("/");
  }, [props.isLoggedIn]);

  //handle google Oauth
  const handleGoogleOauth = () => {
    console.log("Starting Google OAuth process...");
    console.log("Auth object:", auth);
    console.log("Provider object:", providerForGoogle);
    
    if (!auth) {
      console.error("Auth is null - Firebase not initialized");
      props.alert({
        severity: "error",
        summary: "Firebase Error",
        detail: "Firebase authentication is not initialized. Please check configuration.",
      });
      return;
    }
    
    // Show loading state
    props.alert({
      severity: "info",
      summary: "Google Sign-In",
      detail: "Opening Google account selector...",
    });
    
    signInWithPopup(auth, providerForGoogle)
      .then((data) => {
        console.log("Google Sign-In successful:", data);
        
        // Show success message
        props.alert({
          severity: "success",
          summary: "Google Sign-In",
          detail: `Signed in as ${data.user.email}`,
        });
        
        if (type === "login") {
          localStorage.setItem("userPhoto", data.user.photoURL);
          const email = data.user.email
            ? data.user.email
            : data.user.providerData[0]?.email;
          const password = data.user.uid;
          const name = data.user.displayName || data.user.providerData[0]?.displayName || email.split('@')[0];
          const imageUrl = data.user.photoURL || data.user.providerData[0]?.photoURL;
          const provider = 'google';
          const providerId = data.user.uid;
          
          props
            .loginForOAuth({ 
              email, 
              password, 
              name, 
              imageUrl, 
              provider, 
              providerId 
            })
            .then(() => {
              navigate("/");
            })
            .catch((error) => {
              console.error("OAuth login failed:", error);
              navigate("/login");
            });
        } else {
          const name = data.user.providerData[0].displayName;
          const email = data.user.providerData[0].email
            ? data.user.providerData[0].email
            : data.user.email;
          const password = data.user.uid + "!";
          const imageUrl = data.user.providerData[0].photoURL
            ? data.user.providerData[0].photoURL
            : data.user.photoURL;
          const provider = data.user.providerData[0].providerId;
          const uId = data.user.providerData[0].uid;
          props
            .createUserForOauth({
              name,
              email,
              password,
              imageUrl,
              provider,
              uId,
            })
            .then((res) => {
              navigate("/login");
            })
            .catch(() => {
              navigate("/signup");
            });
        }
      })
      .catch((error) => {
        console.error("Google Sign-In Error:", error);
        let errorMessage = "Google Sign-In failed. Please try again.";
        
        if (error.code === "auth/operation-not-allowed") {
          errorMessage = "Google Sign-In is not enabled. Please contact support.";
        } else if (error.code === "auth/popup-closed-by-user") {
          errorMessage = "Sign-In was cancelled.";
        } else if (error.code === "auth/popup-blocked") {
          errorMessage = "Pop-up was blocked. Please allow pop-ups for this site.";
        } else if (error.code === "auth/unauthorized-domain") {
          errorMessage = `This domain (${window.location.hostname}) is not authorized for Google Sign-In. Please contact support or try using localhost:3000.`;
        } else if (error.code === "auth/network-request-failed") {
          errorMessage = "Network error. Please check your internet connection.";
        }
        
        props.alert({
          severity: "error",
          summary: "Google Sign-In Error",
          detail: errorMessage,
        });
      });
  };
  return (
    <>
      <Button
        onClick={handleGoogleOauth}
        style={{ background: "#fff", padding: "10px 30px" }}
        className="flex gap-20 items-center"
      >
        <i
          className="pi pi-google"
          style={{ color: "red", fontSize: "20px" }}
        ></i>
        <div
          style={{
            color: "#000",
            fontSize: "1.2rem",
            marginLeft: "20px",
          }}
        >
          {type === "login" ? "Login with Google" : "Sign up with Google"}
        </div>
      </Button>
    </>
  );
};

const mapState = (state) => {
  const { isLoggedIn, passwordPolicyErrors } = state.auth;
  return { isLoggedIn, passwordPolicyErrors };
};
const mapDispatch = (dispatch) => ({
  createUserForOauth: (data) => dispatch.auth.createUserForOauth(data),
  loginForOAuth: (data) => dispatch.auth.loginForOAuth(data),
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(GoogleOauth);
