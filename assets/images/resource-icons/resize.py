import os
from PIL import Image
from tqdm import tqdm

def process_images():
    # 1. Get the EXACT directory where this script is saved
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Supported file extensions
    valid_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
    
    # 2. Get list of image files specifically in the script's folder
    files = [f for f in os.listdir(script_dir) if f.lower().endswith(valid_extensions)]
    
    if not files:
        print(f"No images found in: {script_dir}")
        return

    print(f"Found {len(files)} images in {script_dir}. Starting processing...")

    for filename in tqdm(files, desc="Processing Images", unit="img"):
        # 3. Create the FULL path to the image
        file_path = os.path.join(script_dir, filename)
        
        try:
            with Image.open(file_path) as img:
                # Convert to RGB (standardizes JPG/PNG handling)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Calculate dimensions for centered square crop
                width, height = img.size
                min_dim = min(width, height)
                
                left = (width - min_dim) / 2
                top = (height - min_dim) / 2
                right = (width + min_dim) / 2
                bottom = (height + min_dim) / 2
                
                # Crop and Resize to 100x100
                img = img.crop((left, top, right, bottom))
                img = img.resize((100, 100), Image.Resampling.LANCZOS)
                
                # 4. Save back to the FULL path (overwriting original)
                img.save(file_path)
                
        except Exception as e:
            print(f"\nError processing {filename}: {e}")

if __name__ == "__main__":
    process_images()
    print("\nDone! Your images are now 100x100 squares.")