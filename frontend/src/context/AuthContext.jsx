import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import authService from "../api/authService";

export const AuthContext = createContext(null);

// -----------------------------------------------------
// Read stored user
// -----------------------------------------------------
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem("scj_user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
};

// -----------------------------------------------------
// Extract authentication data safely
//
// Expected backend response:
//
// {
//   success: true,
//   message: "...",
//   data: {
//     user: {...},
//     token: "..."
//   }
// }
// -----------------------------------------------------
const extractAuthData = (response) => {
  const responseData = response?.data || {};
  const data = responseData?.data || {};

  return {
    token: data?.token || responseData?.token || null,

    user:
      data?.user ||
      responseData?.user ||
      null,
  };
};

// -----------------------------------------------------
// Auth Provider
// -----------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // Save authentication session
  // ---------------------------------------------------
  const persistSession = useCallback((token, userData) => {
    if (token) {
      localStorage.setItem("scj_token", token);
    }

    if (userData) {
      localStorage.setItem(
        "scj_user",
        JSON.stringify(userData)
      );
    }

    setUser(userData || null);
  }, []);

  // ---------------------------------------------------
  // Clear authentication session
  // ---------------------------------------------------
  const clearSession = useCallback(() => {
    localStorage.removeItem("scj_token");
    localStorage.removeItem("scj_user");

    setUser(null);
  }, []);

  // ---------------------------------------------------
  // Restore login session when application starts
  // ---------------------------------------------------
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const token = localStorage.getItem("scj_token");

      // -----------------------------------------------
      // IMPORTANT:
      // No JWT token means the user must be logged out.
      // Clear old user data as well.
      // -----------------------------------------------
      if (!token) {
        if (mounted) {
          clearSession();
          setLoading(false);
        }

        return;
      }

      try {
        // ---------------------------------------------
        // Verify JWT with backend
        // GET /api/auth/me
        // ---------------------------------------------
        const response = await authService.getProfile();

        if (!mounted) return;

        const responseData = response?.data || {};

        const profile =
          responseData?.data?.user ||
          responseData?.data ||
          responseData?.user ||
          null;

        // ---------------------------------------------
        // Invalid profile = session is not valid
        // ---------------------------------------------
        if (!profile) {
          throw new Error(
            "Invalid user profile received from server."
          );
        }

        // ---------------------------------------------
        // Backend successfully verified the token.
        // Restore the authenticated user.
        // ---------------------------------------------
        persistSession(token, profile);
      } catch (error) {
        console.error(
          "Session restoration failed:",
          error
        );

        // ---------------------------------------------
        // Invalid / expired JWT:
        // completely clear frontend session.
        // ---------------------------------------------
        if (mounted) {
          clearSession();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [clearSession, persistSession]);

  // ---------------------------------------------------
  // Handle unauthorized API responses
  // ---------------------------------------------------
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
    };

    window.addEventListener(
      "scj:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "scj:unauthorized",
        handleUnauthorized
      );
    };
  }, [clearSession]);

  // ---------------------------------------------------
  // LOGIN
  // POST /api/auth/login
  // ---------------------------------------------------
  const login = useCallback(
    async (credentials) => {
      const response =
        await authService.login(credentials);

      const {
        token,
        user: userData,
      } = extractAuthData(response);

      if (!userData) {
        throw new Error(
          "Login succeeded but user information was not returned."
        );
      }

      if (!token) {
        throw new Error(
          "Login succeeded but authentication token was not returned."
        );
      }

      persistSession(token, userData);

      return userData;
    },
    [persistSession]
  );

  // ---------------------------------------------------
  // REGISTER
  // POST /api/auth/register
  // ---------------------------------------------------
  const register = useCallback(
    async (payload) => {
      const response =
        await authService.register(payload);

      const {
        token,
        user: userData,
      } = extractAuthData(response);

      if (!userData) {
        throw new Error(
          "Registration succeeded but user information was not returned."
        );
      }

      // Backend may return token after registration.
      if (token) {
        persistSession(token, userData);
      } else {
        setUser(userData);

        localStorage.setItem(
          "scj_user",
          JSON.stringify(userData)
        );
      }

      return userData;
    },
    [persistSession]
  );

  // ---------------------------------------------------
  // LOGOUT
  // POST /api/auth/logout
  // ---------------------------------------------------
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn(
        "Backend logout request failed:",
        error
      );
    } finally {
      // ---------------------------------------------
      // Always clear frontend authentication state.
      // ---------------------------------------------
      clearSession();
    }
  }, [clearSession]);

  // ---------------------------------------------------
  // Update current user locally
  // ---------------------------------------------------
  const updateUser = useCallback((partial) => {
    setUser((previousUser) => {
      if (!previousUser) {
        return previousUser;
      }

      const nextUser = {
        ...previousUser,
        ...partial,
      };

      localStorage.setItem(
        "scj_user",
        JSON.stringify(nextUser)
      );

      return nextUser;
    });
  }, []);

  // ---------------------------------------------------
  // Authentication state
  // ---------------------------------------------------
  const value = useMemo(
    () => ({
      user,

      // User is authenticated only when a user exists.
      isAuthenticated: Boolean(user),

      // Admin role check.
      isAdmin: user?.role === "admin",

      loading,

      login,
      register,
      logout,
      updateUser,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
    ]
  );

  // ---------------------------------------------------
  // Provider
  // ---------------------------------------------------
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}