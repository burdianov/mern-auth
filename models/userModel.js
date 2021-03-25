const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name!'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please enter your email!'],
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Please enter your password!']
    },
    role: {
      type: Number,
      default: 0 // 0 = user, 1 = admin
    },
    avatar: {
      type: String,
      default:
        'https://res.cloudinary.com/enggym/image/upload/v1616008339/avatar/xay1mon92rcwuctjtfo6.png'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
