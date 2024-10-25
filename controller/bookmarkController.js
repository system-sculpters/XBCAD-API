const { Bookmark, admin, db } = require('../config/firebaseConfig');


const bookmarkProperty = async (req, res) => {
    const { propertyId } = req.params;
    const { userId } = req.body;

    try {
        // Check if the property is already bookmarked by the user
        const bookmarksSnapshot = await Bookmark
            .where('userId', '==', userId)
            .where('propertyId', '==', propertyId)
            .get();

        if (!bookmarksSnapshot.empty) {
            // If a bookmark already exists, return a message
            return res.status(400).json({ message: 'Property is already bookmarked' });
        }

        // If no bookmark exists, create a new one
        await Bookmark.add({
            userId: userId,
            propertyId: propertyId,
            createdAt: Date.now()
        });

        console.log('Property bookmarked successfully');
        res.status(200).json({ message: 'Property bookmarked successfully' });
    } catch (error) {
        console.error('Error bookmarking property:', error);
        res.status(500).json({ error: 'Failed to bookmark property' });
    }
};


const unbookmarkProperty = async (req, res) => {
    const { propertyId, userId } = req.query;
    
    const batch = db.batch()

    try {
        // Use Admin SDK's Firestore
        const bookmarksSnapshot = await Bookmark
            .where('userId', '==', userId)
            .where('propertyId', '==', propertyId)
            .get();

        if (bookmarksSnapshot.empty) {
            console.log('Bookmark not found');
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        // Initialize Firestore batch using Admin SDK
        bookmarksSnapshot.forEach(doc => {
            batch.delete(doc.ref);  // Correct use of document reference
        });

        // Commit the batch
        await batch.commit();

        console.log('Property unbookmarked successfully');
        res.status(200).json({ message: 'Property unbookmarked successfully' });
    } catch (error) {
        console.error('Error unbookmarking property:', error);
        res.status(500).json({ error: 'Failed to unbookmark property' });
    }
};


module.exports = { bookmarkProperty, unbookmarkProperty }