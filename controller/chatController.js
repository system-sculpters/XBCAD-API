const { Chat, User, Message, admin } = require('../config/firebaseConfig'); // Ensure 'Message' is imported

// Send a new message in a chat
const sendMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;

    // Validate the request body
    if (!chatId || !senderId || !text) {
        console.log('Missing required fields')
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Get the chat by its ID
        const chatRef = Chat.doc(chatId);
        const chatDoc = await chatRef.get();

        // Check if the chat exists
        if (!chatDoc.exists) {
            console.log('Chat not found')
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Create a new message object
        const newMessage = {
            chatId,
            senderId,
            text,
            timestamp: Date.now(), // Use serverTimestamp for consistency
        };

        // Save the new message to the Message collection
        const messageRef = await Message.add(newMessage);
        console.log('Message sent successfully')

        const messagesSnapshot = await Message.where('chatId', '==', chatId).get();
        const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Return the new message ID and the updated list of messages
        res.status(200).json({ 
            message: 'Message sent successfully', 
            messages // Include the updated messages
        });
    } catch (error) { 
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

const sendNewMessage = async (req, res) => {
    const { userId, agentId, senderId, text } = req.body;

    console.log(`userId: ${userId}\nagentId: ${agentId}\nsenderId: ${senderId}\ntext: ${text}`)
    // Validate the request body
    if (!userId || !agentId || !senderId || !text) {
        console.log('Missing required fields');
        return res.status(400).json({ error: 'Missing required fields',
             data: `userId: ${userId}\nagentId: ${agentId}\nsenderId: ${senderId}\ntext: ${text}` });
    }

    try {
        // Find the chat where both participants are included
        const chatsSnapshot = await Chat.where('participants', 'array-contains-any', [userId, agentId]).get();

        let chatId;
        let chatFound = false;

        chatsSnapshot.forEach(chatDoc => {
            const chatData = chatDoc.data();
            // Check if both participants are in the chat
            if (chatData.participants.includes(userId) && chatData.participants.includes(agentId)) {
                chatId = chatDoc.id;
                chatFound = true;
            }
        });

        // If no chat is found, create a new chat
        if (!chatFound) {
            console.log('Creating a new chat');
            const newChat = {
                participants: [userId, agentId],
                createdAt: Date.now(),
            };

            const chatRef = await Chat.add(newChat);
            chatId = chatRef.id; // Get the ID of the newly created chat
        }

        // Create a new message object
        const newMessage = {
            chatId,
            senderId,
            text,
            timestamp: Date.now(), // Use serverTimestamp for consistency
        };

        // Save the new message to the Message collection
        await Message.add(newMessage);
        console.log('Message sent successfully');

        // Return the new message ID and the updated list of messages
        res.status(200).json({ 
            message: 'Message sent successfully', 
        });
    } catch (error) { 
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};



const getChats = async (req, res) => {
    const { id } = req.params; // Assuming the userId is sent as a URL parameter

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Query the Chat collection for chats that include the userId in the participants
        const snapshot = await Chat.where('participants', 'array-contains', id).get();

        if (snapshot.empty) {
            return res.status(200).json({}); // Return an empty object when no chats are found
        }

        // Create a list of chat data, including messages and participant details
        const chats = await Promise.all(snapshot.docs.map(async (doc) => {
            const chatData = { id: doc.id, ...doc.data() };

            // Retrieve messages for each chat
            const messagesSnapshot = await Message.where('chatId', '==', doc.id).get();

            // Collect messages in an array
            chatData.messages = messagesSnapshot.docs.map(msgDoc => ({
                id: msgDoc.id,
                ...msgDoc.data(),
            }));

            // Fetch participant details excluding the current user
            const participantIds = chatData.participants.filter(participantId => participantId !== id);
            const participantsDetailsArray = await Promise.all(participantIds.map(async (participantId) => {
                const userDoc = await User.doc(participantId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    return {
                        id: userDoc.id,
                        fullName: userData.fullName,
                        email: userData.email,
                    };
                }
                return null; // In case the user does not exist
            }));

            // Set participantsDetails to the first participant's details or an empty object
            chatData.participantsDetails = participantsDetailsArray[0] || {}; // Get the first participant's details

            return chatData;
        }));

        // If chats array is empty, return an empty object
        if (chats.length === 0) {
            return res.status(200).json({});
        }

        // Otherwise, return the chats array
        res.status(200).json(chats);
    } catch (error) {
        console.error('Error retrieving user chats:', error);
        res.status(500).json({ error: 'Failed to retrieve user chats' });
    }
};


module.exports = { sendMessage, sendNewMessage, getChats };
