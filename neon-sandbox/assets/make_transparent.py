import os
import sys
from PIL import Image

def remove_black_background(image_path, output_path):
    print(f"Processing neon sticker: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # item is (r, g, b, a)
        r, g, b, a = item
        # Calculate brightness/luminance
        brightness = max(r, g, b)
        
        # If it's very dark, make it transparent
        if brightness < 40:
            newData.append((0, 0, 0, 0))
        else:
            # Smoothly transition alpha based on brightness to preserve the glow
            # Scale brightness from [40, 255] to [0, 255]
            alpha = int(((brightness - 40) / 215.0) * 255)
            newData.append((r, g, b, alpha))
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Saved transparent PNG to {output_path}")

def is_checkered_background_color(r, g, b):
    # Check for white:
    if r > 220 and g > 220 and b > 220:
        return True
    # Check for light grey:
    if 100 < r < 210 and 100 < g < 210 and 100 < b < 210:
        if abs(r - g) < 15 and abs(r - b) < 15 and abs(g - b) < 15:
            return True
    return False

def remove_checkered_background(image_path, output_path):
    print(f"Processing pixel art emoji: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Use flood-fill from the 4 corners to find background pixels
    visited = set()
    to_visit = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    background_pixels = set()
    
    while to_visit:
        x, y = to_visit.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        # Check boundary
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        r, g, b, a = pixels[x, y]
        
        if is_checkered_background_color(r, g, b):
            background_pixels.add((x, y))
            # Queue neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    to_visit.append((nx, ny))
                    
    # Now set background pixels to transparent
    for x in range(width):
        for y in range(height):
            if (x, y) in background_pixels:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(output_path, "PNG")
    print(f"Saved transparent PNG to {output_path}")

def main():
    assets_dir = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets"
    
    stickers = [
        {"name": "neon_cannabis.jpg", "type": "neon"},
        {"name": "pixel_emoji_smile.jpg", "type": "pixel"},
        {"name": "neon_stay_high.jpg", "type": "neon"},
        {"name": "neon_heart_joint.jpg", "type": "neon"},
        {"name": "pixel_emoji_heart.jpg", "type": "pixel"},
        {"name": "neon_chill_cloud.jpg", "type": "neon"}
    ]
    
    for sticker in stickers:
        input_path = os.path.join(assets_dir, sticker["name"])
        output_name = sticker["name"].replace(".jpg", ".png")
        output_path = os.path.join(assets_dir, output_name)
        
        if not os.path.exists(input_path):
            print(f"File not found: {input_path}")
            continue
            
        if sticker["type"] == "neon":
            remove_black_background(input_path, output_path)
        else:
            remove_checkered_background(input_path, output_path)

if __name__ == "__main__":
    main()
