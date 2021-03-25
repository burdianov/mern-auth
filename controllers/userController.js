const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const fetch = require('node-fetch');

const { OAuth2 } = google.auth;
const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

const sendMail = require('./sendMail');

const { CLIENT_URL } = process.env;

const userController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          msg: 'Fill in all the fields'
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          msg: 'Invalid email'
        });
      }

      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          msg: 'This email is already registered'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          msg: 'Password must be at least 6 characters long'
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = {
        name,
        email,
        password: passwordHash
      };

      const activationToken = createActivationToken(newUser);

      const url = `${process.env.CLIENT_URL}/user/activate/${activationToken}`;

      const txt = 'Verify your email address';

      sendMail(email, url, txt);

      res.json({ msg: 'Register Success! Please activate your account.' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  activateEmail: async (req, res) => {
    try {
      const { activation_token } = req.body;
      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );

      const { name, email, password } = user;

      const check = await User.findOne({ email });

      if (check) {
        return res
          .status(400)
          .json({ msg: 'This email has already been registered' });
      }

      const newUser = new User({
        name,
        email,
        password
      });

      await newUser.save();

      return res.status(200).json({ msg: 'Account has been activated' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'This email is not registered' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Wrong email or password' });
      }

      const refreshToken = createRefreshToken({ id: user._id });
      res.cookie('refreshtoken', refreshToken, {
        httpOnly: true,
        path: '/user/refresh-token',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({ msg: 'Login success' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getAccessToken: (req, res) => {
    try {
      const refreshToken = req.cookies.refreshtoken;

      if (!refreshToken) {
        return res.status(400).json({
          msg: 'Please login'
        });
      }

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) {
            return res.status(400).json({
              msg: 'Please login'
            });
          }
          const accessToken = createAccessToken({ id: user.id });
          res.json({ accessToken });
        }
      );
    } catch (err) {
      if (err) {
        return res.status(500).json({
          msg: err.message
        });
      }
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'This email is not registered' });
      }

      const accessToken = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset-password/${accessToken}`;
      const txt = 'Reset your password';

      sendMail(email, url, txt);

      res.json({ msg: 'Please check your email to reset the password' });
    } catch (err) {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const passwordHash = await bcrypt.hash(password, 12);

      await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: passwordHash
        }
      );
      res.json({ msg: 'Password was reset successfully' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUserInfo: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
    }
  },
  getAllUsersInfo: async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (err) {
      if (err) {
        return res.status(500).json({ msg: err.message });
      }
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie('refreshtoken', { path: '/user/refresh-token' });
      return res.json({ msg: 'Logged out' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUser: async (req, res) => {
    try {
      const { name, avatar } = req.body;
      await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          name,
          avatar
        }
      );
      res.json({ msg: 'Update success' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  updateUsersRole: async (req, res) => {
    try {
      const { role } = req.body;
      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          role
        }
      );
      res.json({ msg: 'Update success' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ msg: 'User deleted' });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  googleLogin: async (req, res) => {
    try {
      const { tokenId } = req.body;
      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.MAILING_SERVICE_CLIENT_ID
      });
      const { email_verified, email, name, picture } = verify.payload;
      const password = email + process.env.GOOGLE_SECRET;
      const passwordHash = await bcrypt.hash(password, 12);

      if (!email_verified) {
        return res.status(400).json({ msg: 'Email verification failed' });
      }

      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ msg: 'Credentials verification failed' });
        }
        const refreshToken = createRefreshToken({ id: user._id });
        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: '/user/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ msg: 'Login success' });
      } else {
        const newUser = new User({
          name,
          email,
          password: passwordHash,
          avatar: picture
        });
        await newUser.save();

        const refreshToken = createRefreshToken({ id: newUser._id });
        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: '/user/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ msg: 'Login success' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  facebookLogin: async (req, res) => {
    try {
      const { accessToken, userID } = req.body;

      const URL = `https://graph.facebook.com/v2.9/${userID}/?fields=id,name,email,picture
      &access_token=${accessToken}`;

      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => {
          return res;
        });

      const { email, name, picture } = data;
      const password = email + process.env.FACEBOOK_SECRET;
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ msg: 'Credentials verification failed' });
        }
        const refreshToken = createRefreshToken({ id: user._id });
        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: '/user/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ msg: 'Login success' });
      } else {
        const newUser = new User({
          name,
          email,
          password: passwordHash,
          avatar: picture.data.url
        });
        await newUser.save();

        const refreshToken = createRefreshToken({ id: newUser._id });
        res.cookie('refreshtoken', refreshToken, {
          httpOnly: true,
          path: '/user/refresh-token',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({ msg: 'Login success' });
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

function validateEmail(email) {
  const regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regEx.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: '5m'
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d'
  });
};

module.exports = userController;
