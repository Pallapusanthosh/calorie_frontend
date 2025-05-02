import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, index: true },
  email: String,
  name: String,
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  goal: String,
  bmi: Number,
  profileFilled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  sessionInfo: {
    dailyCalories: Number,
    macros: {
      protein: Number,
      carbs: Number,
      fats: Number
    }
  }
});

export default mongoose.model('User', UserSchema);
