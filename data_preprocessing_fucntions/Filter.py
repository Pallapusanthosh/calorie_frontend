import os

# Define directories
text_dir ="C:/Users/kesan/Desktop/final_dataset/final_food_train/Cashew/valid/labels/"
# text_dir=''
image_dir = 'C:/Users/kesan/Desktop/final_dataset/final_food_train/Cashew/valid/images/'


# List all text files
for text_file in os.listdir(text_dir):
    if text_file.endswith(".txt"):  # Ensure it's a text file
        text_path = os.path.join(text_dir, text_file)

        # Read the file and check if it's empty (ignoring spaces/newlines)
        with open(text_path, "r") as f:
            content = f.read().strip()
        
        if not content:  # If empty, delete text file and corresponding image
            image_name = os.path.splitext(text_file)[0]  # Remove .txt extension
            image_extensions = [".jpg", ".png", ".jpeg"]  # Possible extensions

            for ext in image_extensions:
                image_path = os.path.join(image_dir, image_name + ext)
                if os.path.exists(image_path):
                    os.remove(image_path)
                    print(f"Deleted image: {image_path}")

            os.remove(text_path)
            print(f"Deleted text file: {text_path}")