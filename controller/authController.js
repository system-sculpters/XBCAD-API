const { admin, auth, User } = require('../config/firebaseConfig')
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
    const { fullName, email, phoneNumber, password } = req.body;
    const createdAt = Date.now();
    
    try {
        // Step 1: Check if the user already exists
        const existingUser = await admin.auth().getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
    } catch (error) {
        // If the error is 'user not found', continue to create the user
        if (error.code !== 'auth/user-not-found') {
            console.error('Error checking if user exists:', error);
            return res.status(500).json({ error: 'Failed to check user existence' });
        }
    }

    try {
        const role = 'user';
        // Step 2: Create the new user
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: fullName,
        });

        // Step 3: Store additional user information in Firestore
        await User.doc(userRecord.uid).set({
            fullName: fullName,
            email: email,
            phoneNumber: phoneNumber,
            balance: 100_000_000,
            role: role,
            createdAt: createdAt    
        });

        res.status(200).json({ message: "User registration successful" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};


const signin = async (req, res) => {
    const { email, password } = req.body
    try {
        // Fetch the user document using the username
        const userSnapshot = await User.where('email', '==', email).get();
 
        if (userSnapshot.empty) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Assuming usernames are unique and there's only one user
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        
        console.log(userDoc.id)
        // Sign in the user using email and password
        const userCredential = await auth.signInWithEmailAndPassword(user.email, password);
        const userData = await userCredential.user

        const payload = {
            uid: userData.uid,
            email: userData.email,
            role: user.role
        };

        // Sign a JWT with a 3-day expiration
        const token = jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '3d' });

        res.status(200).json({
            message: "User signed in successfully",
            id: userDoc.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: token,
            balance: user.balance
        });
    } catch (error) { 
        console.error('Error signing in user:', error);
        res.status(401).json({ error: 'Invalid username or password' });
    }
}


module.exports = { signup, signin}