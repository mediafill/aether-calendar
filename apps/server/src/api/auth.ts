import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { authConfig } from '../config/auth';
import type { AuthResponse } from '@aether/shared-types';

export const authRouter = Router();

const googleAuth = new GoogleAuth({
  credentials: {
    client_id: authConfig.googleClientId,
    client_secret: authConfig.googleClientSecret,
  },
});

authRouter.post('/google', async (req, res) => {
  try {
    const { code } = req.body;
    const isDevMode = process.env.DISABLE_GOOGLE_APIS === 'true';

    if (!code && !isDevMode) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Development mode: create mock user
    if (isDevMode) {
      const mockUser = await prisma.user.upsert({
        where: { email: 'dev@aethercalendar.com' },
        update: {},
        create: {
          googleId: 'dev-google-id',
          email: 'dev@aethercalendar.com',
          name: 'Development User',
          picture: 'https://via.placeholder.com/150',
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        authConfig.jwtSecret,
        { expiresIn: '7d' }
      );

      const response: AuthResponse = {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          picture: mockUser.picture || undefined,
          googleId: mockUser.googleId,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      };

      return res.json(response);
    }

    const oauth2Client = new googleAuth.OAuth2Client(
      authConfig.googleClientId,
      authConfig.googleClientSecret,
      authConfig.googleRedirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: authConfig.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: payload.email!,
          name: payload.name!,
          picture: payload.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub,
          email: payload.email!,
          name: payload.name!,
          picture: payload.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: '7d' }
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture || undefined,
        googleId: user.googleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});