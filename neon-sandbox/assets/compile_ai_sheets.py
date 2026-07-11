import os
import glob
from PIL import Image, ImageChops

def compile_sheet_to_gif(sheet_path, out_path, is_pixel=False, grid_size=3, num_frames=None, duration=120, keep_background=False):
    # Load the 1024x1024 sheet
    sheet = Image.open(sheet_path).convert("RGBA")
    
    # Calculate cell dimensions based on grid size
    cell_w = sheet.width // grid_size
    cell_h = sheet.height // grid_size
    
    frames = []
    if num_frames is None:
        num_frames = 8 if "eyeball_pi_flyaway" in out_path else (grid_size * grid_size)
        
    for i in range(num_frames):
        col = i % grid_size
        row = i // grid_size
        
        # Crop the frame
        left = col * cell_w
        top = row * cell_h
        right = left + cell_w
        bottom = top + cell_h
        
        cell = sheet.crop((left, top, right, bottom))
        
        # ═══ REMOVE NUMBERS: Center Crop ═══
        # Discard 15% margin borders on all sides to crop out the F1-F9/1-9 numbers printed by the AI generator
        margin_w = int(cell_w * 0.15)
        margin_h = int(cell_h * 0.15)
        
        frame = cell.crop((
            margin_w,
            margin_h,
            cell_w - margin_w,
            cell_h - margin_h
        )).resize((512, 512), Image.Resampling.LANCZOS)
        
        # If we want to keep the original background intact
        if keep_background:
            frame_p = frame.convert("RGB").convert("P", palette=Image.Palette.ADAPTIVE, colors=256)
            frames.append(frame_p)
            continue
            
        # Key out the black background to create transparent glow
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
                # Custom threshold for blunt flame to key out orange/green background glow
                thresh = 48 if "neon_blunt_flame" in out_path else 18
                if brightness < thresh:
                    new_data.append((0, 0, 0, 0))
                else:
                    alpha_val = min(255, int(brightness * 1.3))
                    new_data.append((r, g, b, alpha_val))
                    
        frame.putdata(new_data)
        
        # Fringe matching for layout background (#0f0f15)
        alpha = frame.split()[3]
        
        # Create composite with layout background for anti-aliasing edges
        bg = Image.new("RGBA", frame.size, (15, 15, 21, 255))
        fringe_blended = Image.alpha_composite(bg, frame)
        
        # Paste a specific transparent index marker (pure magenta) in transparent areas
        temp_rgb = fringe_blended.convert("RGB")
        temp_rgb.paste((255, 0, 255), mask=Image.eval(alpha, lambda a: 255 if a <= 15 else 0))
        
        # Unconditionally paint (0, 0) as magenta to guarantee it maps to the transparency index
        temp_rgb.putpixel((0, 0), (255, 0, 255))
        
        # Convert and designate the transparency index
        frame_p = temp_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=254)
        
        try:
            trans_idx = frame_p.getpixel((0, 0)) # top-left is transparent magenta
        except:
            trans_idx = 0
            
        frame_p.info["transparency"] = trans_idx
        frames.append(frame_p)
        
    # Save loopable GIF with custom frame duration (defaults to 120ms)
    frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=duration, loop=0, disposal=2)
    print(f"Compiled: {out_path} from {os.path.basename(sheet_path)}")

def compile_multi_sheets_to_gif(sheet_patterns, out_path, is_pixel=False, grid_size=3, num_frames_per_sheet=9, duration=120, keep_background=False):
    frames = []
    
    for pattern in sheet_patterns:
        matches = glob.glob(os.path.join(brain_dir, pattern))
        if not matches:
            print(f"Warning: No match found for pattern {pattern}")
            continue
            
        # Get the latest match
        latest_match = max(matches, key=os.path.getmtime)
        sheet = Image.open(latest_match).convert("RGBA")
        
        cell_w = sheet.width // grid_size
        cell_h = sheet.height // grid_size
        
        for i in range(num_frames_per_sheet):
            col = i % grid_size
            row = i // grid_size
            
            # Crop the frame
            left = col * cell_w
            top = row * cell_h
            right = left + cell_w
            bottom = top + cell_h
            
            cell = sheet.crop((left, top, right, bottom))
            
            # ═══ REMOVE NUMBERS: Center Crop ═══
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
                
            # Key out the black background to create transparent glow
            datas = frame.getdata()
            new_data = []
            for item in datas:
                r, g, b, a = item
                brightness = max(r, g, b)
                if brightness < 18:
                    new_data.append((0, 0, 0, 0))
                else:
                    alpha_val = min(255, int(brightness * 1.3))
                    new_data.append((r, g, b, alpha_val))
            frame.putdata(new_data)
            
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
            
    if frames:
        frames[0].save(out_path, save_all=True, append_images=frames[1:], duration=duration, loop=0, disposal=2)
        print(f"Compiled multi-sheet: {out_path} from {len(sheet_patterns)} sheets ({len(frames)} total frames)")

if __name__ == "__main__":
    brain_dir = "/Users/franklawrencejr./.gemini/antigravity/brain/9975650d-f0fa-492a-9ff7-e3eaf508d832"
    assets_dir = "neon-sandbox/assets"
    
    # Map sheet name patterns to output files
    sheet_mappings = [
        {"pattern": "*neon_cannabis_sheet_*.jpg", "out": "stickers/neon/neon_cannabis.gif", "pixel": False},
        {"pattern": "*pixel_emoji_smile_sheet_*.jpg", "out": "stickers/pixel/pixel_emoji_smile.gif", "pixel": True},
        {"pattern": "*neon_stay_high_sheet_*.jpg", "out": "stickers/neon/neon_stay_high.gif", "pixel": False},
        {"pattern": "*neon_heart_joint_sheet_*.jpg", "out": "stickers/neon/neon_heart_joint.gif", "pixel": False},
        {"pattern": "*pixel_emoji_heart_sheet_*.jpg", "out": "stickers/pixel/pixel_emoji_heart.gif", "pixel": True},
        {"pattern": "*neon_chill_cloud_sheet_*.jpg", "out": "stickers/neon/neon_chill_cloud.gif", "pixel": False},
        {"pattern": "*cyberpunk_optic_skull_sheet_*.jpg", "out": "stickers/cyberpunk/cyberpunk_optic_skull.gif", "pixel": True},
        {"pattern": "*anime_sparkle_eyes_sheet_*.jpg", "out": "stickers/anime/anime_sparkle_eyes.gif", "pixel": False},
        {"pattern": "*neon_blunt_flame_sheet_*.jpg", "out": "stickers/neon/neon_blunt_flame.gif", "pixel": False},
        {"pattern": "*pixel_coffee_steam_sheet_*.jpg", "out": "stickers/pixel/pixel_coffee_steam.gif", "pixel": True},
        {"pattern": "*eyeball_pi_flyaway_sheet_*.jpg", "out": "stickers/anime/eyeball_pi_flyaway.gif", "pixel": False},
        {"pattern": "*eyeball_pi_swoop_21f_sheet_*.jpg", "out": "stickers/anime/eyeball_pi_swoop.gif", "pixel": False, "grid_size": 5, "num_frames": 25},
        {"pattern": "*pixel_july4_chill_sheet_*.jpg", "out": "stickers/pixel/pixel_july4_chill.gif", "pixel": True, "grid_size": 5, "num_frames": 25, "duration": 220}
    ]
    
    for mapping in sheet_mappings:
        matches = glob.glob(os.path.join(brain_dir, mapping["pattern"]))
        if matches:
            # Get the latest match
            latest_match = max(matches, key=os.path.getmtime)
            out_path = os.path.join(assets_dir, mapping["out"])
            compile_sheet_to_gif(
                latest_match, 
                out_path, 
                mapping["pixel"], 
                mapping.get("grid_size", 3), 
                mapping.get("num_frames", None),
                mapping.get("duration", 120),
                mapping.get("keep_background", False)
            )
        else:
            print(f"Warning: No match found for pattern {mapping['pattern']}")
            
    # Compile the multi-sheet high-res Cyberpunk Hologram sequence
    holo_patterns = [
        "*cyberpunk_hologram_s1_sheet_*.jpg",
        "*cyberpunk_hologram_s2_sheet_*.jpg",
        "*cyberpunk_hologram_s3_sheet_*.jpg"
    ]
    compile_multi_sheets_to_gif(
        holo_patterns, 
        os.path.join(assets_dir, "stickers/cyberpunk/cyberpunk_hologram.gif"),
        is_pixel=False,
        grid_size=3,
        num_frames_per_sheet=9,
        duration=140,
        keep_background=True
    )
            
    print("Done compiling all AI-generated action GIFs!")
