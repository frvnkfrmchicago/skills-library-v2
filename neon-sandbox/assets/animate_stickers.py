import os
import math
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter

def make_sway_cannabis(img_path, out_path, num_frames=24):
    """
    Sways the cannabis leaf back and forth smoothly like a pendulum.
    Also slightly floats it up/down to feel like 3D depth.
    No brightness flashing!
    """
    base_img = Image.open(img_path).convert("RGBA").resize((210, 210), Image.Resampling.LANCZOS)
    frames = []
    
    for i in range(num_frames):
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        
        # Sway angle (-6 to +6 degrees)
        angle = 6.0 * math.sin((i / num_frames) * 2 * math.pi)
        # Float Y offset (-8 to +8 pixels)
        y_offset = int(8.0 * math.cos((i / num_frames) * 2 * math.pi))
        
        rotated = base_img.rotate(angle, resample=Image.Resampling.BILINEAR, expand=False)
        
        x = (256 - 210) // 2
        y = (256 - 210) // 2 + y_offset
        
        canvas.alpha_composite(rotated, (x, y))
        
        # Fringe matching
        alpha = canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=60, loop=0, disposal=2)
    print(f"Generated: {out_path} (Smooth Sway)")

def make_stay_high_chase(img_path, out_path, num_frames=24):
    """
    Splits the 'Stay High' sign into top ('Stay') and bottom ('High') halves
    with a small overlap to prevent transparent seam lines.
    Alternates their brightness to create a cool chasing neon effect.
    Also floats the entire sign gently.
    """
    img = Image.open(img_path).convert("RGBA").resize((226, 226), Image.Resampling.LANCZOS)
    
    split_y = 108
    overlap = 3
    stay_part = img.crop((0, 0, 226, split_y + overlap))
    high_part = img.crop((0, split_y - overlap, 226, 226))
    
    frames = []
    for i in range(num_frames):
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        
        # Determine brightness factors in opposite phases
        angle = (i / num_frames) * 2 * math.pi
        stay_factor = 1.0 + 0.45 * math.sin(angle)
        high_factor = 1.0 - 0.45 * math.sin(angle)
        
        # Float offset
        y_float = int(5.0 * math.sin(angle))
        
        # Enhance Stay
        sr, sg, sb, sa = stay_part.split()
        s_rgb = Image.merge("RGB", (sr, sg, sb))
        s_enh = ImageEnhance.Brightness(s_rgb).enhance(stay_factor)
        ser, seg, seb = s_enh.split()
        stay_enhanced = Image.merge("RGBA", (ser, seg, seb, sa))
        
        # Enhance High
        hr, hg, hb, ha = high_part.split()
        h_rgb = Image.merge("RGB", (hr, hg, hb))
        h_enh = ImageEnhance.Brightness(h_rgb).enhance(high_factor)
        her, heg, heb = h_enh.split()
        high_enhanced = Image.merge("RGBA", (her, heg, heb, ha))
        
        # Paste enhanced parts back together with overlap
        x = (256 - 226) // 2
        y = (256 - 226) // 2 + y_float
        
        canvas.alpha_composite(stay_enhanced, (x, y))
        canvas.alpha_composite(high_enhanced, (x, y + split_y - overlap))
        
        # Fringe matching
        alpha = canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=60, loop=0, disposal=2)
    print(f"Generated: {out_path} (Seamless Stay/High Alternating Pulse)")

def make_squash_bounce_smile(img_path, out_path, num_frames=20):
    """
    Bouncing smile emoji with squash-and-stretch on impact.
    """
    base_img = Image.open(img_path).convert("RGBA")
    frames = []
    
    for i in range(num_frames):
        t = i / num_frames
        y_pos = 45 * (4 * t * (1 - t))
        
        scale_x = 1.0
        scale_y = 1.0
        
        if t < 0.15 or t > 0.85:
            # Impact squash
            compress = 0.15 * math.cos((t * 2 * math.pi) * 2)
            scale_x = 1.0 + compress
            scale_y = 1.0 - compress
        elif 0.35 < t < 0.65:
            # Flight stretch
            stretch = 0.08 * math.sin((t - 0.35) * math.pi / 0.3)
            scale_x = 1.0 - stretch
            scale_y = 1.0 + stretch
            
        size_w = int(200 * scale_x)
        size_h = int(200 * scale_y)
        img = base_img.resize((size_w, size_h), Image.Resampling.LANCZOS)
        
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        x = (256 - size_w) // 2
        floor = 220
        y = floor - size_h - int(y_pos)
        
        canvas.alpha_composite(img, (x, y))
        
        alpha = canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=50, loop=0, disposal=2)
    print(f"Generated: {out_path} (Squash Bounce)")

def make_particle_heart(img_path, out_path, num_frames=20):
    """
    Heart beats while spawning small hearts that float out the top.
    """
    base_img = Image.open(img_path).convert("RGBA")
    small_heart = base_img.resize((35, 35), Image.Resampling.LANCZOS)
    frames = []
    
    scales = [1.0, 1.15, 0.95, 1.15, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
    
    for i in range(num_frames):
        scale = scales[i % len(scales)]
        size = int(180 * scale)
        img = base_img.resize((size, size), Image.Resampling.LANCZOS)
        
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        mx = (256 - size) // 2
        my = (256 - size) // 2 + 15
        canvas.alpha_composite(img, (mx, my))
        
        # Floating heart particles
        p1_frame = (i - 2) % num_frames
        if p1_frame < 12:
            p1_t = p1_frame / 12
            px = int(85 - 25 * math.sin(p1_t * math.pi))
            py = int(110 - 90 * p1_t)
            p_alpha = int(255 * (1.0 - p1_t))
            p_img = small_heart.copy()
            r, g, b, a = p_img.split()
            a = a.point(lambda val: int(val * (p_alpha / 255.0)))
            p_img = Image.merge("RGBA", (r, g, b, a))
            canvas.alpha_composite(p_img, (px, py))
            
        p2_frame = (i - 8) % num_frames
        if p2_frame < 12:
            p2_t = p2_frame / 12
            px = int(140 + 20 * math.cos(p2_t * math.pi))
            py = int(120 - 95 * p2_t)
            p_alpha = int(255 * (1.0 - p2_t))
            p_img = small_heart.copy()
            r, g, b, a = p_img.split()
            a = a.point(lambda val: int(val * (p_alpha / 255.0)))
            p_img = Image.merge("RGBA", (r, g, b, a))
            canvas.alpha_composite(p_img, (px, py))
            
        # Fringe matching
        alpha = canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=60, loop=0, disposal=2)
    print(f"Generated: {out_path} (Heartbeat + Floating Particles)")

def make_cloud_rain_gif(img_path, out_path, num_frames=24):
    """
    Renders falling rain droplets under a static, stable cloud.
    Crops actual neon raindrop pixels from the original artwork and slides them down
    for an authentic glowing raindrop animation that matches the cloud style perfectly.
    """
    img = Image.open(img_path).convert("RGBA").resize((256, 256), Image.Resampling.LANCZOS)
    
    # Crop the clean cloud body (top part)
    cloud_body = img.crop((0, 0, 256, 140))
    
    # Crop the exact glowing raindrop shapes from the original image
    # Left drops, middle drops, right drops
    drop_left = img.crop((45, 140, 100, 240))
    drop_mid = img.crop((100, 140, 160, 240))
    drop_right = img.crop((160, 140, 215, 240))
    
    frames = []
    for i in range(num_frames):
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        
        # Paste raindrops first (underneath the cloud)
        drops_config = [
            {"image": drop_left, "x": 45, "delay": 0},
            {"image": drop_mid, "x": 100, "delay": 8},
            {"image": drop_right, "x": 160, "delay": 16}
        ]
        
        for config in drops_config:
            # Normalized progress for each drop
            progress = ((i + config["delay"]) % num_frames) / num_frames
            
            # Slide Y offset down (from 0 to 80 pixels)
            y_offset = int(80 * progress)
            
            # Fade out the drop as it gets closer to the bottom
            opacity = 1.0
            if progress > 0.7:
                opacity = (1.0 - progress) / 0.3
            elif progress < 0.15:
                opacity = progress / 0.15
                
            # Apply opacity to the alpha channel of the crop
            drop_copy = config["image"].copy()
            r, g, b, a = drop_copy.split()
            a = a.point(lambda val: int(val * opacity))
            drop_faded = Image.merge("RGBA", (r, g, b, a))
            
            # Paste the drop sliding down
            canvas.alpha_composite(drop_faded, (config["x"], 140 - 20 + y_offset))
            
        # Paste the cloud body ON TOP of the raindrops so they cleanly emerge from under the cloud
        canvas.alpha_composite(cloud_body, (0, 0))
        
        # Fringe matching
        alpha = canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=50, loop=0, disposal=2)
    print(f"Generated: {out_path} (Premium Rain Cloud GIF)")

def make_heart_joint_gif(img_path, out_path, num_frames=20):
    """
    Renders rising smoke curls from the tips of the crossed joints
    while the central heart remains completely static (does not beat/scale).
    """
    img = Image.open(img_path).convert("RGBA").resize((256, 256), Image.Resampling.LANCZOS)
    
    # Joint tips coordinates in 256x256 size:
    # Left blunt tip: x=77, y=77
    # Right blunt tip: x=179, y=77
    left_tip = (77, 77)
    right_tip = (179, 77)
    
    frames = []
    for i in range(num_frames):
        canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        canvas.alpha_composite(img, (0, 0))
        
        # Draw smoke curls on canvas
        draw = ImageDraw.Draw(canvas)
        
        # Smoke trails offsets
        smoke_trails = [
            {"start": left_tip, "direction": -1, "offset": 0},
            {"start": right_tip, "direction": 1, "offset": 10}
        ]
        
        for trail in smoke_trails:
            frame_idx = (i + trail["offset"]) % num_frames
            progress = frame_idx / num_frames
            
            # Smoke floats up by 60 pixels
            sy = trail["start"][1] - int(60 * progress)
            # Smoke curls left/right
            sx = trail["start"][0] + trail["direction"] * int(15 * math.sin(progress * 2 * math.pi))
            
            # Draw smoke particles as glowing ellipses
            radius = int(4 + 8 * progress)
            opacity = int(180 * (1.0 - progress))
            
            # Light green/gray smoke color
            smoke_color = (200, 255, 220, opacity)
            draw.ellipse([sx - radius, sy - radius, sx + radius, sy + radius], fill=smoke_color)
            
        # Apply a light blur to the smoke particles
        blurred = canvas.filter(ImageFilter.GaussianBlur(1.5))
        # Re-overlay the original sharp heart and joints
        final_canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        final_canvas.alpha_composite(blurred)
        final_canvas.alpha_composite(img, (0, 0))
        
        # Fringe matching
        alpha = final_canvas.split()[3]
        mask = Image.eval(alpha, lambda a: 255 if a <= 128 else 0)
        frame_rgb = final_canvas.convert("RGB")
        frame_rgb.paste((15, 15, 21), mask=mask)
        
        frame_p = frame_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=255)
        frame_p.info["transparency"] = 0
        frames.append(frame_p)
        
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=80, loop=0, disposal=2)
    print(f"Generated: {out_path} (Heart Joint GIF with Smoke)")

if __name__ == "__main__":
    neon_dir = "neon-sandbox/assets/stickers/neon"
    pixel_dir = "neon-sandbox/assets/stickers/pixel"
    
    # 1. Cannabis Pendulum Sway (No Flashing)
    make_sway_cannabis(os.path.join(neon_dir, "neon_cannabis.png"), os.path.join(neon_dir, "neon_cannabis.gif"))
    
    # 2. Stay High Alternating Brightness Top/Bottom
    make_stay_high_chase(os.path.join(neon_dir, "neon_stay_high.png"), os.path.join(neon_dir, "neon_stay_high.gif"))
    
    # 3. Pixel Smile Bounce
    make_squash_bounce_smile(os.path.join(pixel_dir, "pixel_emoji_smile.png"), os.path.join(pixel_dir, "pixel_emoji_smile.gif"))
    
    # 4. Pixel Heart heartbeat + floating heart spark particles
    make_particle_heart(os.path.join(pixel_dir, "pixel_emoji_heart.png"), os.path.join(pixel_dir, "pixel_emoji_heart.gif"))
    
    # 5. Neon Chill Cloud GIF (No SVG, pure GIF with falling rain)
    make_cloud_rain_gif(os.path.join(neon_dir, "neon_chill_cloud.png"), os.path.join(neon_dir, "neon_chill_cloud.gif"))
    
    # 6. Neon Heart Joint GIF (No SVG, pure GIF with static heart, moving smoke wisps)
    make_heart_joint_gif(os.path.join(neon_dir, "neon_heart_joint.png"), os.path.join(neon_dir, "neon_heart_joint.gif"))
    
    print("Done compiling all optimized custom action GIFs!")
