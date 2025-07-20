export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
};

if (!authConfig.googleClientId || !authConfig.googleClientSecret) {
  throw new Error('Google OAuth credentials are required');
}