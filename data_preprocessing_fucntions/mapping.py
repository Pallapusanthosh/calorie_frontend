

import os

def replace_class_ids(dataset_root, class_id_mapping):
    """
    Replace class IDs in YOLO label files under train/test/valid/labels folders.

    Parameters:
    - dataset_root: Root folder containing train/test/valid subfolders.
    - class_id_mapping: Dictionary with old_id as key and new_id as value.
    """
    subsets = ['train', 'test', 'valid']

    for subset in subsets:
        labels_folder = os.path.join(dataset_root, subset, 'labels')
        if not os.path.exists(labels_folder):
            print(f"Labels folder not found: {labels_folder}")
            continue

        for file in os.listdir(labels_folder):
            if not file.endswith('.txt'):
                continue

            file_path = os.path.join(labels_folder, file)
            with open(file_path, 'r') as f:
                lines = f.readlines()

            updated_lines = []
            for line in lines:
                parts = line.strip().split()
                if not parts:
                    continue

                old_class_id = int(parts[0])
                new_class_id = class_id_mapping.get(old_class_id, old_class_id)
                updated_line = ' '.join([str(new_class_id)] + parts[1:])
                updated_lines.append(updated_line)

            with open(file_path, 'w') as f:
                f.write('\n'.join(updated_lines) + '\n')

            print(f"Updated: {file_path}")

# -------------------------
# Example usage
# -------------------------
if __name__ == "__main__":
    dataset_path = "C:/Users/kesan/Desktop/final_dataset/final_food_train/Gulab jamun"  # Replace with your actual path
    class_id_mapping = {
        0: 31,
        
        # Add more mappings if needed
    }

    replace_class_ids(dataset_path, class_id_mapping)

