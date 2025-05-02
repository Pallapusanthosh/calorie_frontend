import os
import shutil

# === CONFIG ===
source_base = r"C:\Users\kesan\Desktop\final_dataset\final_food_train\Gulab jamun"  # CHANGE THIS
destination_base = r"C:\Users\kesan\Desktop\final_dataset\final_food_train\biryanis (copy 1)"

splits = ['train', 'test', 'valid']

for split in splits:
    src_img_dir = os.path.join(source_base, split, "images")
    src_lbl_dir = os.path.join(source_base, split, "labels")

    dest_img_dir = os.path.join(destination_base, split, "images")
    dest_lbl_dir = os.path.join(destination_base, split, "labels")

    # Make sure destination folders exist
    os.makedirs(dest_img_dir, exist_ok=True)
    os.makedirs(dest_lbl_dir, exist_ok=True)

    for filename in os.listdir(src_img_dir):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            img_path = os.path.join(src_img_dir, filename)
            label_filename = os.path.splitext(filename)[0] + ".txt"
            label_path = os.path.join(src_lbl_dir, label_filename)

            # Confirm both image and label exist before moving
            if os.path.exists(label_path):
                shutil.move(img_path, os.path.join(dest_img_dir, filename))
                shutil.move(label_path, os.path.join(dest_lbl_dir, label_filename))
                print(f"✅ Moved: {filename} and {label_filename}")
            else:
                print(f"⚠️ Label not found for image: {filename} — Skipping")

print("🎉 Merge complete!")
