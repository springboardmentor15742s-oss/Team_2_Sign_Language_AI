import { createContext, useState, useCallback, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing user when app starts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Get logged-in user
  const getCurrentUser = async () => {
    try {
      const response = await authService.me();
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };


  // Login
  const login = useCallback(async (credentials) => {
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);

      const {
        access_token,
        user
      } = response.data;


      // Save JWT token
      localStorage.setItem("token", access_token);

      // Save user details
      setUser(user);


      return {
        success: true,
        user
      };

    } catch (error) {

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Login failed. Please try again."
      };

    } finally {
      setIsLoading(false);
    }

  }, []);



  // Register
  const register = useCallback(async (data) => {
    setIsLoading(true);

    try {

      const response = await authService.register(data);


      const {
        access_token,
        user
      } = response.data;


      if (access_token) {
        localStorage.setItem(
          "token",
          access_token
        );
      }


      setUser(user);


      return {
        success: true,
        user
      };


    } catch (error) {

      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Registration failed. Please try again."
      };


    } finally {
      setIsLoading(false);
    }

  }, []);



  // Logout
  const logout = useCallback(async () => {

    try {
      await authService.logout();

    } catch (error) {
      console.log("Logout API error", error);
    }


    localStorage.removeItem("token");
    setUser(null);

  }, []);



  // Update user profile locally
  const updateUser = useCallback((updates) => {

    setUser((prev) =>
      prev
        ? {
            ...prev,
            ...updates
          }
        : null
    );

  }, []);



  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,

        login,
        register,
        logout,

        updateUser,

        getCurrentUser,

        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
