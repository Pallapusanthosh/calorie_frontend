I-Powered Calorie Tracking & Diet Management System
🍽️ Project Overview
This project is an end-to-end AI-powered diet management system that:

Detects food items using a fine-tuned YOLOv11 model.

Estimates calories from detected food portions.

Provides personalized diet plans based on user profiles (age, weight, fitness goals).

Tracks progress with analytics dashboards (pie/bar charts).

Generates monthly reports with AI-driven insights using Google Gemini.

Built with a MERN stack (MongoDB, Express, React, Node.js) web application.

Data Preprocessing
We used Roboflow-sourced food datasets and processed them with:

1. filter.py
Removes empty label files and unmatched images.

2. split.py
Merges datasets and splits into train (80%) / valid (10%) / test (10%).

3. check_labels.py
Validates YOLO labels for incorrect class IDs.

4. class_count.py
Computes class distribution for dataset balancing.

5. mapping.py
Maps old class IDs to new ones for consistency.

6. merge.py
Combines multiple food datasets (e.g., Gulab Jamun + Biryani).

AI Model Training
Model: Fine-tuned YOLOv11 on custom food dataset.

Epochs: 100

Dataset:

68 food classes (Biryani, Gulab Jamun, etc.)

Train/Valid/Test Split: 80/10/10

Output:

Detects food items.

Estimates calories based on portion size.


🌐 Web Application (MERN Stack)
Features
User Profile Management:

Age, weight, height, fitness goal (weight loss/gain).

Calculates daily calorie intake using Harris-Benedict formula.

Food Detection & Logging:

Upload food images → AI detects items + estimates calories.

Manual entry option.

Dashboard & Analytics:

Daily/Monthly Calorie Tracking (Pie/Bar Charts).

Progress visualization.

AI-Powered Monthly Reports:

Google Gemini analyzes diet history.

Suggests improvements ("You consumed too many carbs!").

Exportable Reports:

Users can download PDF summaries.

