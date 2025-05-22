const jwt = require('jsonwebtoken');

const authenticateUser = async (req, res, next) => {
  // Check if the token is present in the cookies
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ error: 'No token found - Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify the token using the secret key stored in the .env file

    req.user = decoded; // decoded token contains the user id and other information
    next(); // call the next middleware or route handler
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateUser;
