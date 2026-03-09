const mongoose = require("mongoose");

let db ="mongodb+srv://manishpdotpitchtechnologies_db_user:A9VEqyEY4pDOyDQ1@cluster0.5jm0szh.mongodb.net/"
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

  }
};

module.exports = connectDB;

