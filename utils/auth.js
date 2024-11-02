const { PrismaClient } = require('@prisma/client');
const prisma  = new PrismaClient();
const jwt = require('jsonwebtoken');
exports.verifyAuthToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send('Unauthorized');
    }
    
    const token = authHeader.split(' ')[1]; // Assuming 'Bearer <token>' format
  
    jwt.verify(token, process.env.AUTH_SEC_KEY, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(403).send('Unauthorized');
      }
      
      const isBlackListed = await this.tokenIsBlackListed(token)
      
      if(isBlackListed){
  
        return res.status(403).send('Unauthorized');
      }

      req.user = decoded; // Attach decoded user data to the request object
      next();
    });
};

exports.addAuthToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Proceed if authorization header exists
    if (authHeader) {
      const token = authHeader.split(' ')[1];

      // If no token or it's explicitly 'undefined', skip further processing
      if (!token || token === "undefined") {
        return next();
      }

      // Verify JWT token
      jwt.verify(token, process.env.AUTH_SEC_KEY, async (err, decoded) => {
        if (err) {
          console.error("JWT verification error:", err);
          return next(); // Proceed without adding user data if token is invalid
        }

        // Check if the token is blacklisted
        const isBlackListed = await this.tokenIsBlackListed(token);
        if (!isBlackListed) {
          req.user = decoded; // Add decoded user data to the request
        }

        return next(); // Proceed with the request
      });
    } else {
      // No authorization header, just forward the request
      return next();
    }
  } catch (error) {
    console.error("Error in auth middleware:", error);
    return next(); // Ensure the request continues even if an error occurs
  }
};

exports.tokenIsBlackListed = async (raw_token) => {
  // console.log(raw_token);
  
    const blackList = await prisma.blackListToken.findMany({
        where:{
            token:raw_token
        }
    });
    if(blackList?.length > 0){
      return true
    }else{
      return false
    }
}

// exports.
exports.userCast = ["password", "created_at", "updated_at"];

exports.creatorCast = ["password", "created_at", "updated_at"];
