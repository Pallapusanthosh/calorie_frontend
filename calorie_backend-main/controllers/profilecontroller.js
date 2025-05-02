import User from '../models/User.js';

export const updateProfile = async (req, res) => {
  const updates = req.body;
  console.log("updates", updates);

  // Fetch existing user data first
  const user = await User.findOne({ googleId: req.user.googleId });
  if (!user) return res.status(404).send({ error: 'User not found' });

  // Update fields
  user.name = updates.name || user.name;
  user.age = updates.age || user.age;
  user.gender = updates.gender || user.gender;
  user.weight = updates.weight || user.weight;
  user.height = updates.height || user.height;
  user.goal = updates.goal || user.goal;
  user.profileFilled = true;

  // Update session info if provided
  if (updates.sessionInfo) {
    user.sessionInfo = {
      dailyCalories: updates.sessionInfo.dailyCalories,
      macros: {
        protein: updates.sessionInfo.macros.protein,
        carbs: updates.sessionInfo.macros.carbs,
        fats: updates.sessionInfo.macros.fats
      }
    };
  }

  // Recalculate BMI
  if (user.weight && user.height) {
    user.bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  }

  // Save updated user
  await user.save();

  res.send(user);
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).send({ error: 'User not found' });
  res.send(user);
};
