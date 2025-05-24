import { useContext } from "react";
import { AuthContext } from "../../context/auth/AuthContext";

/**
 * Custom hook to access authentication context
 *
 * This hook provides easy access to all authentication-related functionality
 * and state from any component in the application.
 *
 * Example usage:
 * ```
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Check if user is authenticated
 * if (isAuthenticated) {
 *   // Use user data
 *   console.log(user.username);
 * }
 *
 * // Login function
 * const handleLogin = async () => {
 *   try {
 *     await login({ username: 'user', password: 'pass' });
 *     // Login successful
 *   } catch (error) {
 *     // Handle login error
 *   }
 * };
 * ```
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;
