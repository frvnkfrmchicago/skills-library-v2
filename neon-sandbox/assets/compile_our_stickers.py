import os
import glob
import math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

# Configure directories
brain_dir = "/Users/franklawrencejr./.gemini/antigravity/brain/980fa7bd-08c4-408d-9d73-7c7fb31a8d87"
project_assets_dir = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets"

def compile_sheet_to_gif(sheet_path, out_path, is_pixel=False, grid_size=3, num_frames=None, duration=120, keep_background=False):
    sheet = Image.open(sheet_path).convert("RGBA")
    cell_w = sheet.width // grid_size
    cell_h = sheet.height // grid_size
    
    frames = []
    if num_frames is None:
        num_frames = grid_size * grid_size
        
    for i in range(num_frames):
        col = i % grid_size
        row = i // grid_size
        
        # Crop the frame
        left = col * cell_w
        top = row * cell_h
        right = left + cell_w
        bottom = top + cell_h
        
        cell = sheet.crop((left, top, right, bottom))
        
        # Center Crop to remove F1-F9 or grid numbers (15% margin)
        margin_w = int(cell_w * 0.15)
        margin_h = int(cell_h * 0.15)
        
        frame = cell.crop((
            margin_w,
            margin_h,
            cell_w - margin_w,
            cell_h - margin_h
        )).resize((512, 512), Image.Resampling.LANCZOS)
        
        if keep_background:
            frame_p = frame.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
            frames.append(frame_p)
            continue
            
        # Key out black background for transparency glow
        datas = frame.getdata()
        new_data = []
        for item in datas:
            r, g, b, a = item
            brightness = max(r, g, b)
            if is_pixel:
                if brightness < 20:
                    new_data.append((0, 0, 0, 0))
                else:
                    new_data.append((r, g, b, 255))
            else:
                if brightness < 18:
                    new_data.append((0, 0, 0, 0))
                else:
                    alpha_val = min(255, int(brightness * 1.3))
                    new_data.append((r, g, b, alpha_val))
        frame.putdata(new_data)
        
        # Fringe matching for backdrop (#0f0f15)
        alpha = frame.split()[3]
        bg = Image.new("RGBA", frame.size, (15, 15, 21, 255))
        fringe_blended = Image.alpha_composite(bg, frame)
        
        temp_rgb = fringe_blended.convert("RGB")
        temp_rgb.paste((255, 0, 255), mask=Image.eval(alpha, lambda a: 255 if a <= 15 else 0))
        temp_rgb.putpixel((0, 0), (255, 0, 255))
        
        frame_p = temp_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=254)
        try:
            trans_idx = frame_p.getpixel((0, 0))
        except:
            trans_idx = 0
            
        frame_p.info["transparency"] = trans_idx
        frames.append(frame_p)
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=duration, loop=0, disposal=2)
    print(f"Compiled sheet to GIF: {out_path}")

# Helper to draw a pixel-art style cannabis leaf in PIL
def draw_pixel_cannabis_leaf(draw, cx, cy, scale, color):
    # Center stem
    draw.line([(cx, cy + int(10 * scale)), (cx, cy - int(15 * scale))], fill=color, width=int(2 * scale))
    # Vertical lobe (up)
    draw.polygon([(cx - int(3 * scale), cy - int(3 * scale)), (cx + int(3 * scale), cy - int(3 * scale)), (cx, cy - int(22 * scale))], fill=color)
    # Upper diagonals
    draw.polygon([(cx - int(4 * scale), cy - int(2 * scale)), (cx - int(2 * scale), cy - int(6 * scale)), (cx - int(17 * scale), cy - int(15 * scale))], fill=color)
    draw.polygon([(cx + int(4 * scale), cy - int(2 * scale)), (cx + int(2 * scale), cy - int(6 * scale)), (cx + int(17 * scale), cy - int(15 * scale))], fill=color)
    # Middle diagonals
    draw.polygon([(cx - int(4 * scale), cy + int(2 * scale)), (cx - int(1 * scale), cy - int(3 * scale)), (cx - int(21 * scale), cy - int(3 * scale))], fill=color)
    draw.polygon([(cx + int(4 * scale), cy + int(2 * scale)), (cx + int(1 * scale), cy - int(3 * scale)), (cx + int(21 * scale), cy - int(3 * scale))], fill=color)
    # Lower diagonals
    draw.polygon([(cx - int(3 * scale), cy + int(5 * scale)), (cx, cy), (cx - int(14 * scale), cy + int(8 * scale))], fill=color)
    draw.polygon([(cx + int(3 * scale), cy + int(5 * scale)), (cx, cy), (cx + int(14 * scale), cy + int(8 * scale))], fill=color)

def compile_transparent_frames_to_gif(frames, out_path, duration=120):
    gif_frames = []
    for frame in frames:
        alpha = frame.split()[3]
        bg = Image.new("RGBA", frame.size, (15, 15, 21, 255))
        fringe_blended = Image.alpha_composite(bg, frame)
        temp_rgb = fringe_blended.convert("RGB")
        temp_rgb.paste((255, 0, 255), mask=Image.eval(alpha, lambda a: 255 if a <= 15 else 0))
        temp_rgb.putpixel((0, 0), (255, 0, 255))
        
        frame_p = temp_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=254)
        try:
            trans_idx = frame_p.getpixel((0, 0))
        except:
            trans_idx = 0
            
        frame_p.info["transparency"] = trans_idx
        gif_frames.append(frame_p)
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    gif_frames[0].save(out_path, save_all=True, append_images=gif_frames[1:], duration=duration, loop=0, disposal=2)
    print(f"Compiled programmatic GIF: {out_path}")

# Programmatic Sticker 1: Coffee Cup with Weed Leaf
def make_pixel_coffee_weed():
    in_gif_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/pixel/pixel_coffee_steam.gif"
    if not os.path.exists(in_gif_path):
        print(f"Error: Original coffee steam GIF not found at {in_gif_path}")
        return
        
    in_gif = Image.open(in_gif_path)
    frames = []
    
    # 11x11 leaf pixel mask
    leaf_pattern = [
        [0,0,0,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,1,0,0,1,1,1,0,0,1,0],
        [0,1,1,0,1,1,1,0,1,1,0],
        [0,1,1,1,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,1,1,1,0,0],
        [0,0,0,1,1,1,1,1,0,0,0],
        [0,0,0,0,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0,0]
    ]
    scale = 3
    
    for idx in range(in_gif.n_frames):
        in_gif.seek(idx)
        frame = in_gif.convert("RGBA")
        pixels = frame.load()
        
        # Erase the star in X[200, 305], Y[200, 284]
        for y in range(200, 285):
            for x in range(200, 306):
                r, g, b, a = pixels[x, y]
                # If it's the cream color of the star
                if r > 200 and g > 190 and b > 140:
                    pixels[x, y] = (64, 27, 19, 255) # Replace with mug's brown color
                    
        # Draw the green weed leaf centered at (246, 240)
        lx = 246 - (11 * scale) // 2
        ly = 240 - (11 * scale) // 2
        leaf_color = (30, 200, 80, 255)
        
        for r_idx in range(11):
            for c_idx in range(11):
                if leaf_pattern[r_idx][c_idx] == 1:
                    for dy in range(scale):
                        for dx in range(scale):
                            px = lx + c_idx * scale + dx
                            py = ly + r_idx * scale + dy
                            if 0 <= px < 512 and 0 <= py < 512:
                                r, g, b, a = pixels[px, py]
                                # Only color over the brown mug body
                                if a > 0 and r > 30 and g < 150:
                                    pixels[px, py] = leaf_color
                                    
        frames.append(frame)
        
    out_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/pixel/pixel_coffee_weed.gif"
    compile_transparent_frames_to_gif(frames, out_path)

# Programmatic Sticker 2: Pizza Slice with Melting Cheese & Weed Leaf Herbs
def make_pixel_pizza_weed():
    frames = []
    num_frames = 9
    
    for i in range(num_frames):
        # 512x512 canvas
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # Pizza dimensions
        # Pointy tip shifts down/up slightly for a "dripping/melting" effect
        tip_y = 420 + int(8 * math.sin((i / num_frames) * 2 * math.pi))
        
        # Draw crust at the top
        draw.rectangle([140, 140, 372, 175], fill=(139, 90, 43, 255)) # Brown crust
        draw.ellipse([140, 140, 170, 175], fill=(139, 90, 43, 255))
        draw.ellipse([342, 140, 372, 175], fill=(139, 90, 43, 255))
        
        # Draw sauce layer
        draw.polygon([(160, 170), (352, 170), (256, tip_y + 10)], fill=(200, 30, 20, 255))
        
        # Draw cheese (yellow)
        draw.polygon([(170, 175), (342, 175), (256, tip_y)], fill=(250, 210, 50, 255))
        
        # Draw Pepperonis
        peps = [(210, 210), (300, 220), (256, 280), (230, 330), (280, 340)]
        for idx, (px, py) in enumerate(peps):
            # Scale pepperoni slightly for pulsing animation
            radius = 16 + int(2 * math.sin((i / num_frames) * 2 * math.pi + idx))
            draw.ellipse([px - radius, py - radius, px + radius, py + radius], fill=(180, 25, 10, 255))
            # Pepperoni highlight
            draw.ellipse([px - radius//2, py - radius//2, px, py], fill=(210, 70, 40, 255))
            
        # Draw weed leaf herbs in green
        leaves_pos = [(256, 200), (210, 270), (300, 280), (256, 350)]
        for idx, (lx, ly) in enumerate(leaves_pos):
            draw_pixel_cannabis_leaf(draw, lx, ly, 0.7, (30, 185, 75, 255))
            
        # Rising steam
        for s in range(3):
            # Steam rises and waves side to side
            progress = ((i / num_frames) + s/3.0) % 1.0
            sy = 140 - int(90 * progress)
            sx = 256 + int(20 * math.sin(progress * 3 * math.pi + s)) + (s - 1) * 60
            opacity = int(180 * (1.0 - progress))
            if opacity > 10:
                draw.ellipse([sx - 10, sy - 5, sx + 10, sy + 5], fill=(200, 200, 200, opacity))
                
        frames.append(canvas)
        
    out_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/pixel/pixel_pizza_weed.gif"
    compile_transparent_frames_to_gif(frames, out_path)

# Programmatic Sticker 3: Neon Donut with Green Sprinkles Rotating
def make_neon_donut_weed():
    frames = []
    num_frames = 12
    
    for i in range(num_frames):
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        
        # Donut glow layer
        glow_canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow_canvas)
        
        # Center of donut
        cx, cy = 256, 256
        
        # Draw thick glowing pink ring for icing
        g_draw.ellipse([cx - 130, cy - 130, cx + 130, cy + 130], outline=(255, 20, 147, 100), width=45)
        # Inner cutout
        g_draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(0, 0, 0, 0))
        
        # Apply heavy blur to the glow layer
        glow_blurred = glow_canvas.filter(ImageFilter.GaussianBlur(10))
        canvas.alpha_composite(glow_blurred)
        
        # Sharp line layer
        draw = ImageDraw.Draw(canvas)
        # Dough outer boundary (neon yellow/orange)
        draw.ellipse([cx - 135, cy - 135, cx + 135, cy + 135], outline=(255, 180, 0, 255), width=6)
        # Dough inner boundary
        draw.ellipse([cx - 35, cy - 35, cx + 35, cy + 35], outline=(255, 180, 0, 255), width=6)
        
        # Icing shape (sharp pink)
        draw.ellipse([cx - 120, cy - 120, cx + 120, cy + 120], outline=(255, 50, 180, 255), width=28)
        
        # Neon green weed leaf sprinkles rotating
        angle_offset = (i / num_frames) * 2 * math.pi
        sprinkle_radii = [75, 80, 85, 90, 95, 100]
        
        for idx in range(8):
            angle = angle_offset + (idx * 2 * math.pi / 8)
            # Pick a radius
            r = sprinkle_radii[idx % len(sprinkle_radii)]
            sx = int(cx + r * math.cos(angle))
            sy = int(cy + r * math.sin(angle))
            
            # Draw a small 3-pointed neon green star/sprinkle
            # Lobe 1 (radial outwards)
            ex1 = int(sx + 15 * math.cos(angle))
            ey1 = int(sy + 15 * math.sin(angle))
            # Lobe 2 (left)
            ex2 = int(sx + 12 * math.cos(angle + 1.2))
            ey2 = int(sy + 12 * math.sin(angle + 1.2))
            # Lobe 3 (right)
            ex3 = int(sx + 12 * math.cos(angle - 1.2))
            ey3 = int(sy + 12 * math.sin(angle - 1.2))
            
            draw.line([(sx, sy), (ex1, ey1)], fill=(0, 255, 100, 255), width=4)
            draw.line([(sx, sy), (ex2, ey2)], fill=(0, 255, 100, 255), width=4)
            draw.line([(sx, sy), (ex3, ey3)], fill=(0, 255, 100, 255), width=4)
            
        frames.append(canvas)
        
    out_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/neon/neon_donut_weed.gif"
    compile_transparent_frames_to_gif(frames, out_path, duration=80)

# Programmatic Sticker 4: Anime Brownie Baking Tray with rising steam and sparkles
def make_anime_baking_weed():
    frames = []
    num_frames = 9
    
    for i in range(num_frames):
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # Draw anime baking tray (metal grey isometric container)
        # Coordinates: top-left (110, 220), top-right (402, 220), bottom-right (352, 360), bottom-left (160, 360)
        draw.polygon([(110, 220), (402, 220), (352, 360), (160, 360)], fill=(180, 185, 195, 255), outline=(30, 30, 30, 255), width=5)
        # Lip of the pan
        draw.polygon([(100, 215), (412, 215), (362, 365), (150, 365)], outline=(50, 50, 60, 255), width=4)
        
        # Brownies grid (isometric squares)
        # Left top X=130, right top X=382, bottom right X=332, bottom left X=180
        draw.polygon([(130, 235), (382, 235), (332, 345), (180, 345)], fill=(65, 35, 15, 255))
        
        # Grid lines for cuts
        draw.line([(214, 235), (230, 345)], fill=(30, 15, 5, 255), width=3)
        draw.line([(298, 235), (280, 345)], fill=(30, 15, 5, 255), width=3)
        draw.line([(155, 290), (357, 290)], fill=(30, 15, 5, 255), width=3)
        
        # Draw a green weed leaf on each brownie piece
        leaf_positions = [
            (170, 260), (256, 260), (340, 260),
            (210, 320), (290, 320)
        ]
        for idx, (lx, ly) in enumerate(leaf_positions):
            # Gentle breathing size sway
            sway_scale = 0.8 + 0.15 * math.sin((i / num_frames) * 2 * math.pi + idx)
            draw_pixel_cannabis_leaf(draw, lx, ly, sway_scale, (30, 210, 90, 255))
            
        # Rising Steam
        progress = (i / num_frames)
        sy = 200 - int(80 * progress)
        sx = 256 + int(20 * math.sin(progress * 2 * math.pi))
        opacity = int(140 * (1.0 - progress))
        if opacity > 10:
            draw.ellipse([sx - 15, sy - 8, sx + 15, sy + 8], fill=(230, 230, 240, opacity))
            
        # Anime sparkles (4-pointed stars)
        sparkles = [(140, 180), (380, 190)]
        for idx, (sx, sy) in enumerate(sparkles):
            size = 10 + int(8 * math.sin((i / num_frames) * 2 * math.pi + idx))
            if size > 2:
                # Top, Right, Bottom, Left
                pts = [(sx, sy - size), (sx + size//2, sy), (sx, sy + size), (sx - size//2, sy)]
                draw.polygon(pts, fill=(255, 235, 100, 255))
                
        frames.append(canvas)
        
    out_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/anime/anime_baking_weed.gif"
    compile_transparent_frames_to_gif(frames, out_path)

# Programmatic Sticker 5: Popcorn Bowl with Popping Weed Leaves
def make_pixel_popcorn_weed():
    frames = []
    num_frames = 10
    
    for i in range(num_frames):
        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        draw = ImageDraw.Draw(canvas)
        
        # Red & White striped bucket
        # Box from X[170, 342], Y[290, 450]
        # Red background
        draw.rectangle([170, 290, 342, 450], fill=(220, 25, 25, 255), outline=(20, 20, 20, 255), width=5)
        # White stripes
        draw.rectangle([200, 290, 230, 447], fill=(240, 240, 240, 255))
        draw.rectangle([250, 290, 280, 447], fill=(240, 240, 240, 255))
        draw.rectangle([300, 290, 330, 447], fill=(240, 240, 240, 255))
        
        # Popcorn piled in bucket
        # Draw clusters of yellow-cream circles
        pop_bases = [
            (190, 280), (220, 275), (256, 270), (290, 275), (320, 280),
            (205, 260), (240, 255), (275, 255), (310, 260),
            (225, 245), (256, 240), (285, 245)
        ]
        for (px, py) in pop_bases:
            draw.ellipse([px - 18, py - 18, px + 18, py + 18], fill=(255, 240, 180, 255), outline=(30, 30, 20, 255), width=2)
            draw.ellipse([px - 10, py - 10, px - 2, py - 2], fill=(255, 255, 210, 255))
            
        # Animated popping items (popcorn kernels and green leaves)
        # We model 5 popping particles on parabolic arcs
        for p in range(5):
            progress = ((i / num_frames) + p / 5.0) % 1.0
            # Start from inside bucket center
            start_x = 210 + (p * 20)
            start_y = 260
            
            # Parabolic trajectory
            # Peak height is 130px
            y_offset = int(140 * math.sin(progress * math.pi))
            py = start_y - y_offset
            # X drift
            px = start_x + int(40 * (progress - 0.5))
            
            if progress < 0.95:
                if p % 2 == 0:
                    # Popcorn kernel
                    draw.ellipse([px - 12, py - 12, px + 12, py + 12], fill=(255, 245, 190, 255), outline=(40, 40, 20, 255), width=2)
                else:
                    # Cannabis leaf
                    draw_pixel_cannabis_leaf(draw, px, py, 0.5, (30, 200, 80, 255))
                    
        frames.append(canvas)
        
    out_path = "/Users/franklawrencejr./Downloads/skills-library-v2 2/neon-sandbox/assets/stickers/pixel/pixel_popcorn_weed.gif"
    compile_transparent_frames_to_gif(frames, out_path)

if __name__ == "__main__":
    # 1. Compile 10 Partying/Cannabis Action Sheets
    sheets_config = [
        {"pattern": "pixel_party_dance_sheet_*.jpg", "out": "stickers/pixel/pixel_party_dance.gif", "pixel": True},
        {"pattern": "pixel_smoke_ring_sheet_*.jpg", "out": "stickers/pixel/pixel_smoke_ring.gif", "pixel": True},
        {"pattern": "neon_dj_groove_sheet_*.jpg", "out": "stickers/neon/neon_dj_groove.gif", "pixel": False},
        {"pattern": "neon_cheers_toast_sheet_*.jpg", "out": "stickers/neon/neon_cheers_toast.gif", "pixel": False},
        {"pattern": "anime_lounge_chill_sheet_*.jpg", "out": "stickers/anime/anime_lounge_chill.gif", "pixel": False},
        {"pattern": "anime_dance_party_sheet_*.jpg", "out": "stickers/anime/anime_dance_party.gif", "pixel": False},
        {"pattern": "cyberpunk_smoke_visor_sheet_v2_*.jpg", "out": "stickers/cyberpunk/cyberpunk_smoke_visor.gif", "pixel": False},
        {"pattern": "cyberpunk_deck_spin_sheet_v2_*.jpg", "out": "stickers/cyberpunk/cyberpunk_deck_spin.gif", "pixel": False},
        {"pattern": "cyberpunk_neon_puff_sheet_v2_*.jpg", "out": "stickers/cyberpunk/cyberpunk_neon_puff.gif", "pixel": False},
        {"pattern": "cyberpunk_dance_flow_sheet_v2_*.jpg", "out": "stickers/cyberpunk/cyberpunk_dance_flow.gif", "pixel": False}
    ]
    
    for cfg in sheets_config:
        matches = glob.glob(os.path.join(brain_dir, cfg["pattern"]))
        if matches:
            latest_match = max(matches, key=os.path.getmtime)
            out_path = os.path.join(project_assets_dir, cfg["out"])
            compile_sheet_to_gif(latest_match, out_path, is_pixel=cfg["pixel"])
        else:
            print(f"Warning: No match found for pattern {cfg['pattern']}")
            
    # 2. Programmatically generate 5 Food + Cannabis stickers
    print("Generating programmatic food/weed stickers...")
    make_pixel_coffee_weed()
    make_pixel_pizza_weed()
    make_neon_donut_weed()
    make_anime_baking_weed()
    make_pixel_popcorn_weed()
    
    print("All sticker compilation and generation complete!")
