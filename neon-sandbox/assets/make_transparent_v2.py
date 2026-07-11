import os
from PIL import Image

def process_pixel_art(image_path, output_path):
    print(f"Processing pixel art emoji: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # 1. Sample the background colors from the border of the image (outer 15 pixels)
    border_colors = []
    for x in range(width):
        for y in list(range(15)) + list(range(height - 15, height)):
            r, g, b, a = pixels[x, y]
            border_colors.append((r, g, b))
    for y in range(height):
        for x in list(range(15)) + list(range(width - 15, width)):
            r, g, b, a = pixels[x, y]
            border_colors.append((r, g, b))
            
    # Find unique/dominant background colors
    # We will cluster them or use them directly with a tolerance check
    bg_palette = list(set(border_colors))
    print(f"Sampled {len(bg_palette)} background colors from border.")
    
    def is_bg_color(r, g, b):
        # Check distance to any sampled border color
        for br, bg, bb in bg_palette:
            # Euclidean distance in RGB color space
            dist = ((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2) ** 0.5
            if dist < 45: # Tolerant threshold to handle compression artifacts
                return True
        return False

    # 2. Run flood-fill from the corners
    visited = set()
    to_visit = []
    
    # Seed corners and borders
    for x in range(width):
        to_visit.append((x, 0))
        to_visit.append((x, height - 1))
    for y in range(height):
        to_visit.append((0, y))
        to_visit.append((width - 1, y))
        
    background_pixels = set()
    
    while to_visit:
        x, y = to_visit.pop()
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
            
        r, g, b, a = pixels[x, y]
        
        if is_bg_color(r, g, b):
            background_pixels.add((x, y))
            # Check 4-way neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                    to_visit.append((nx, ny))
                    
    # 3. Apply transparency
    for x in range(width):
        for y in range(height):
            if (x, y) in background_pixels:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(output_path, "PNG")
    print(f"Saved transparent pixel art to {output_path}")


def process_neon(image_path, output_path):
    print(f"Processing neon sticker: {image_path}")
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Threshold for dark background/boxes
    # Since neon is bright, we keep only pixels with high maximum RGB value
    # We smoothly scale the alpha to preserve the neon glow around edges
    for x in range(width):
        for y in range(height):
            r, g, b, a = pixels[x, y]
            brightness = max(r, g, b)
            
            # If the pixel is dark, make it fully transparent
            if brightness < 65:
                pixels[x, y] = (0, 0, 0, 0)
            elif brightness < 150:
                # Smooth transition for the glow
                alpha = int(((brightness - 65) / 85.0) * 255)
                pixels[x, y] = (r, g, b, alpha)
            else:
                # Fully opaque for bright neon cores
                pixels[x, y] = (r, g, b, 255)
                
    img.save(output_path, "PNG")
    print(f"Saved transparent neon to {output_path}")


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
            process_neon(input_path, output_path)
        else:
            process_pixel_art(input_path, output_path)

if __name__ == "__main__":
    main()
