import os
import shutil
import random

# === CONFIG ===
base_dir = "C:/Users/kesan/Desktop/biryanis (copy 1) (copy 1)"
splits = ["train", "test", "valid"]
output_base = os.path.join(base_dir, "final_split")
split_ratios = {"train": 0.8, "valid": 0.1, "test": 0.1}

# === STEP 1: Merge All Into One Folder & Remove Duplicates ===
temp_merged = os.path.join(base_dir, "merged_temp")
merged_images_dir = os.path.join(temp_merged, "images")
merged_labels_dir = os.path.join(temp_merged, "labels")
os.makedirs(merged_images_dir, exist_ok=True)
os.makedirs(merged_labels_dir, exist_ok=True)

print("📦 Merging all splits into one...")

seen_files = set()
duplicates_skipped = 0
missing_files = 0
total_merged = 0

for split in splits:
    images_path = os.path.join(base_dir, split, "images")
    labels_path = os.path.join(base_dir, split, "labels")

    for filename in os.listdir(images_path):
        if not filename.endswith(".jpg"):
            continue

        file_id = os.path.splitext(filename)[0]
        if file_id in seen_files:
            duplicates_skipped += 1
            continue

        seen_files.add(file_id)
        src_img = os.path.join(images_path, f"{file_id}.jpg")
        src_lbl = os.path.join(labels_path, f"{file_id}.txt")
        dst_img = os.path.join(merged_images_dir, f"{file_id}.jpg")
        dst_lbl = os.path.join(merged_labels_dir, f"{file_id}.txt")

        if not os.path.exists(src_img):
            print(f"❌ Image file missing: {src_img}")
            missing_files += 1
            continue

        try:
            shutil.copy(src_img, dst_img)
            if os.path.exists(src_lbl):
                shutil.copy(src_lbl, dst_lbl)
            total_merged += 1
        except Exception as e:
            print(f"❌ Failed to copy {src_img}: {e}")
            continue

print(f"\n✅ Total unique files merged: {total_merged}")
print(f"⚠️  Duplicate files skipped: {duplicates_skipped}")
print(f"❗ Missing image files skipped: {missing_files}")

# === STEP 2: Shuffle and Split ===
print("\n✂️ Splitting into train/valid/test...")

all_files = list(seen_files)
random.shuffle(all_files)

train_count = int(len(all_files) * split_ratios["train"])
valid_count = int(len(all_files) * split_ratios["valid"])

splits_data = {
    "train": all_files[:train_count],
    "valid": all_files[train_count:train_count + valid_count],
    "test": all_files[train_count + valid_count:]
}

for split, file_ids in splits_data.items():
    split_img_dir = os.path.join(output_base, split, "images")
    split_lbl_dir = os.path.join(output_base, split, "labels")
    os.makedirs(split_img_dir, exist_ok=True)
    os.makedirs(split_lbl_dir, exist_ok=True)

    for file_id in file_ids:
        src_img = os.path.join(merged_images_dir, f"{file_id}.jpg")
        src_lbl = os.path.join(merged_labels_dir, f"{file_id}.txt")
        dst_img = os.path.join(split_img_dir, f"{file_id}.jpg")
        dst_lbl = os.path.join(split_lbl_dir, f"{file_id}.txt")

        if not os.path.exists(src_img):
            print(f"⚠️ Image missing during split: {src_img}")
            continue

        try:
            shutil.copy(src_img, dst_img)
            if os.path.exists(src_lbl):
                shutil.copy(src_lbl, dst_lbl)
        except Exception as e:
            print(f"⚠️ Skipping {file_id} during split due to error: {e}")
            continue

    print(f"📁 {split.upper():<5} — {len(file_ids)} files")

# === Optional Cleanup: Remove Temp Folder ===
shutil.rmtree(temp_merged)
print("\n🧹 Temp folder cleaned up.")
print("🎉 All done! Check 'final_split/' for results.")
