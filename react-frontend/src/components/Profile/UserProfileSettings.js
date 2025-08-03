import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import client from "../../services/restClient";
import "./UserProfileSettings.css";

const UserProfileSettings = (props) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    points: 0,
    profileImage: '',
    address: '',
    aboutMe: ''
  });
  const [loading, setLoading] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [imageUrlError, setImageUrlError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const toastRef = useRef(null);

  useEffect(() => {
    if (!props.isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load current user data
    if (props.user && props.user._id) {
      loadUserProfile();
    }
  }, [props.user]);

  const loadUserProfile = () => {
    const user = props.user;
    console.log("🔍 Debug - Loading user profile data:", user);
    
    let aboutMe = {};
    let aboutMeText = "";
    
    if (user.aboutMe) {
      try {
        aboutMe = JSON.parse(user.aboutMe);
        aboutMeText = aboutMe.originalAboutMe || "";
      } catch (error) {
        // If aboutMe is not JSON, treat it as simple text
        aboutMeText = user.aboutMe;
        aboutMe = {};
      }
    }
    
    console.log("🔍 Debug - Parsed aboutMe:", aboutMe);
    console.log("🔍 Debug - AboutMe text:", aboutMeText);
    
    setProfileData({
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      password: "", // Password is not loaded from user object, so it's empty
      address: user.address || "",
      aboutMe: aboutMeText,
      profileImage: user.profileImage || "",
      points: user.points || 0
    });
    
    // Check if profile is complete (has username and phone number)
    const isComplete = !!(user.username && user.phoneNumber);
    setIsProfileComplete(isComplete);
    
    // Determine user role based on email
    const userRole = user.email === 'khalidah.t4@gmail.com' ? 'admin' : 'user';
    setUserRole(userRole);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If profile image URL is changed, validate it
    if (field === 'profileImage' && value) {
      validateImageUrl(value);
    }
  };

  const handleImageUrlInput = (value) => {
    // Clear any previous errors
    setImageUrlError(null);
    
    // Update the profile image URL
    handleInputChange("profileImage", value);
    
    // Validate the URL if it's not empty
    if (value && value.trim() !== '') {
      validateImageUrl(value);
    }
  };

  const validateImageUrl = (url) => {
    // Basic URL validation
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:')) {
      // URL looks valid, no need to show error
      setImageUrlError(null);
      return true;
    } else if (url.trim() !== '') {
      // Show warning for invalid URL format
      setImageUrlError('Please enter a valid image URL starting with http://, https://, /, or data:');
      toastRef.current.show({
        severity: 'warn',
        summary: 'Invalid URL',
        detail: 'Please enter a valid image URL starting with http://, https://, /, or data:'
      });
      return false;
    }
    setImageUrlError(null);
    return true;
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      console.log("🔍 Debug - Saving profile data:", profileData);
      
      const updateData = {
        username: profileData.username,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        aboutMe: profileData.aboutMe // Store as simple text
      };

      // Add password to update if provided
      if (profileData.password && profileData.password.trim() !== '') {
        updateData.password = profileData.password;
      }

      // Add profile image to update if provided
      if (profileData.profileImage && profileData.profileImage.trim() !== '') {
        updateData.profileImage = profileData.profileImage;
      }

      console.log("🔍 Debug - Update data being sent:", updateData);

      await props.patchUser({
        _id: props.user._id,
        data: updateData
      });

      console.log("🔍 Debug - Profile saved successfully");

      setIsProfileComplete(true);
    } catch (error) {
      console.error("🔍 Debug - Profile update error:", error);
    }
    
    setLoading(false);
  };

  const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        // Calculate aspect ratio
        const aspectRatio = width / height;
        
        if (width > maxWidth || height > maxHeight) {
          if (aspectRatio > 1) {
            // Landscape image
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            // Portrait image
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output format based on input
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, {
            type: outputFormat,
            lastModified: Date.now()
          }));
        }, outputFormat, quality);
      };
      
      img.onerror = () => {
        // If image fails to load, return original file
        resolve(file);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.files[0];
    if (file) {
      try {
        console.log("🔍 Debug - Uploading image:", file);
        console.log("🔍 Debug - File size:", file.size, "bytes");
        console.log("🔍 Debug - File type:", file.type);
        
        // Check file size (5MB limit)
        if (file.size > 5000000) {
          toastRef.current.show({
            severity: 'error',
            summary: 'File Too Large',
            detail: 'Please select an image smaller than 5MB'
          });
          return;
        }
        
        // Always compress and resize the image for better performance
        console.log("🔍 Debug - Compressing and resizing image...");
        const processedFile = await compressImage(file, 300, 300, 0.8); // Resize to 300x300 for avatar
        console.log("🔍 Debug - Processed file size:", processedFile.size, "bytes");
        
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target.result;
          
          try {
            // Use the base64 data directly as the image URL
            const imageUrl = base64Data;
            console.log("🔍 Debug - Using base64 image URL");
            
            // Update the profile image URL in local state
            handleInputChange("profileImage", imageUrl);
            
            // Immediately update the user record in the database
            try {
              console.log("🔍 Debug - About to update database with image URL");
              
              const dbUpdate = await client.service("users").patch(props.user._id, {
                profileImage: imageUrl
              });
              
              console.log("🔍 Debug - Database update successful:", dbUpdate);
              console.log("🔍 Debug - Updated profileImage field:", dbUpdate.profileImage);
              
              // Refresh user data in Redux state
              try {
                const updatedUser = await client.service("users").get(props.user._id);
                console.log("🔍 Debug - Fetched updated user from database:", updatedUser);
                console.log("🔍 Debug - User profileImage field:", updatedUser.profileImage);
                
                props.updateUser(updatedUser);
                console.log("🔍 Debug - Redux state updated with new user data");
              } catch (reduxError) {
                console.error("🔍 Debug - Redux update error:", reduxError);
              }
              
              // Show success message
              toastRef.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Profile image uploaded and saved successfully!'
              });
            } catch (dbError) {
              console.error("🔍 Debug - Database update error:", dbError);
              toastRef.current.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Image uploaded but database update failed. Please save profile manually.'
              });
            }
          } catch (uploadError) {
            console.error("🔍 Debug - Upload error:", uploadError);
            
            // Fallback to local URL for now
            const localUrl = URL.createObjectURL(processedFile);
            console.log("🔍 Debug - Using local URL as fallback:", localUrl);
            handleInputChange("profileImage", localUrl);
            
            toastRef.current.show({
              severity: 'warn',
              summary: 'Upload Failed',
              detail: 'Image upload failed. Using local URL as fallback.'
            });
          }
        };
        
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error("🔍 Debug - Upload error:", error);
        
        // Fallback to local URL for now
        const localUrl = URL.createObjectURL(file);
        console.log("🔍 Debug - Using local URL as fallback:", localUrl);
        handleInputChange("profileImage", localUrl);
        
        toastRef.current.show({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Image saved locally. Please save profile to keep the image.'
        });
      }
    }
  };

  if (!props.isLoggedIn) {
    return null;
  }

  return (
    <div className="user-profile-settings">
      <Toast ref={toastRef} />
      
      <div className="profile-container">
        <Card title="Profile Settings" className="profile-card">
          <div className="profile-header">
            <div className="role-badge">
              <span className={`role-tag ${userRole}`}>
                {userRole.toUpperCase()}
              </span>
              {!isProfileComplete && (
                <span className="incomplete-badge">
                  Profile Incomplete
                </span>
              )}
            </div>
          </div>

          {/* Profile Image Section - Top Middle */}
          <div className="profile-image-section-top">
            <div className="profile-image-input-container">
              <div className="profile-image-preview">
                <img 
                  src={profileData.profileImage || "/default-avatar.png"} 
                  alt="Profile Preview" 
                  className="profile-image-preview-img"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
              <div className="profile-image-controls">
                <FileUpload
                  mode="basic"
                  name="profile-image"
                  accept="image/*"
                  maxFileSize={5000000} // Increased to 5MB
                  customUpload={true}
                  uploadHandler={handleImageUpload}
                  chooseLabel="Upload Photo"
                  className="image-upload-button"
                  auto
                />
                <div className="profile-image-url-section">
                  <InputText
                    id="profileImage"
                    value={profileData.profileImage}
                    onChange={(e) => handleImageUrlInput(e.target.value)}
                    className={`form-input ${imageUrlError ? 'error' : ''}`}
                    placeholder="Or paste image URL here (http://, https://, data:)"
                  />
                  {imageUrlError && (
                    <small className="error-text">{imageUrlError}</small>
                  )}
                  <small>Upload a photo or paste an image URL (supports http://, https://, data: URLs)</small>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <InputText
                  id="username"
                  value={profileData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="form-input"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <InputText
                  id="email"
                  value={profileData.email}
                  disabled
                  className="form-input disabled"
                />
                <small>Email cannot be changed</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <InputText
                  id="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className="form-input"
                  placeholder="Enter your phone number"
                  type="tel"
                  autoComplete="tel"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <InputText
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={profileData.password || ''}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="form-input"
                    placeholder="Enter new password (leave empty to keep current)"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    icon={showPassword ? "pi pi-eye-slash" : "pi pi-eye"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    severity="secondary"
                    text
                  />
                </div>
                <small>Leave empty to keep current password</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="points">Points</label>
                <InputText
                  id="points"
                  value={profileData.points}
                  disabled
                  className="form-input disabled"
                />
                <small>Points are earned through app usage</small>
              </div>
              
              {/* The profile image section was moved here */}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <InputTextarea
                id="address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="form-input"
                rows={3}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="aboutMe">About Me</label>
              <InputTextarea
                id="aboutMe"
                value={profileData.aboutMe}
                onChange={(e) => handleInputChange("aboutMe", e.target.value)}
                className="form-input"
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="form-actions">
              <Button
                label="Save Profile"
                icon="pi pi-check"
                onClick={handleSaveProfile}
                loading={loading}
                className="save-button"
              />
              
              <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => navigate(-1)}
                className="cancel-button"
                severity="secondary"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const mapState = (state) => {
  const { isLoggedIn, user } = state.auth;
  return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
  patchUser: (data) => dispatch.auth.patchUser(data),
  alert: (data) => dispatch.toast.alert(data),
  updateUser: (user) => dispatch.auth.updateUser(user),
});

export default connect(mapState, mapDispatch)(UserProfileSettings); 