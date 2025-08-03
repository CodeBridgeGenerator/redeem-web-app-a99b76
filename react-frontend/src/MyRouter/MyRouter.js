import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../components/LoginPage/LoginPage";
import SignUpPage from "../components/LoginPage/signUp/SignUpPage";
import LandingPage from "../components/LandingPage/LandingPage";
import UserProfileSettings from "../components/Profile/UserProfileSettings";
import EmailRolesManagement from "../components/Admin/EmailRolesManagement";
import DashboardAdminControl from "../components/Admin/DashboardAdminControl";
import UserDashboard from "../components/User/UserDashboard";
import CategoriesPage from "../components/Categories/CategoriesPage";
import VoucherPage from "../components/Vouchers/VoucherPage";
import CartPage from "../components/Cart/CartPage";
import MyVouchersPage from "../components/MyVouchers/MyVouchersPage";
import RedemptionHistoryPage from "../components/RedemptionHistoryPage/RedemptionHistoryPage";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";

const MyRouter = () => {
    return (
        <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      
      {/* Protected Routes - No specific role required */}
      <Route 
        path="/profile-settings" 
        element={
          <ProtectedRoute>
            <UserProfileSettings />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin Only Routes */}
      <Route 
        path="/DashboardAdminControl" 
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardAdminControl />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/email-roles" 
        element={
          <ProtectedRoute requiredRole="admin">
            <EmailRolesManagement />
          </ProtectedRoute>
        } 
      />
      
      {/* User Dashboard - Accessible by all authenticated users */}
      <Route 
        path="/user-dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Categories Page - Accessible by all authenticated users */}
      <Route 
        path="/categories" 
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Voucher Page - Accessible by all authenticated users */}
      <Route 
        path="/vouchers/:categoryId" 
        element={
          <ProtectedRoute>
            <VoucherPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Cart Page - Accessible by all authenticated users */}
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } 
      />

      {/* My Vouchers Page - Accessible by all authenticated users */}
      <Route 
        path="/my-vouchers" 
        element={
          <ProtectedRoute>
            <MyVouchersPage />
          </ProtectedRoute>
        } 
      />

      {/* Redemption History Page - Accessible by all authenticated users */}
      <Route 
        path="/redemption-history" 
        element={
          <ProtectedRoute>
            <RedemptionHistoryPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Landing Page - Redirects based on role */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <LandingPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<LoginPage />} />
        </Routes>
    );
};

export default MyRouter;
