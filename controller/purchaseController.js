const { Purchase, User, Property } = require('../config/firebaseConfig'); // Ensure you have the Property collection imported

// Create a new purchase with balance check and commission
const createPurchase = async (req, res) => {
    const { userId, propertyId, amount } = req.body;

    try {
        // Step 1: Retrieve the user's balance
        const userRef = User.doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userBalance = userDoc.data().balance;

        // Step 2: Check if the user has enough balance to make the purchase
        if (userBalance < amount) {
            return res.status(400).json({ error: 'Insufficient balance to complete the purchase' });
        }

        // Step 3: Retrieve the property to check its status
        const propertyRef = Property.doc(propertyId);
        const propertyDoc = await propertyRef.get();

        if (!propertyDoc.exists) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const propertyData = propertyDoc.data();

        // Step 4: Check if the property is already sold
        if (propertyData.status === 'Sold') {
            return res.status(400).json({ error: 'Property is already sold' });
        }

        const agentId = propertyData.agentId; // Assume the property document contains an agentId field
        const commission = amount * 0.10; // Calculate 10% commission

        // Step 5: Subtract the amount from the user's balance
        const newBalance = userBalance - amount;
        await userRef.update({ balance: newBalance });

        // Step 6: Update the agent's balance
        const agentRef = User.doc(agentId);
        const agentDoc = await agentRef.get();

        if (agentDoc.exists) {
            const agentBalance = agentDoc.data().balance || 0;
            const newAgentBalance = agentBalance + commission;

            await agentRef.update({ balance: newAgentBalance });
        }

        // Step 7: Create the purchase record
        const newPurchase = {
            userId,
            propertyId,
            amount,
            date: Date.now(),
        };

        const purchaseRef = await Purchase.add(newPurchase);

        // Step 8: Update the property status to 'Sold'
        await propertyRef.update({ status: 'Sold' });

        // Step 9: Respond with the new purchase and updated balances
        res.status(201).json({
            message: 'Purchase created successfully',
            purchaseId: purchaseRef.id,
            newBalance,
            commission,
            propertyStatus: 'Sold'
        });
    } catch (error) {
        console.error('Error creating purchase:', error);
        res.status(500).json({ error: 'Failed to create purchase' });
    }
};


// Get all purchases for a user

// const getUserPurchases = async (req, res) => {
//     const { id } = req.params;

//     try {
//         // Fetch all purchases for the given user
//         const snapshot = await Purchase.where('userId', '==', id).get();

//         if (snapshot.empty) {
//             return res.status(404).json({ error: 'No purchases found for this user' });
//         }

//         // Get purchase details and fetch associated property details
//         const purchases = [];
//         for (const purchaseDoc of snapshot.docs) {
//             const purchaseData = { id: purchaseDoc.id, ...purchaseDoc.data() };

//             // Fetch property details based on propertyId in the purchase data
//             const propertySnapshot = await Property.doc(purchaseData.propertyId).get();
//             if (propertySnapshot.exists) {
//                 const propertyData = { id: propertySnapshot.id, ...propertySnapshot.data() };

//                 // Combine purchase data with property data
//                 purchases.push({
//                     ...purchaseData,
//                     property: propertyData, // Add property details here
//                 });
//             }
//         }

//         console.log(purchases);
//         res.status(200).json(purchases);
//     } catch (error) {
//         console.error('Error getting purchases:', error);
//         res.status(500).json({ error: 'Failed to fetch purchases' });
//     }
// };


// Get all purchases for a user
const getUserPurchases = async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch all purchases for the given user
        const snapshot = await Purchase.where('userId', '==', id).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'No purchases found for this user' });
        }

        // Collect property IDs for batch retrieval
        const propertyIds = snapshot.docs.map(doc => doc.data().propertyId);
        const uniquePropertyIds = [...new Set(propertyIds)];

        // Fetch properties and map them to their IDs
        const propertiesMap = {};
        for (const propertyId of uniquePropertyIds) {
            const propertyDoc = await Property.doc(propertyId).get();
            if (propertyDoc.exists) {
                propertiesMap[propertyId] = { id: propertyDoc.id, ...propertyDoc.data() };
            }
        }

        // Combine purchases with corresponding property data
        const purchases = snapshot.docs.map(purchaseDoc => {
            const purchaseData = { id: purchaseDoc.id, ...purchaseDoc.data() };
            const propertyData = propertiesMap[purchaseData.propertyId];

            if (propertyData) {
                return {
                    ...purchaseData,
                    property: propertyData,
                };
            }
            return null; // Return null if the property does not exist
        }).filter(purchase => purchase !== null); // Filter out null entries

        console.log(purchases);
        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error getting purchases:', error);
        res.status(500).json({ error: 'Failed to fetch purchases' });
    }
};



module.exports = { createPurchase, getUserPurchases }