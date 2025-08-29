import { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { supabase } from '@/lib/supabase';
import { loginSuccess, logout as logoutAction } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => ({
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
  }));

  // Initialize auth state from session
  useEffect(() => {
    const session = supabase.auth.session();
    if (session?.user) {
      // Fetch user profile from your API
      fetchUserProfile(session.access_token);
    }

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.access_token);
        } else {
          dispatch(logoutAction());
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [dispatch]);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await response.json();
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
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'auth/loginStart' });
    try {
      const { user, error, session } = await supabase.auth.signIn({
        email,
        password,
      });

      if (error) throw error;
      if (!session) throw new Error('No session returned');

      await fetchUserProfile(session.access_token);
      navigate('/');
    } catch (error: any) {
      dispatch({ type: 'auth/loginFailure', payload: error.message });
      throw error;
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    dispatch({ type: 'auth/loginStart' });
    try {
      const { user, error } = await supabase.auth.signUp(
        { email, password },
        {
          data: userData,
          redirectTo: `${window.location.origin}/login`,
        }
      );

      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'auth/loginFailure', payload: error.message });
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
    // Implement password reset logic
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
