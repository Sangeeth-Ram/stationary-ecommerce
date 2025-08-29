import { createContext, useEffect, useCallback, useContext, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { supabase } from '../lib/supabase';
import { loginSuccess, logout as logoutAction } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import type { AuthContextType, SignupData, UserProfile } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
  }));
  const [initializing, setInitializing] = useState(true);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch('/api/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json() as UserProfile;
      dispatch(
        loginSuccess({
          user: userData,
          token,
        })
      );
    } catch (error) {
      console.error('Error fetching user profile:', error);
      await supabase.auth.signOut();
    }
  }, [dispatch]);

  // Initialize auth state from session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetchUserProfile(session.access_token);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.access_token) {
          await fetchUserProfile(session.access_token);
        } else {
          dispatch(logoutAction());
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

      await fetchUserProfile(data.session.access_token);
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'auth/loginFailure', payload: errorMessage });
      throw error;
    }
  };

  const signup = async (signupData: SignupData) => {
    dispatch({ type: 'auth/loginStart' });
    try {
      const { email, password, firstName, lastName, role = 'USER' } = signupData;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            role,
            email,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;
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
