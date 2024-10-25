const { Valuation, Message, Chat, User, admin } = require('../config/firebaseConfig'); // Ensure 'admin' is imported

// Function to handle valuation request and create chat with agent
const createValuation = async (req, res) => {
    const { userId, propertyType, location, price, description } = req.body;

    try {
        // Step 1: Validate required fields
        if (!userId || !propertyType || !location || !price || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Step 2: Fetch a random agent from the User table where role is 'agent'
        const agentsSnapshot = await User.where('role', '==', 'agent').get();
        if (agentsSnapshot.empty) {
            return res.status(404).json({ error: 'No agents available' });
        }

        // Select a random agent from the list of users with the 'agent' role
        const agentList = agentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const randomAgent = agentList[Math.floor(Math.random() * agentList.length)];
        const agentId = randomAgent.id;
        const agentName = randomAgent.fullName;

        // Step 3: Create a new valuation request
        const newValuation = {
            userId,
            propertyType,
            location,
            price,
            description,
            agentId, // Assign the agent for this valuation
            status: 'pending',
            createdAt: Date.now(), // Use serverTimestamp for consistency
        };

        // Save the valuation request
        const valuationRef = await Valuation.add(newValuation);
        const valuationId = valuationRef.id;

        // Step 4: Check if a chat already exists between the two users
        const chatSnapshot = await Chat.where('participants', 'array-contains', userId).get();

        let chatId;

        if (!chatSnapshot.empty) {
            // Filter the chats to find one that contains both userId and agentId
            const chats = chatSnapshot.docs.filter(doc => {
                const participants = doc.data().participants;
                return participants.includes(agentId);
            });

            if (chats.length > 0) {
                // If a chat exists, get the chat ID
                chatId = chats[0].id;
            }
        }

        // If no chat exists, create a new chat
        if (!chatId) {
            const newChat = {
                participants: [userId, agentId], // Include participants in the chat
                createdAt: Date.now(), // Use serverTimestamp for consistency
                valuationId: valuationId, // Link the chat to the valuation request
            };

            // Save the new chat
            const chatRef = await Chat.add(newChat);
            chatId = chatRef.id;
        }

        // Step 5: Create a new message in the Messages collection
        const propertyMessage = `
        Good day ${agentName},\n\n
            
        Property Valuation Request:\n
        - Type: ${propertyType}\n
        - Location: ${location}\n
        - Price: R${price}\n
        - Description: ${description}
        `;

        const newMessage = {
            chatId: chatId, // Reference the chat
            senderId: userId,
            text: propertyMessage,
            timestamp: Date.now(), // Use serverTimestamp for consistency
        };

        // Save the new message
        await Message.add(newMessage);

        console.log('Valuation created');
        res.status(201).json({ message: 'Valuation request sent and chat created or updated successfully.', chatId: chatId });
    } catch (error) {
        console.error('Error submitting valuation request:', error);
        res.status(500).json({ error: 'Failed to submit valuation request' });
    }
};



// Function to get all valuations for a specific user
const getUserValuations = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Retrieve valuations for the user
        const snapshot = await Valuation.where('userId', '==', id).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No valuations found for this user' });
        }

        // Create a list of valuation data
        const valuations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('Valuation created', valuations);

        res.status(200).json(valuations);
    } catch (error) {
        console.error('Error retrieving user valuations:', error);
        res.status(500).json({ error: 'Failed to retrieve valuations' });
    }
};

// Function to get all valuations for a specific agent
const getValuations = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Agent ID is required' });
    }

    try {
        // Retrieve valuations for the agent
        const snapshot = await Valuation.where('agentId', '==', id).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No valuations found for this agent' });
        }

        // Fetch user details for each valuation
        const valuations = await Promise.all(snapshot.docs.map(async doc => {
            const valuationData = doc.data();
            const userId = valuationData.userId;

            // Fetch the associated user information using the userId
            const userSnapshot = await User.doc(userId).get();

            if (userSnapshot.exists) {
                const userData = userSnapshot.data();
                return {
                    id: doc.id,
                    ...valuationData,
                    user: {
                        fullName: userData.fullName,
                        email: userData.email
                    }
                };
            } else {
                return {
                    id: doc.id,
                    ...valuationData,
                    user: null // Handle case where user data is missing
                };
            }
        }));

        res.status(200).json(valuations);
    } catch (error) {
        console.error('Error retrieving agent valuations:', error);
        res.status(500).json({ error: 'Failed to retrieve valuations' });
    }
};


// Function to update the status of a valuation
const updateValuationStatus = async (req, res) => {
    const { valuationId } = req.params;
    const { status } = req.body; // New status

    if (!valuationId || !status) {
        return res.status(400).json({ error: 'Valuation ID and status are required' });
    }

    try {
        // Update the status of the valuation
        const valuationRef = Valuation.doc(valuationId);
        await valuationRef.update({ status });

        res.status(200).json({ message: 'Valuation status updated successfully' });
    } catch (error) {
        console.error('Error updating valuation status:', error);
        res.status(500).json({ error: 'Failed to update valuation status' });
    }
};

module.exports = { createValuation, getUserValuations, getValuations, updateValuationStatus };
