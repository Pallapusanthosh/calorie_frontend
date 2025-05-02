import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import profileRoutes from './routes/profileroute.js';
import mealRoutes from './routes/mealroutes.js';
import calorieRoutes from './routes/calorieRoutes.js';

dotenv.config();
const app = express();

connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/meals', mealRoutes);
app.use('/calories', calorieRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
