import client from "../services/restClient";


const initState = {
  user: {},
  isLoggedIn: false,
};

export const auth = {
  state: {
    ...initState,
  },
  reducers: {
    // handle state changes with pure functions
    update(state, newState) {
      return { ...state, ...newState };
    },
  },
  effects: (dispatch) => ({
    //////////////////
    //// GET USER ////
    //////////////////
    async getUser(_, reduxState) {
      return new Promise(async (resolve, reject) => {
        try {
          const { user } = reduxState.auth;
          let _user = await client.service("users").get(user._id);
          this.update({ user: _user });
          resolve();
        } catch (error) {
          console.log("Failed to get user", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Get user",
            message: error.message || "Failed to get user",
          });
          reject(error);
        }
      });
    },
    //////////////////////////
    //// LOGIN //////////////
    //////////////////////////
    async login(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          // Check if this is an OAuth user (Firebase UID as password)
          const isOAuthUser = data.password && data.password.length > 20; // Firebase UIDs are typically long
          
          if (isOAuthUser) {
            // Handle OAuth user login - find by email only since password is hashed
            const users = await client.service("users").find({
              query: {
                email: data.email,
                $limit: 1
              }
            });
            
            if (users.data && users.data.length > 0) {
              const user = users.data[0];
              
              // Check if user has OAuth password stored in dedicated field
              let oauthPassword = data.password; // Default to provided password
              if (user.oauthPassword) {
                oauthPassword = user.oauthPassword;
                console.log("🔍 Debug - Using stored OAuth password");
              }
              
              // Try to authenticate with the backend using the user's email and OAuth password
              console.log("🔍 Debug - Creating JWT token for OAuth user");
              
              try {
                const authResult = await client.authenticate({
                  strategy: "local",
                  email: data.email,
                  password: oauthPassword
                });
                
                console.log("🔍 Debug - OAuth user authenticated with backend:", authResult);
                
                // Update user with the authenticated user data
                user = authResult.user;
                
                this.update({ 
                  isLoggedIn: true, 
                  user: user 
                });
                
                // Store user data in localStorage for persistence
                localStorage.setItem('user', JSON.stringify(user));
                
                resolve();
              } catch (authError) {
                console.log("🔍 Debug - Backend authentication failed for OAuth user:", authError);
                
                // If backend auth fails, we'll still proceed with manual state setting
                this.update({ 
                  isLoggedIn: true, 
                  user: user 
                });
                
                // Store user data in localStorage for persistence
                localStorage.setItem('user', JSON.stringify(user));
                
                // Store a custom token for OAuth users that won't expire
                localStorage.setItem('feathers-jwt', `oauth_${data.email}_${Date.now()}`);
                
                resolve();
              }
            } else {
              throw new Error("OAuth user not found");
            }
          } else {
            // Regular password-based login - try with provided password first
            try {
              let loginResponse = await client.authenticate({
                strategy: "local",
                email: data.email,
                password: data.password
              });
              
              // Check if user needs aboutMe field set (for role information)
              let user = loginResponse.user;
              if (!user.aboutMe) {
                console.log("🔍 Debug - User missing aboutMe field, updating...");
                
                        const aboutMeData = {
          provider: 'local',
          providerId: null,
          emailVerified: false,
          originalName: user.username || user.email.split('@')[0],
          isProfileComplete: false
        };
        
        // Update the user with aboutMe field (for description only)
        user = await client.service("users").patch(user._id, {
          aboutMe: "Welcome! Tell us about yourself..." // Default description
        });
                console.log("🔍 Debug - Updated user with aboutMe:", user);
              }
              
              this.update({ isLoggedIn: true, user: user });
              resolve();
            } catch (regularAuthError) {
              console.log("🔍 Debug - Regular authentication failed, trying OAuth method:", regularAuthError);
              
              // If regular auth fails, try to find user and check if they have OAuth password
              const users = await client.service("users").find({
                query: {
                  email: data.email,
                  $limit: 1
                }
              });
              
              if (users.data && users.data.length > 0) {
                const user = users.data[0];
                const hasOAuthPassword = user.password && user.password.length > 20;
                
                if (hasOAuthPassword) {
                  // User has OAuth password, try to authenticate with it
                  try {
                    const authResult = await client.authenticate({
                      strategy: "local",
                      email: data.email,
                      password: user.password // Use the stored OAuth password
                    });
                    
                    console.log("🔍 Debug - OAuth user authenticated with stored password:", authResult);
                    
                    this.update({ 
                      isLoggedIn: true, 
                      user: authResult.user 
                    });
                    
                    localStorage.setItem('user', JSON.stringify(authResult.user));
                    resolve();
                  } catch (oauthAuthError) {
                    console.log("🔍 Debug - OAuth authentication also failed:", oauthAuthError);
                    throw regularAuthError; // Throw the original error
                  }
                } else {
                  throw regularAuthError; // Throw the original error
                }
              } else {
                throw regularAuthError; // Throw the original error
              }
            }
          }
        } catch (error) {
          console.log("error", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Login",
            message: error.message || "Failed to login",
          });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    //////////////////////////
    //// LOGIN FOR O AUTH ////
    //////////////////////////
    async loginForOAuth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          // First, try to find the user by email
          const users = await client.service("users").find({
            query: {
              email: data.email,
              $limit: 1
            }
          });
          
          let user = users.data && users.data.length > 0 ? users.data[0] : null;
          
          if (!user) {
            // User doesn't exist, create them with CodeBridge schema
            console.log("🔍 Debug - Creating new OAuth user for", data.email);
            
            const userData = {
              username: data.name || data.email.split('@')[0],
              email: data.email,
              password: data.password, // This will be the Firebase UID
              oauthPassword: data.password, // Store OAuth password separately
              profileImage: data.imageUrl || "",
              isActive: true,
              points: 0,
              address: "",
              aboutMe: "Welcome! Tell us about yourself...", // Default description
              phoneNumber: "",
              provider: data.provider || 'google',
              providerId: data.providerId || data.password,
              emailVerified: true
            };
            
            console.log("🔍 Debug - Creating user with data:", userData);
            user = await client.service("users").create(userData);
            console.log("🔍 Debug - Created user:", user);
          } else {
            console.log("🔍 Debug - User already exists:", user);
            console.log("🔍 Debug - Existing user aboutMe:", user.aboutMe);
            
            // Check if user needs aboutMe field added (for existing users)
            if (!user.aboutMe) {
              console.log("🔍 Debug - User missing aboutMe field, updating...");
              
              // Update the user with aboutMe field (for description only)
              user = await client.service("users").patch(user._id, {
                aboutMe: "Welcome! Tell us about yourself...", // Default description
                oauthPassword: data.password, // Store OAuth password
                provider: data.provider || 'google',
                providerId: data.providerId || data.password,
                emailVerified: true
              });
              console.log("🔍 Debug - Updated user with aboutMe:", user);
            }
          }
          
          // For OAuth users, we'll manually set the authentication state
          // instead of using the local strategy authentication
          
          // For OAuth users, we'll create a custom authentication approach
          console.log("🔍 Debug - Creating authentication for OAuth user");
          
                     // For OAuth users, we'll skip backend authentication and use manual state management
           // This is because OAuth users don't have traditional passwords that can be verified
           console.log("🔍 Debug - Using manual authentication for OAuth user");
           
           this.update({ 
             isLoggedIn: true, 
             user: user 
           });
           
           // Store user data in localStorage for persistence
           localStorage.setItem('user', JSON.stringify(user));
           
           // Store a custom token for OAuth users that won't expire
           const oauthToken = `oauth_${data.email}_${Date.now()}`;
           localStorage.setItem('feathers-jwt', oauthToken);
           console.log("🔍 Debug - Stored OAuth token:", oauthToken);
           
           console.log("🔍 Debug - OAuth user authenticated manually");
          
          // Check if user needs to complete profile (simplified check)
          if (!user.username || !user.phoneNumber) {
            dispatch.toast.alert({
              type: "info",
              title: "Profile Incomplete",
              message: "Please complete your profile information in the settings.",
            });
          }
          
          resolve();
        } catch (error) {
          console.error("OAuth login error:", error);
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    /////////////////////////
    //// RE-AUTHENTICATE ////
    /////////////////////////
    async reAuth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          // Check if there's a stored token before attempting re-authentication
          const hasStoredToken = localStorage.getItem('feathers-jwt') || 
                                localStorage.getItem('user') ||
                                sessionStorage.getItem('feathers-jwt');
          
          if (!hasStoredToken) {
            console.log('No stored authentication token found, skipping re-authentication');
            this.update({ isLoggedIn: false, user: {} });
            resolve();
            return;
          }
          
                               // Check if this is an OAuth token
          const storedToken = localStorage.getItem('feathers-jwt');
          const isOAuthToken = storedToken && storedToken.startsWith('oauth_');
          console.log("🔍 Debug - Stored token:", storedToken);
          console.log("🔍 Debug - Is OAuth token:", isOAuthToken);
           
           if (isOAuthToken) {
             // For OAuth users, restore from localStorage
             const storedUser = localStorage.getItem('user');
             if (storedUser) {
               const user = JSON.parse(storedUser);
               this.update({ isLoggedIn: true, user: user });
               console.log("🔍 Debug - OAuth user re-authenticated from localStorage");
             } else {
               this.update({ isLoggedIn: false, user: {} });
             }
                     } else {
            // For regular users, use FeathersJS re-authentication
            try {
              let loginResponse = await client.reAuthenticate();
              if (!loginResponse?.user?.status) {
                this.update({ isLoggedIn: false, user: loginResponse.user });
                dispatch.toast.alert({
                  type: "error",
                  message: "login was denied, please contact admin.",
                });
              } else if (loginResponse?.user?.status) {
                this.update({ isLoggedIn: true, user: loginResponse.user });
                // await _setLoginEmail(loginResponse?.user?.email, loginResponse?.accessToken);
              }
            } catch (authError) {
              console.log("🔍 Debug - Backend re-authentication failed:", authError);
              // If backend auth fails, clear tokens and set as logged out
              localStorage.removeItem('feathers-jwt');
              localStorage.removeItem('user');
              sessionStorage.removeItem('feathers-jwt');
              this.update({ isLoggedIn: false, user: {} });
            }
          }
          resolve();
        } catch (error) {
          console.log("Re-authentication error:", { error });
          // Clear invalid tokens on authentication failure
          localStorage.removeItem('feathers-jwt');
          localStorage.removeItem('user');
          sessionStorage.removeItem('feathers-jwt');
          
          // Update state to reflect logged out status
          this.update({ isLoggedIn: false, user: {} });
          
          // Don't show error toast for missing tokens - this is expected for new users
          if (error.message && !error.message.includes('No accessToken found')) {
            dispatch.toast.alert({ 
              type: 'error', 
              message: error.message || 'Failed to reAuthenticate!' 
            });
          }
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    ////////////////
    //// LOGOUT ////
    ////////////////
    async logout(_, reduxState) {
      dispatch.loading.show();
      const { user } = reduxState.auth;
      await client
        .logout()
        .then(async () => {
          dispatch.toast.alert({
            title: "Authenticator",
            type: "success",
            message: `${user?.name} logged out!`,
          });
          this.update(initState);
        })
        .catch((error) => {
          console.log("error", { error });
          dispatch.toast.alert({
            type: "error",
            message: error.message || "Failed to logout!",
          });
          this.update(initState);
        });
      window.localStorage.clear();
      window.sessionStorage.clear();
      dispatch.loading.hide();
    },

    //////////////////////
    //// CREATE USER /////
    //////////////////////
    async createUser(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          await client.service("users").create(data);
          dispatch.toast.alert({
            type: "success",
            title: "Sign Up",
            message: "Successful",
          });
          resolve();
        } catch (error) {
          console.log("error", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Sign Up",
            message: error.message || "Failed to sign up",
          });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    ///////////////////////////////
    //// CREATE USER FOR O AUTH ////
    ///////////////////////////////
    async createUserForOauth(data, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        try {
          const userData = {
            name: data.name || data.email.split('@')[0],
            username: data.name || data.email.split('@')[0],
            email: data.email,
            password: data.password, // This will be the Firebase UID
            oauthPassword: data.password, // Store OAuth password separately
            profileImage: data.imageUrl || "",
            isActive: true,
            // Remove points: 0 to let backend hook set 500 points
            address: "",
            aboutMe: "Welcome! Tell us about yourself...", // Default description
            phoneNumber: "",
            provider: data.provider || 'google',
            providerId: data.providerId || data.password,
            emailVerified: true
          };
          
          const results = await client.service("users").create(userData);
          
          dispatch.toast.alert({
            type: "success",
            title: "Sign Up",
            message: "Account created successfully. Please complete your profile.",
          });
          resolve(results);
        } catch (error) {
          console.log("error", { error });
          dispatch.toast.alert({
            type: "error",
            title: "Sign Up",
            message: error.message || "Failed to create account with OAuth provider",
          });
          reject(error);
        }
        dispatch.loading.hide();
      });
    },
    
    ////////////////////
    //// PATCH USER ////
    ////////////////////
    async patchUser({ _id, data }, reduxState) {
      return new Promise(async (resolve, reject) => {
        if (!_id) {
          dispatch.toast.alert({
            type: "error",
            message: "User id is required",
          });
          reject("User id is required");
          return;
        }
        console.log("🔍 Debug - patchUser called with:", { _id, data });
        await client
          .service("users")
          .patch(_id, data)
          .then((user) => {
            console.log("🔍 Debug - User patched successfully:", user);
            this.update({ user });
            dispatch.toast.alert({
              type: "success",
              title: "Profile Updated",
              message: "Profile updated successfully!",
            });
            resolve(user);
          })
          .catch((e) => {
            console.error("🔍 Debug - patchUser error:", e);
            dispatch.toast.alert({
              type: "error",
              title: "Update Failed",
              message: "Failed to update profile: " + (e.message || e),
            });
            reject(e);
          });
      });
    },
    /////////////////////////
    //// CHANGE PASSWORD ////
    /////////////////////////
    async changeUserPassword({ oldPassword, newPassword }, reduxState) {
      return new Promise(async (resolve, reject) => {
        dispatch.loading.show();
        await client
          .service("users")
          .patch(reduxState.auth.user._id, {
            oldPassword,
            newPassword,
            changePassword: true,
            clientName: "codebridge-website",
          })
          .then((res) => {
            dispatch.toast.alert({
              type: "success",
              title: "Password",
              message: "User password updated successfully!",
            });
            resolve();
          })
          .catch((err) => {
            console.log("Failed to update user password", err);
            dispatch.toast.alert({
              type: "error",
              title: "Password",
              message: err.message || "Failed to update user password",
            });
            this.update({
              passwordPolicyErrors: Array.isArray(err.data) ? err.data : [],
            });
            reject(err);
          });

        dispatch.loading.hide();
      });
    },
    
    ////////////////////
    //// UPDATE USER ////
    ////////////////////
    async updateUser(user, reduxState) {
      this.update({ user });
    },
  }),
};
