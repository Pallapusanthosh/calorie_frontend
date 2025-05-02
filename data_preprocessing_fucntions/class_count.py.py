import os
import yaml
import time
from collections import defaultdict
from threading import Lock
from concurrent.futures import ThreadPoolExecutor

# --- Set Root Folder ---
root_folder = "C:/Users/kesan/Desktop/final_dataset/final_food_train/biryanis (copy 1) - Copy"
splits = ["train", "test", "valid"]

# --- Load data.yaml ---
yaml_path = os.path.join(root_folder, "data.yaml")
with open(yaml_path, 'r') as f:
    data = yaml.safe_load(f)

class_names = data.get('names', [])
num_classes = data.get('nc', len(class_names))

# --- Shared Structures ---
class_counts_by_split = {split: defaultdict(int) for split in splits}   # total occurrences
class_images_by_split = {split: defaultdict(set) for split in splits}   # unique image count
lock = Lock()

# --- Worker Function ---
def process_label_file(args):
    label_file, split = args
    label_path = os.path.join(root_folder, split, "labels", label_file)
    image_name = os.path.splitext(label_file)[0]

    try:
        with open(label_path, 'r') as f:
            lines = f.readlines()
    except:
        return

    local_classes = set()

    with lock:
        for line in lines:
            parts = line.strip().split()
            if parts:
                class_id = int(parts[0])
                if 0 <= class_id < num_classes:
                    class_counts_by_split[split][class_id] += 1
                    local_classes.add(class_id)

        for cid in local_classes:
            class_images_by_split[split][cid].add(image_name)

# --- Start Timer ---
start = time.time()

# --- Process Files ---
tasks = []
for split in splits:
    labels_dir = os.path.join(root_folder, split, "labels")
    if not os.path.exists(labels_dir):
        continue
    label_files = [f for f in os.listdir(labels_dir) if f.endswith('.txt')]
    tasks.extend([(f, split) for f in label_files])

with ThreadPoolExecutor() as executor:
    executor.map(process_label_file, tasks)

# --- Gather All Class Stats ---
class_stats = []
for class_id in range(num_classes):
    name = class_names[class_id] if class_id < len(class_names) else f"Class {class_id}"
    train_occ = class_counts_by_split["train"][class_id]
    test_occ = class_counts_by_split["test"][class_id]
    valid_occ = class_counts_by_split["valid"][class_id]
    train_imgs = len(class_images_by_split["train"][class_id])
    test_imgs = len(class_images_by_split["test"][class_id])
    valid_imgs = len(class_images_by_split["valid"][class_id])
    class_stats.append((name, train_occ, train_imgs, test_occ, test_imgs, valid_occ, valid_imgs))

# --- Sort by total train occurrences descending ---
class_stats.sort(key=lambda x: x[2], reverse=True)

# --- Print Table ---
print(f"\n{'Name':<25} {'Train Occ':>10} {'Train Img':>10} {'Test Occ':>10} {'Test Img':>10} {'Valid Occ':>10} {'Valid Img':>10}")
print("-" * 90)
for row in class_stats:
    print(f"{row[0]:<25} {row[1]:>10} {row[2]:>10} {row[3]:>10} {row[4]:>10} {row[5]:>10} {row[6]:>10}")

print(f"\n⏱️ Done in {time.time() - start:.2f} seconds.")
