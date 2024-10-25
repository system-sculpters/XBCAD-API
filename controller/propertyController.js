const { Property, Bookmark, User, admin } = require('../config/firebaseConfig');

// Get All Properties
// const getProperties = async (req, res) => {
//     const { userId } = req.query; // Assuming userId is passed as a query parameter

//     try {
//         // Retrieve all properties
//         const snapshot = await Property.get();
//         const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//         // If userId is provided, check bookmarks
//         let bookmarkedProperties = [];
//         if (userId) {
//             const bookmarksSnapshot = await Bookmark.where('userId', '==', userId).get();
//             bookmarkedProperties = bookmarksSnapshot.docs.map(doc => doc.data().propertyId); // List of bookmarked property IDs
//         }

//         // Mark properties as bookmarked if they are in the user's bookmarks
//         const propertiesWithBookmarkStatus = list.map(property => ({
//             ...property,
//             isBookmarked: bookmarkedProperties.includes(property.id), // Add bookmark status to each property
//         }));

//         console.log(propertiesWithBookmarkStatus);

//         // Respond with the properties and bookmark status
//         res.status(200).json(propertiesWithBookmarkStatus);
//     } catch (error) {
//         console.error('Error getting properties:', error);
//         res.status(500).json({ error: 'Failed to fetch properties' });
//     }
// };

const getProperties = async (req, res) => {
    const { userId } = req.query; // Assuming userId is passed as a query parameter

    try {
        // Retrieve all properties
        const snapshot = await Property.get();
        const propertiesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // If userId is provided, check bookmarks
        let bookmarkedProperties = [];
        if (userId) {
            const bookmarksSnapshot = await Bookmark.where('userId', '==', userId).get();
            bookmarkedProperties = bookmarksSnapshot.docs.map(doc => doc.data().propertyId); // List of bookmarked property IDs
        }

        // Fetch user information for each property and mark properties as bookmarked if they are in the user's bookmarks
        const propertiesWithDetails = await Promise.all(propertiesList.map(async property => {
            // Fetch user details based on ownerId
            const userSnapshot = await User.doc(property.ownerId).get();
            const userData = userSnapshot.exists ? userSnapshot.data() : null; // Get user data if exists

            return {
                ...property,
                isBookmarked: bookmarkedProperties.includes(property.id), // Add bookmark status to each property
                user: userData || {}, // Add user data or an empty object if not found
            };
        }));

        console.log(propertiesWithDetails);

        // Respond with the properties and bookmark status
        res.status(200).json(propertiesWithDetails);
    } catch (error) {
        console.error('Error getting properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
};


const createProperty = async (req, res) => {
    try {
        const propertyData = JSON.parse(req.body.property); // Parse the JSON property data
        console.log(`property data: ${JSON.stringify(propertyData)}`);
        const { title, price, propertyType, location, rooms, bathrooms, parking, size, description, agentId, ownerId } = propertyData;

        // Check for missing required fields
        if (!title || !price || !propertyType || !location || !location.latitude || !location.longitude || !req.files || !req.files.images || req.files.images.length === 0) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Firebase bucket for image storage
        const bucket = admin.storage().bucket();
        const imageUrls = [];

        // Function to upload images to Firebase Storage
        const uploadImage = (file) => {
            return new Promise((resolve, reject) => {
                const fileName = Date.now() + '-' + file.originalname; // Unique filename
                const fileRef = bucket.file(fileName); // Reference to the file in Firebase Storage

                const stream = fileRef.createWriteStream({
                    metadata: {
                        contentType: file.mimetype, // Set file type
                    },
                });

                stream.on('error', (err) => {
                    console.error('Error uploading file:', err);
                    reject(new Error('Failed to upload image'));
                });

                stream.on('finish', async () => {
                    // Make the file publicly accessible
                    await fileRef.makePublic();
                    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
                    console.log(`Image uploaded: ${imageUrl}`);
                    resolve(imageUrl); // Return the image URL
                });

                // End the stream and upload the file
                stream.end(file.buffer);
            });
        };

        // Iterate over the uploaded images
        for (const file of req.files.images) {
            console.log(`Uploading file: ${file.originalname}`);
            const imageUrl = await uploadImage(file); // Upload the image and get its URL
            imageUrls.push(imageUrl); // Store the uploaded image URL
        }

        // Create new property object with required data
        const newProperty = {
            title,
            price,
            propertyType,
            location: {
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
            },
            rooms,
            bathrooms,
            parking,
            size,
            description,
            agentId,
            ownerId,
            createdAt: Date.now(),
            images: imageUrls, // Store image URLs
            status: "For sale"
        };

        console.log(`New property: ${JSON.stringify(newProperty)}`);

        // Add the new property to Firestore
        await Property.add(newProperty);

        // Respond with success and the created property
        res.status(201).json({ message: 'Property created successfully.', property: newProperty });
    } catch (error) {
        console.error('Error creating property:', error);
        return res.status(500).json({ error: 'Failed to create property' });
    }
};


// Update Property
// const updateProperty = async (req, res) => {
//     const { id } = req.params;
//     const { title, price, type, location, latitude, longitude, rooms, bathrooms, parking, size, description, agentId } = req.body;

//     const updatedAt = Date.now();

//     try {
//         // Check if the property exists
//         const PropertyRef = Property.doc(id);
//         const doc = await PropertyRef.get();

//         if (!doc.exists) {
//             return res.status(404).json({ error: 'Property not found' });
//         }

//         const updatedProperty = {
//             title,
//             price,
//             type,  // e.g., 'buy house', 'rent house', 'buy land'
//             location: {
//                 address: location,
//                 latitude: latitude,
//                 longitude: longitude,
//             },
//             rooms,
//             bathrooms,
//             parking,
//             size,
//             description,
//             agentId,
//             updatedAt: updatedAt,
//         };

//         await PropertyRef.update(updatedProperty);
//         res.status(200).json({ message: 'Property updated successfully.' });
//     } catch (error) {
//         console.error('Error updating property:', error);
//         res.status(500).json({ error: 'Failed to update property' });
//     }
// };

// Update Property
const updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, price, type, location, latitude, longitude, rooms, bathrooms, parking, size, description, agentId } = req.body;

    const updatedAt = Date.now();

    try {
        // Check if the property exists
        const PropertyRef = Property.doc(id);
        const doc = await PropertyRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const existingProperty = doc.data(); // Get existing property data
        const updatedProperty = {
            title,
            price,
            type,  // e.g., 'buy house', 'rent house', 'buy land'
            location: {
                address: location,
                latitude: latitude,
                longitude: longitude,
            },
            rooms,
            bathrooms,
            parking,
            size,
            description,
            agentId,
            updatedAt: updatedAt,
        };

        // Check if images are uploaded
        if (req.files && req.files.images) {
            const bucket = admin.storage().bucket();
            const imageUrls = [];

            // Function to upload images to Firebase Storage
            const uploadImage = (file) => {
                return new Promise((resolve, reject) => {
                    const fileName = Date.now() + '-' + file.originalname; // Unique filename
                    const fileRef = bucket.file(fileName); // Reference to the file in Firebase Storage

                    const stream = fileRef.createWriteStream({
                        metadata: {
                            contentType: file.mimetype, // Set file type
                        },
                    });

                    stream.on('error', (err) => {
                        console.error('Error uploading file:', err);
                        reject(new Error('Failed to upload image'));
                    });

                    stream.on('finish', async () => {
                        // Make the file publicly accessible
                        await fileRef.makePublic();
                        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
                        console.log(`Image uploaded: ${imageUrl}`);
                        resolve(imageUrl); // Return the image URL
                    });

                    // End the stream and upload the file
                    stream.end(file.buffer);
                });
            };

            // Iterate over the uploaded images
            for (const file of req.files.images) {
                console.log(`Uploading file: ${file.originalname}`);
                const imageUrl = await uploadImage(file); // Upload the image and get its URL
                imageUrls.push(imageUrl); // Store the uploaded image URL
            }

            // Update the property images with the new image URLs
            updatedProperty.images = imageUrls; // Store image URLs
        } else {
            // If no new images are uploaded, keep the existing images
            updatedProperty.images = existingProperty.images; // Maintain existing images
        }

        // Update the property in Firestore
        await PropertyRef.update(updatedProperty);
        res.status(200).json({ message: 'Property updated successfully.' });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ error: 'Failed to update property' });
    }
};



// Delete Property
const deleteProperty = async (req, res) => {
    const { id } = req.params;
    try {
        const PropertyRef = Property.doc(id);
        const doc = await PropertyRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Property not found' });
        }

        await PropertyRef.delete();
        res.status(200).json({ message: 'Property deleted successfully.' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
};




module.exports = { getProperties, createProperty, updateProperty, deleteProperty };
