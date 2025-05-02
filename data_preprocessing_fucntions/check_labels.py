import os
import glob

def check_label_files(root_dir):
    # List to store files with invalid labels
    invalid_files = []
    
    # Walk through all directories
    for root, dirs, files in os.walk(root_dir):
        # Look for txt files in labels directories
        if 'labels' in root.lower():
            txt_files = glob.glob(os.path.join(root, '*.txt'))
            
            for txt_file in txt_files:
                try:
                    with open(txt_file, 'r') as f:
                        lines = f.readlines()
                        for line_num, line in enumerate(lines, 1):
                            # YOLO format: class x y w h
                            parts = line.strip().split()
                            if parts:  # Check if line is not empty
                                class_id = int(float(parts[0]))  # Convert to float first to handle decimal points
                                if class_id > 67:
                                    invalid_files.append({
                                        'file': txt_file,
                                        'line_number': line_num,
                                        'class_id': class_id
                                    })
                except Exception as e:
                    print(f"Error processing file {txt_file}: {str(e)}")

    return invalid_files

def main():
    root_directory = "final_food_train"  # Change this to your dataset root directory
    
    print("Searching for label files with class IDs > 67...")
    invalid_files = check_label_files(root_directory)
    
    if invalid_files:
        print("\nFound files with invalid class IDs (> 67):")
        for item in invalid_files:
            print(f"\nFile: {item['file']}")
            print(f"Line number: {item['line_number']}")
            print(f"Invalid class ID: {item['class_id']}")
        print(f"\nTotal files with invalid labels: {len(set(item['file'] for item in invalid_files))}")
    else:
        print("\nNo files found with class IDs greater than 67.")

if __name__ == "__main__":
    main() 