const mongoose = require('mongoose');

const url = /*'mongodb://localhost:27017/userData'*/`mongodb://127.0.0.1:27017/Confetti_cuisine`;
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || url, {
           
        });
        console.log('Database is connected');
    } catch (err) {
        console.error('Error connecting to the database:', err);
        //process.exit(1);
    }
};

module.exports = connectDB;
