import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
      });
    }

    const authToken = jwt.sign({ googleId: user.googleId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.send({ user, token: authToken, profileIncomplete: !user.profileFilled });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};
