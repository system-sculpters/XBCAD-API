const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 3001

app.use(cors());
app.use(express.json());

const authRoute = require('./routes/authRoutes');
const propertyRoute = require('./routes/propertyRoutes');
const valuationRoute = require('./routes/valuationRoutes');
const chatRoute = require('./routes/chatRoutes');
const bookmarkRoute = require('./routes/bookmarkRoutes');
const userRoute = require('./routes/userRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');


app.use('/api/auth/', authRoute);
app.use('/api/property/', propertyRoute);
app.use('/api/valuation/', valuationRoute);
app.use('/api/chat/', chatRoute);
app.use('/api/bookmark/', bookmarkRoute);
app.use('/api/user/', userRoute);
app.use('/api/purchase/', purchaseRoutes);
app.use('/api/analytics/', analyticsRoutes);

app.listen(PORT, () =>{
    console.log(`backend server is running at localhost:${PORT}`);
}); 