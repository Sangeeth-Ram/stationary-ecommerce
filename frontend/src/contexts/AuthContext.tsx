import { createContext, useEffect, useCallback, useContext, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { supabase } from '../lib/supabase';
import { loginSuccess, logout as logoutAction, setLoading, updateUser } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import type { AuthContextType, UserProfile } from '../types/auth';

// Session timeout in milliseconds (24 hours)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
// LocalStorage keys
const AUTH_STORAGE_KEY = 'auth_state';
const SESSION_TIMESTAMP_KEY = 'session_timestamp';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
  }));
  const [initializing, setInitializing] = useState(true);
  const logoutTimerRef = useRef<number | null>(null);

  // Save session timestamp to localStorage
  const updateSessionTimestamp = useCallback(() => {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  }, []);

  // Clear session data
  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
  }, []);

  // Set up auto-logout timer
  const setupAutoLogout = useCallback((expiresAt?: number) => {
    if (logoutTimerRef.current !== null) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (expiresAt) {
      const expiresIn = expiresAt * 1000 - Date.now();
      if (expiresIn > 0) {
        logoutTimerRef.current = window.setTimeout(() => {
          handleLogout();
        }, expiresIn);
      }
    } else {
      // Fallback to SESSION_TIMEOUT if no expiresAt provided
      logoutTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT);
    }
  }, []);

  const handleLogout = useCallback(async (options: { redirectToLogin?: boolean } = {}) => {
    const { redirectToLogin = true } = options;
    try {
      await supabase.auth.signOut();
      dispatch(logoutAction());
      clearSession();
      if (redirectToLogin) {
        navigate('/login', { state: { from: location.pathname } });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if logout fails, clear the local session
      dispatch(logoutAction());
      clearSession();
      if (redirectToLogin) {
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  }, [dispatch, navigate, clearSession]);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      // Timeout support so we never hang indefinitely
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      const baseEnv = (import.meta as any).env?.VITE_API_URL;
      const base = baseEnv && baseEnv.length > 0 ? baseEnv.replace(/\/$/, '') : window.location.origin;
      const response = await fetch(`${base}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      if (!response.ok) {
        // Do NOT auto-logout here; backend might be misconfigured.
        // Keep session-based auth and skip profile hydration.
        if (response.status === 401 || response.status === 403) {
          console.warn('Profile fetch unauthorized; keeping Supabase session.');
          return; // swallow to avoid logout loop
        }
        const msg = await response.text().catch(() => 'Failed to fetch user profile');
        throw new Error(msg || 'Failed to fetch user profile');
      }

      const userData = await response.json() as UserProfile;
      // Update existing user with full profile (keep token/isAuthenticated)
      dispatch(updateUser(userData));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Do not force sign-out here; handled above for 401/403 or by onAuthStateChange
    }
  }, [dispatch]);

  // Handle protected routes
  useEffect(() => {
    const publicPaths = ['/login', '/signup', '/forgot-password'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (isAuthenticated && isPublicPath) {
      // If user is authenticated and tries to access auth pages, redirect to home
      navigate('/');
    } else if (!isAuthenticated && !isPublicPath) {
      // If user is not authenticated and tries to access protected pages, redirect to login
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Initialize auth state from session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch(setLoading(true));
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check for expired session
        const lastActivity = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
          await handleLogout();
          return;
        }

        if (session?.access_token) {
          // Mark authenticated immediately with minimal info
          const minimalUser = {
            id: session.user?.id || 'unknown',
            email: session.user?.email || 'unknown',
            role: 'USER' as const,
          };
          
          // Update session timestamp and set auto-logout
          updateSessionTimestamp();
          setupAutoLogout(session.expires_at);
          
          // Dispatch login success
          dispatch(loginSuccess({ user: minimalUser, token: session.access_token }));
          
          // Fetch full profile in background
          fetchUserProfile(session.access_token).catch(() => {});
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await handleLogout();
      } finally {
        setInitializing(false);
        dispatch(setLoading(false));
      }
    };

    initializeAuth();

    // Set up activity listeners to update session timestamp
    const updateActivity = () => updateSessionTimestamp();
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          dispatch(setLoading(true));
          if (session?.access_token) {
            const minimalUser = {
              id: session.user?.id || 'unknown',
              email: session.user?.email || 'unknown',
              role: 'USER' as const,
            };
            
            // Update session timestamp and set auto-logout
            updateSessionTimestamp();
            setupAutoLogout(session.expires_at);
            
            dispatch(loginSuccess({ user: minimalUser, token: session.access_token }));
            fetchUserProfile(session.access_token).catch(() => {});
          } else {
            // session missing or expired -> auto-logout
            await handleLogout();
          }
        } finally {
          dispatch(setLoading(false));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch, fetchUserProfile]);

  // Don't render children until auth is initialized
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const login = async (email: string, password: string) => {
    dispatch({ type: 'auth/loginStart' });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      // Mark authenticated immediately using Supabase user
      const minimalUser = {
        id: data.user.id,
        email: data.user.email!,
        role: 'USER' as const,
      };
      dispatch(loginSuccess({ user: minimalUser, token: data.session.access_token }));

      // Navigate first for better UX, then hydrate profile in background
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      fetchUserProfile(data.session.access_token).catch(() => {});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'auth/loginFailure', payload: errorMessage });
      throw error;
    }
  };

  const signup = async (email: string, password: string, userData: { firstName: string; lastName: string }) => {
    dispatch({ type: 'auth/loginStart' });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
      // If email confirmation is disabled and session is returned, treat like login
      if (data?.session) {
        const minimalUser = {
          id: data.user!.id,
          email: data.user!.email!,
          role: 'USER' as const,
        };
        dispatch(loginSuccess({ user: minimalUser, token: data.session.access_token }));
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
        fetchUserProfile(data.session.access_token).catch(() => {});
        return;
      }

      // Otherwise, ask user to verify email then login
      navigate('/login', { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'auth/loginFailure', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch(logoutAction());
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, useAuth };
