import cv2
import numpy as np
import os

# Your existing classifier's predict function
# Replace this with your actual model's prediction method
def predict_food(image):
    # image: cropped food image (numpy array)
    # Should return the predicted food class
    return "predicted_class"

# Load the plate image
image_path = 'food_plate.jpg'
image = cv2.imread(image_path)
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply thresholding to separate food regions
_, thresh = cv2.threshold(gray, 160, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Create output folder
os.makedirs("cropped_items", exist_ok=True)

# Process each contour
for i, contour in enumerate(contours):
    x, y, w, h = cv2.boundingRect(contour)
    
    # Skip very small areas (noise)
    if w * h < 500:
        continue

    # Crop the food item
    cropped_item = image[y:y+h, x:x+w]

    # Save cropped item
    cropped_path = f"cropped_items/item_{i+1}.jpg"
    cv2.imwrite(cropped_path, cropped_item)

    # Predict using your classifier
    prediction = predict_food(cropped_item)
    print(f"Item {i+1}: {prediction} (saved to {cropped_path})")

print("✅ Segmentation, cropping, and classification done.")
