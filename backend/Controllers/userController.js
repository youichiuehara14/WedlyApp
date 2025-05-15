const dotenv = require('dotenv').config();

const User = require('../Models/users');

const {
  hashPassword,
  comparePasswords,
} = require('../Middlewares/passwordMiddleware');

const jwt = require('jsonwebtoken');

//////////////////////////////////////////////////////
// Register User
//////////////////////////////////////////////////////
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phoneNumber,
    } = req.body;

    // Check if all fields are provided
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber
    ) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if password is at least 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if it contains at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        error: 'Password must contain at least one uppercase letter',
      });
    }

    // Check if it contains at least one number
    if (!/\d/.test(password)) {
      return res.status(400).json({
        error: 'Password must contain at least one number',
      });
    }

    // Check if email is valid
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email is already taken
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email is taken already' });
    }

    const hashedPassword = await hashPassword(password);

    // Create new user - mongodb method
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// Login User
//////////////////////////////////////////////////////
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Check if email is valid
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    // Check if password has at least 6 characters
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }

    // Check if password is correct
    const isMatch = await comparePasswords(password, user.password);
    if (isMatch) {
      // Create JWT token
      const token = jwt.sign(
        {
          email: user.email,
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
        }, // payload
        process.env.JWT_SECRET, // secret key
        { expiresIn: '1d' } // token expiration
      );

      // Set cookie with JWT token.
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } else {
      return res.status(400).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// Forgot Password
//////////////////////////////////////////////////////
const forgotPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmNewPassword } = req.body;
    // Check if all fields are provided
    if (!email || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Check if email is valid
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    // Check if password is at least 6 characters
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters' });
    }
    // Check if it contains at least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must contain at least one uppercase letter',
      });
    }
    // Check if it contains at least one number
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must contain at least one number',
      });
    }
    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    // Check if password is not the same as the old one
    if (await comparePasswords(newPassword, user.password)) {
      return res
        .status(400)
        .json({ error: 'New password cannot be the same as the old one' });
    }

    // Hash the new password using your helper
    const hashed = await hashPassword(newPassword);

    // Update password and save
    user.password = hashed;
    user.updatedAt = new Date();

    // Save the user
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

//////////////////////////////////////////////////////
// Get Profile
//////////////////////////////////////////////////////

const getProfile = (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'No token found' });
  }

  jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
};

//////////////////////////////////////////////////////
// Logout
//////////////////////////////////////////////////////
const logoutUser = (req, res) => {
  // Clear the authentication token cookie
  res.clearCookie('token'); // Replace 'token' with the name of your cookie
  res.status(200).json({ message: 'Logged out successfully' });
};

//////////////////////////////////////////////////////
// Update User Info
//////////////////////////////////////////////////////
const updateUserInfo = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: 'No token found' });
    }

    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.updatedAt = new Date();

      const updatedUser = await user.save();

      res.status(200).json({
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Update profile failed' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  getProfile,
  logoutUser,
  updateUserInfo,
};
