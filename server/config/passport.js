import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
import Department from '../models/Department.js';
import dotenv from 'dotenv';
dotenv.config();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id }).populate(
          'department'
        );

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Get default department (Computer Science or first available)
        let defaultDept = await Department.findOne({ code: 'CSE' });
        if (!defaultDept) {
          defaultDept = await Department.findOne().sort({ createdAt: 1 });
        }

        if (!defaultDept) {
          return done(new Error('No department available for new users'), null);
        }
        console.log(profile);

        // Create new user with proper schema
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value || null,
          role: 'faculty', // Default role
          department: defaultDept._id, // Reference to Department ObjectId
          isActive: true,
          lastLogin: new Date(),
        });

        await user.save();
        await user.populate('department');

        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).populate('department');
        if (user && user.isActive) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        console.error('JWT verification error:', error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).populate('department');
    done(null, user);
  } catch (error) {
    console.error('Deserialization error:', error);
    done(error, null);
  }
});

export default passport;
