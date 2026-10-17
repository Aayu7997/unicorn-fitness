import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_splash():
    width, height = 1284, 2778 # iPhone 13 Pro Max resolution
    
    # 1. Create base dark background
    base_color = (10, 10, 15) # Very dark slate/black
    img = Image.new('RGB', (width, height), base_color)
    
    # 2. Add the glowing gradient at the top right
    # To do this, we'll draw some circles on a separate layer and blur it heavily
    glow_layer = Image.new('RGB', (width, height), base_color)
    draw = ImageDraw.Draw(glow_layer)
    
    # Purple glow
    purple = (94, 43, 122) # #5e2b7a
    # Peach glow
    peach = (211, 161, 126) # #d3a17e
    
    # Draw large soft circles
    draw.ellipse([width - 800, -200, width + 400, 1000], fill=purple)
    draw.ellipse([width - 400, -100, width + 200, 500], fill=peach)
    
    # Heavily blur the glow layer
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=300))
    
    # Blend glow with base
    img = Image.blend(img, glow_layer, alpha=0.8)
    
    # 3. Add the UFC Gym icon in the center
    icon_path = '../public/images/unicorn-logo.png'
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        
        # Resize icon to a reasonable size (e.g., 400x400)
        target_size = 400
        # Calculate aspect ratio
        aspect = icon.width / icon.height
        new_w = target_size
        new_h = int(target_size / aspect)
        icon = icon.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Calculate position to center
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        
        # Paste icon using its alpha channel as mask
        img.paste(icon, (x, y), icon)
    
    # Save the new splash screen
    save_path = os.path.join(os.getcwd(), 'assets', 'images', 'splash.png')
    # Try deleting it first if it's locked
    if os.path.exists(save_path):
        try:
            os.remove(save_path)
        except Exception:
            pass
    img.save(save_path)
    print(f"Created {save_path}")

if __name__ == '__main__':
    create_splash()
