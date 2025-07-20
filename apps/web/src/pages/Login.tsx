import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { authApi } from '../api/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isDevelopmentMode = GOOGLE_CLIENT_ID === 'disabled-for-development' || import.meta.env.DEV;

// Debug logging
console.log('Environment check:', {
  GOOGLE_CLIENT_ID,
  isDEV: import.meta.env.DEV,
  isDevelopmentMode,
  allEnv: import.meta.env
});

function Login() {
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      handleGoogleCallback(code);
    }
  }, [location]);

  const handleGoogleCallback = async (code: string) => {
    setLoading(true);
    try {
      const response = await authApi.googleAuth(code);
      setAuth(response.user, response.token);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Development mode: skip Google OAuth
    if (isDevelopmentMode) {
      handleDevLogin();
      return;
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile https://www.googleapis.com/auth/calendar';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    
    window.location.href = authUrl;
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const response = await authApi.googleAuth('dev-mode');
      setAuth(response.user, response.token);
    } catch (error) {
      console.error('Development login error:', error);
      // If API is not available, create a mock user for frontend-only testing
      if (error instanceof Error && (error.message.includes('Failed to fetch') || error.message.includes('Network error'))) {
        const mockUser = {
          id: 'dev-user-id',
          email: 'dev@aethercalendar.com',
          name: 'Development User',
          picture: 'https://via.placeholder.com/150',
          googleId: 'dev-google-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const mockToken = 'dev-mock-token';
        setAuth(mockUser, mockToken);
        console.log('Using frontend-only mock user since backend is not available');
      } else {
        setError(error instanceof Error ? error.message : 'Development login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading">Authenticating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome to Aether Calendar</h1>
          <p>Your intelligent calendar assistant</p>
          {isDevelopmentMode && (
            <div style={{
              background: '#e8f5e8',
              color: '#2e7d2e',
              padding: '12px',
              borderRadius: '8px',
              margin: '16px 0',
              fontSize: '14px',
              border: '1px solid #4caf50'
            }}>
              🧪 <strong>Development Mode:</strong> Google APIs are disabled. Click the button below to login with mock data.
            </div>
          )}
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {isDevelopmentMode ? (
          <button
            className="btn btn-primary google-login-btn"
            onClick={handleDevLogin}
            disabled={loading}
            style={{ background: '#34a853' }}
          >
            🚀 Development Login (Skip Google)
          </button>
        ) : (
          <button
            className="btn btn-primary google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}

        <div className="login-footer">
          <p>
            By signing in, you agree to sync your Google Calendar with Aether
            to provide intelligent calendar assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;