const { User, admin } = require('../config/firebaseConfig');


const getUsers = async (req, res) =>{
    try {
        // Retrieve all users
        const snapshot = await User.get();

        // Check if there are any users
        if (snapshot.empty) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Map the documents to an array of user data
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Respond with the list of users
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
}

const updateUserRole = async (req, res) =>{
    const { id } = req.params
    const { role } = req.body;
    const updatedAt = Date.now()
    try {
      
        if (role === 'agent') {
            await User.doc(id).update({
                role: 'agent',
                balance: 0,
                updatedAt: updatedAt    
            });
        } else if (role === 'user') {
            await User.doc(id).update({
                role: 'user',
                balance: 100_000_000, // Example balance, be cautious with large numbers
                updatedAt: updatedAt    
            });
        } else {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

      console.log('Successfully updated user role.');
      res.status(200).json({ 
          message: 'Email and username updated successfully.'
       });
    } catch (error) {
      console.error('Error updating email and username:', error);
      return res.status(500).json({ message: 'Failed to update email and username.', error: error.message });
    }
}

const getUsersWithRole = async (req, res) => {
    try {
        // Retrieve all users with role 'user'
        const snapshot = await User.where('role', '==', 'user').get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No users found with the specified role' });
        }

        // Map the documents to an array of user data
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Respond with the list of users
        res.status(200).json(users);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};


const updateUserDetails = async (req, res) => {
    const { id } = req.params
    const { fullName, email, phoneNumber } = req.body;
    const updatedAt = Date.now()
    try {
      // Update the user's email and username in Firebase Auth
      await admin.auth().updateUser(id, {
        email: email,
        displayName: fullName,
      });
  
      // Update the username in your Firestore database
      await User.doc(id).update({
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        updatedAt: updatedAt    
      });

        
      console.log('Successfully updated user details.');
      res.status(200).json({ 
          message: 'user details updated successfully.'
       });
    } catch (error) {
      console.error('Error updating email and username:', error);
      return res.status(500).json({ message: 'Failed to update email and username.', error: error.message });
    }
};

const updatePassword = async (req, res) => {
    const { id } = req.params
    const { password } = req.body
    try {
      // Update the user's password in Firebase Auth
      await admin.auth().updateUser(id, {
        password: password,
      });
  
      console.log('Successfully updated password.');
      res.status(200).json({ 
        message: 'Password updated successfully.' 
      });
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ message: 'Failed to update password.', error: error.message });
    }
};



module.exports = { getUsers, getUsersWithRole, updateUserRole, updateUserDetails, updatePassword }