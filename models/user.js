const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema(
  {
    oauthId: {
      type: String,
      required: true,
      unique: true, 
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false, 
    },
   
    },
    dateJoined, {
      type: Date,
      default: Date.now,
    },

  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create the User model
const User = mongoose.model('User', UserSchema);

// Export the model
module.exports = User;
