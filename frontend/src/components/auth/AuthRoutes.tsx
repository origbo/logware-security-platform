import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import UnauthorizedPage from "./UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoute";
import UserProfile from "./UserProfile";

/**
 * AuthRoutes component
 *
 * Sets up all authentication-related routes in the application
 */
const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<UserProfile />} />
      </Route>
    </Routes>
  );
};

export default AuthRoutes;
