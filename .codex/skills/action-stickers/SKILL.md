---
name: action-stickers
description: >
  Guides generation, compiling, transparent keying, frame-length control, and
  interactive Canva-style web sandboxing for AI-drawn action stickers and sprite-sheet
  cinematic micro-animations. Use when creating or refining transparent sticker assets.
---

# Action Stickers & Sprite Animation Skill

Create transparent, frame-by-frame animated overlays from AI-generated sprite sheets. 

---

## 1. AI Sprite Sheet Prompting

To ensure the AI generates a clean, sequential grid that is easy to compile:
* **Grid Format:** Request a specific grid layout (`3x3` for 9-frame sequences, `5x5` for 21-frame sequences).
* **Solid Background:** Force a solid black background (`on a solid black background`) to make transparency keying clean.
* **Character Consistency:** Describe the character and its core attributes (e.g. pupil color, glowing elements) and require them to stay consistent across frames.
* **Movement Sequence:** Specify the starting pose (e.g. "perched on top of a red Pi symbol") and the action progression (e.g. "flaps wings, takes off, and swoops horizontally from left to right").

---

## 2. PIL Slicing & Transparency Compilation

The compilation script uses **Pillow** to slice cells, clean up numbers, and compute transparency:

```python
# Slicing, center-cropping (removes sequence numbers), and keying out backgrounds
cell = sheet.crop((left, top, right, bottom))

# Center crop 9% to throw away printed sequence numbers (F1-F9 / 1-9)
margin_w = int(cell_w * 0.09)
margin_h = int(cell_h * 0.09)
frame = cell.crop((margin_w, margin_h, cell_w - margin_w, cell_h - margin_h))

# Black keying with custom threshold
new_data = []
for item in frame.getdata():
    r, g, b, a = item
    brightness = max(r, g, b)
    if brightness < threshold:
        new_data.append((0, 0, 0, 0))  # transparent
    else:
        new_data.append((r, g, b, min(255, int(brightness * 1.3))))
```

### 🔒 Top-Left Index Transparency Guarantee
To prevent frame flickering where the background randomly shifts between transparent and black, **unconditionally paint the top-left pixel (0,0) with pure magenta** before adaptive color conversion:

```python
# Blend edges against dark layout fringe (#0f0f15)
bg = Image.new("RGBA", frame.size, (15, 15, 21, 255))
fringe_blended = Image.alpha_composite(bg, frame)
temp_rgb = fringe_blended.convert("RGB")

# Paste magenta in transparent regions, and FORCE (0,0) to be magenta
temp_rgb.paste((255, 0, 255), mask=Image.eval(alpha, lambda a: 255 if a <= 15 else 0))
temp_rgb.putpixel((0, 0), (255, 0, 255))

# Quantize and locate transparent index
frame_p = temp_rgb.convert("P", palette=Image.Palette.ADAPTIVE, colors=254)
trans_idx = frame_p.getpixel((0, 0))
frame_p.info["transparency"] = trans_idx
```

---

## 3. Web Sandbox Integration

### Shortcode Parsing
Support custom inline parameters (`:shortcode|size|speed|anim:`) to scale, speed up, or animate elements:
```javascript
const regex = new RegExp(`:${escapedBase}(?:\\|(\\d+))?(?:\\|([a-z0-9.]+))?(?:\\|([a-z-]+))?:`, 'g');
```

### Canva-Style Overlay Selection
Draggable overlay stickers must automatically focus on spawn, showing their border outlines and resize handles instantly to guide user interaction.

### Contextual Popovers (No Modals)
Bypass full-screen configuration modals. Instead, use a floating contextual popover placed at the clicked element's coordinate space.
