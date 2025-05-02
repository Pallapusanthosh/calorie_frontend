import sys
import json
import os
import traceback
from io import StringIO
import torch
from PIL import Image
import numpy as np
from ultralytics import YOLO

def check_dependencies():
    """Check if all required dependencies are installed"""
    missing_deps = []
    try:
        print(f"PyTorch version: {torch.__version__}", file=sys.stderr)
    except ImportError:
        missing_deps.append("torch")
    
    try:
        print(f"Pillow version: {Image.__version__}", file=sys.stderr)
    except ImportError:
        missing_deps.append("Pillow")
    
    try:
        print(f"NumPy version: {np.__version__}", file=sys.stderr)
    except ImportError:
        missing_deps.append("numpy")
    
    try:
        print("YOLOv8 is available", file=sys.stderr)
    except ImportError:
        missing_deps.append("ultralytics")
    
    if missing_deps:
        print(f"Missing dependencies: {', '.join(missing_deps)}", file=sys.stderr)
        print("Please install them using: pip install " + " ".join(missing_deps), file=sys.stderr)
        return False
    return True

def load_model():
    """Load the YOLO model"""
    try:
        # Get the absolute path to the model file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'best.pt')
        
        # Check if the model file exists
        if not os.path.exists(model_path):
            print(f"Model file not found: {model_path}", file=sys.stderr)
            return None
        
        print(f"Model file exists at: {model_path}", file=sys.stderr)
        print(f"Model file size: {os.path.getsize(model_path)} bytes", file=sys.stderr)
        
        # Load the YOLO model
        print(f"Loading YOLO model from {model_path}...", file=sys.stderr)
        
        # Check if CUDA is available
        if torch.cuda.is_available():
            print("CUDA is available, using GPU", file=sys.stderr)
            device = "cuda"
        else:
            print("CUDA is not available, using CPU", file=sys.stderr)
            device = "cpu"
        
        # Load the model using YOLOv8
        model = YOLO(model_path)
        
        print("Model loaded successfully", file=sys.stderr)
        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return None

def process_image(image_path):
    """Process the image with the YOLO model and return only the highest confidence class"""
    try:
        # Check dependencies
        if not check_dependencies():
            sys.exit(1)
        
        # Check if the image file exists
        if not os.path.exists(image_path):
            print(f"Image file not found: {image_path}", file=sys.stderr)
            sys.exit(1)
        
        print(f"Image file exists at: {image_path}", file=sys.stderr)
        print(f"Image file size: {os.path.getsize(image_path)} bytes", file=sys.stderr)
        
        # Load the model
        model = load_model()
        if model is None:
            sys.exit(1)
        
        # Load and preprocess the image
        print(f"Loading image: {image_path}", file=sys.stderr)
        image = Image.open(image_path)
        print(f"Image size: {image.size}", file=sys.stderr)
        print(f"Image mode: {image.mode}", file=sys.stderr)
        
        # Perform inference
        print("Performing inference...", file=sys.stderr)
        results = model(image_path, conf=0.1, verbose=False)

        # Process results to get the prediction with the highest confidence
        best_prediction = None
        for result in results:
            boxes = result.boxes
            for box in boxes:
                conf = float(box.conf[0])
                if best_prediction is None or conf > best_prediction['confidence']:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    cls = int(box.cls[0])
                    class_name = result.names[cls]

                    best_prediction = {
                        'name': class_name,
                        'confidence': conf,
                        'bbox': [float(x1), float(y1), float(x2), float(y2)],
                        'calories': get_calories_for_food(class_name)
                    }

        if best_prediction:
            print("Found 1 best food item", file=sys.stderr)
            print(json.dumps([best_prediction]), flush=True)  # Output as a list
        else:
            print("No food items found", file=sys.stderr)
            print(json.dumps([]), flush=True)

    except Exception as e:
        print(f"Error processing image: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
def get_calories_for_food(food_name):
    """Get calories per 100g for a food item from the updated database"""
    import os, json
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'calorie_Database.json')

    with open(json_path) as f:
        calorie_database = json.load(f)

    food_name = food_name.lower()

    for item in calorie_database:
        if item["name"].lower() == food_name:
            return item.get("calories", 100)  # Default to 100 if calories key missing
    
    return 100  # Default if food not found


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python process_image.py <image_path>", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    process_image(image_path) 