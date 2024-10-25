const { Purchase, Property, User, Valuation } = require('../config/firebaseConfig');

const analytics = async (req, res) => {
    try {
        const purchasesSnapshot = await Purchase.get();
        let totalRevenueAmount = 0;
        const monthlyRevenueMap = {}; // Map to hold revenue by month

        purchasesSnapshot.forEach(doc => {
            const purchaseData = doc.data();
            const amount = purchaseData.amount;
            const date = new Date(purchaseData.date); // Convert timestamp to Date object
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format as YYYY-MM

            totalRevenueAmount += amount; // Aggregate total revenue

            // Aggregate revenue by month
            if (!monthlyRevenueMap[monthYear]) {
                monthlyRevenueMap[monthYear] = 0;
            }
            monthlyRevenueMap[monthYear] += amount;
        });

        // Get the last 6 months with revenue
        const revenueByMonth = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const pastMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${pastMonth.getFullYear()}-${String(pastMonth.getMonth() + 1).padStart(2, '0')}`;
            const monthName = pastMonth.toLocaleString('default', { month: 'short' }); // Get short month name

            revenueByMonth.push({
                month: monthName,
                totalRevenue: monthlyRevenueMap[monthKey] || 0 // Use 0 if no revenue recorded
            });
        }

        // Get users and categorize them into agents and regular users
        const usersSnapshot = await User.get();
        let agents = 0;
        let users = 0;

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.role === 'agent') {
                agents++;
            } else {
                users++;
            }
        });

        // Get properties and categorize them
        const propertiesSnapshot = await Property.get();
        let Land = 0;
        let Rental = 0;
        let House = 0;

        propertiesSnapshot.forEach(doc => {
            const propertyData = doc.data();
            switch (propertyData.propertyType) {
                case 'Land':
                    Land++;
                    break;
                case 'Rental':
                    Rental++;
                    break;
                case 'House':
                    House++;
                    break;
                default:
                    break;
            }
        });

        // Get valuations and categorize them
        const valuationsSnapshot = await Valuation.get();
        let completed = 0;
        let pending = 0;

        valuationsSnapshot.forEach(doc => {
            const valuationData = doc.data();
            if (valuationData.status === 'completed') {
                completed++;
            } else {
                pending++;
            }
        });

        // Return data as JSON response
        res.json({
            totalRevenueAmount,
            users: {
                agents,
                users
            },
            properties: {
                Land,
                Rental,
                House
            },
            valuations: {
                completed,
                pending
            },
            revenueByMonth // Include the revenueByMonth array in the response
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { analytics };
