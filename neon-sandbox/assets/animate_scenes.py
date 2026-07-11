import os
import random
from PIL import Image, ImageDraw, ImageFilter

def animate_waterfall():
    print("Animating Waterfall Scene...")
    img_path = "neon-sandbox/assets/stickers/cyberpunk/cyberpunk_hologram_waterfall.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    base = Image.open(img_path).convert("RGBA")
    w, h = base.size
    frames = []
    num_frames = 16

    # Blunt tip is around x=720, y=330 (based on her position)
    blunt_x, blunt_y = 720, 330
    
    # Waterfall bounding box: x between 750 and 1100, y between 0 and 650
    # Let's add some vertical flowing lines and smoke puffs
    for f in range(num_frames):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        
        # 1. Rushing Waterfall Effect (rushing vertical streaks)
        # Create a overlay layer for water details
        water_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        water_draw = ImageDraw.Draw(water_overlay)
        
        random.seed(42) # keeps water streak paths consistent, only offsets them
        for _ in range(35):
            wx = random.randint(760, 1050)
            wy_start = random.randint(0, 600)
            length = random.randint(40, 100)
            # Offset vertical position based on frame
            wy = (wy_start + (f * 15)) % 600
            
            # Draw translucent cyan/white water streaks
            color = random.choice([
                (100, 240, 255, 120),
                (200, 250, 255, 160),
                (50, 180, 240, 90)
            ])
            water_draw.line([(wx, wy), (wx, wy + length)], fill=color, width=random.randint(2, 5))
            
        # Smooth the water lines
        water_overlay = water_overlay.filter(ImageFilter.GaussianBlur(1))
        frame = Image.alpha_composite(frame, water_overlay)
        
        # 2. Rising Purple Smoke Effect
        smoke_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        smoke_draw = ImageDraw.Draw(smoke_overlay)
        
        # Draw 3-4 smoke puffs rising at different phases
        for puff in range(3):
            phase = (f / num_frames + puff / 3.0) % 1.0
            # Path of smoke: rises and drifts left
            sx = blunt_x - int(phase * 90) + int(random.random() * 5)
            sy = blunt_y - int(phase * 220)
            radius = int(12 + phase * 30)
            opacity = int((1.0 - phase) * 130)
            
            if opacity > 0:
                # Translucent purple color
                smoke_draw.ellipse(
                    [(sx - radius, sy - radius), (sx + radius, sy + radius)],
                    fill=(175, 120, 220, opacity)
                )
                
        smoke_overlay = smoke_overlay.filter(ImageFilter.GaussianBlur(8))
        frame = Image.alpha_composite(frame, smoke_overlay)
        
        # 3. Pulsing Blunt Glow
        cherry_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        cherry_draw = ImageDraw.Draw(cherry_overlay)
        pulse = abs(f - num_frames/2) / (num_frames/2) # 0 to 1
        cherry_radius = int(3 + pulse * 3)
        cherry_draw.ellipse(
            [(blunt_x - cherry_radius, blunt_y - cherry_radius), (blunt_x + cherry_radius, blunt_y + cherry_radius)],
            fill=(255, 80 + int(pulse * 100), 0, 200)
        )
        cherry_overlay = cherry_overlay.filter(ImageFilter.GaussianBlur(2))
        frame = Image.alpha_composite(frame, cherry_overlay)
        
        frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE))

    out_path = "neon-sandbox/assets/stickers/cyberpunk/cyberpunk_hologram_waterfall.gif"
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=90,
        loop=0
    )
    print(f"Saved: {out_path}")

def animate_forest():
    print("Animating Pixel Forest Scene...")
    img_path = "neon-sandbox/assets/stickers/cyberpunk/pixel_cyberpunk_nature.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    base = Image.open(img_path).convert("RGBA")
    w, h = base.size
    frames = []
    num_frames = 12

    # Mug steam coordinates: x=500, y=490
    steam_x, steam_y = 500, 490
    
    # Laptop screen bounding box: x=770 to 850, y=550 to 580 (in 1376x768 resolution)
    # Let's adjust screen positions to match coordinates
    
    for f in range(num_frames):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        
        # 1. Pixelated rising coffee steam
        steam_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        steam_draw = ImageDraw.Draw(steam_overlay)
        
        random.seed(f)
        for i in range(3):
            phase = ((f + i * 4) % num_frames) / float(num_frames)
            sx = steam_x + int(random.choice([-6, 0, 6]))
            sy = steam_y - int(phase * 50)
            opacity = int((1.0 - phase) * 160)
            
            if opacity > 0:
                # Draw pixelated steam particles (blocks of 4x4)
                steam_draw.rectangle([sx - 2, sy - 2, sx + 2, sy + 2], fill=(220, 220, 240, opacity))
                steam_draw.rectangle([sx - 4, sy - 8, sx, sy - 4], fill=(200, 200, 220, int(opacity * 0.7)))
                
        frame = Image.alpha_composite(frame, steam_overlay)
        
        # 2. Pulsing Laptop Screen Glow (bright green)
        laptop_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        laptop_draw = ImageDraw.Draw(laptop_overlay)
        pulse = abs(f - num_frames/2) / (num_frames/2)
        glow_opacity = int(40 + pulse * 120)
        
        # Laptop screen position is roughly in the center-right table area (x=770, y=550)
        laptop_draw.polygon(
            [(770, 560), (820, 545), (825, 575), (775, 590)],
            fill=(0, 255, 136, glow_opacity)
        )
        laptop_overlay = laptop_overlay.filter(ImageFilter.GaussianBlur(10))
        frame = Image.alpha_composite(frame, laptop_overlay)
        
        frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE))

    out_path = "neon-sandbox/assets/stickers/cyberpunk/pixel_cyberpunk_nature.gif"
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=110,
        loop=0
    )
    print(f"Saved: {out_path}")

def animate_beach():
    print("Animating Pixel Sunset Beach Scene...")
    img_path = "neon-sandbox/assets/stickers/cyberpunk/pixel_sunset_beach.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    base = Image.open(img_path).convert("RGBA")
    w, h = base.size
    frames = []
    num_frames = 16

    # Telepathic Orb coordinates in palm: x=580, y=475
    orb_x, orb_y = 580, 475
    
    for f in range(num_frames):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        
        # 1. Pulsating telepathic projection orb
        orb_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        orb_draw = ImageDraw.Draw(orb_overlay)
        
        pulse = abs(f - num_frames/2) / (num_frames/2)
        radius = int(8 + pulse * 5)
        
        # Glowing center
        orb_draw.ellipse(
            [(orb_x - radius, orb_y - radius), (orb_x + radius, orb_y + radius)],
            fill=(0, 255, 255, 220)
        )
        
        # Radial expanding rings
        for ring in range(2):
            ring_phase = (f / num_frames + ring / 2.0) % 1.0
            ring_radius = int(10 + ring_phase * 60)
            ring_opacity = int((1.0 - ring_phase) * 150)
            
            if ring_opacity > 0:
                orb_draw.ellipse(
                    [(orb_x - ring_radius, orb_y - ring_radius), (orb_x + ring_radius, orb_y + ring_radius)],
                    outline=(0, 255, 255, ring_opacity),
                    width=2
                )
                
        orb_overlay = orb_overlay.filter(ImageFilter.GaussianBlur(3))
        frame = Image.alpha_composite(frame, orb_overlay)
        
        # 2. Party Lights (Red, Pink, Cyan flashing bulbs on the tents)
        lights_overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        lights_draw = ImageDraw.Draw(lights_overlay)
        
        light_coords = [
            (730, 280), (770, 275), (810, 285), (850, 290), (890, 280),
            (930, 285), (970, 290), (1010, 275), (1050, 280)
        ]
        
        for idx, (lx, ly) in enumerate(light_coords):
            # Alternating flash based on index and frame
            color_phase = (f + idx * 3) % 9
            if color_phase < 3:
                color = (255, 0, 100, 255) # Pink
            elif color_phase < 6:
                color = (0, 255, 255, 255) # Cyan
            else:
                color = (175, 120, 220, 255) # Purple
                
            lights_draw.ellipse([(lx - 4, ly - 4), (lx + 4, ly + 4)], fill=color)
            
        lights_overlay = lights_overlay.filter(ImageFilter.GaussianBlur(2))
        frame = Image.alpha_composite(frame, lights_overlay)
        
        frames.append(frame.convert("P", palette=Image.Palette.ADAPTIVE))

    out_path = "neon-sandbox/assets/stickers/cyberpunk/pixel_sunset_beach.gif"
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        duration=100,
        loop=0
    )
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    animate_waterfall()
    animate_forest()
    animate_beach()
    print("All scene sticker animations compiled successfully!")
