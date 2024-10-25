const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1]

    if(!token){
        return res.status(401).json({ error: 'Unauthorized: No token provided'});
    }

    try{ 
        jwt.verify(token, process.env.JWT_SEC, (err, decoded) => {
                
            // Add the decoded user info to the request object
            req.user = decoded;
            next();
        });
    } catch(error){
        console.error('Error verifying ID token:', error);
        return res.status(403).json({ message: "Invalid token" });
          
    }
}


const verifyAgent = (req, res, next) => {
    // Ensure the user is authenticated using the verifyToken middleware
    if (req.user.role !== 'agent') {
        return res.status(403).json({ error: 'Access denied: User is not an agent' });
    }

    // Proceed to the next middleware or route handler
    next();
};

const verifyAdmin = (req, res, next) => {
    // Ensure the user is authenticated using the verifyToken middleware
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: User is not an admin' });
    }

    // Proceed to the next middleware or route handler
    next();
};

module.exports = { verifyToken, verifyAgent, verifyAdmin }