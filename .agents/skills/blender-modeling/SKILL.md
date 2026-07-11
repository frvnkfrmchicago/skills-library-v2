---
name: blender-modeling
description: >
  Expert 3D modeling skill for Blender covering end-to-end scene creation
  via Blender MCP. Includes topology standards, UV mapping, texturing with
  Shader Editor nodes, lighting rigs, camera setup, rendering (Cycles/EEVEE),
  retopology, LOD pipelines, high-to-low baking, sculpting, full scene
  composition, and animation (armatures, rigging, keyframes, shape keys,
  NLA editor, drivers, physics simulations, walk cycles, camera animation,
  and animated render export). Use when creating 3D models, building
  complete scenes, texturing, lighting, rendering, sculpting, animating,
  rigging, UV unwrapping, retopology, or when user mentions Blender,
  Blender MCP, 3D modeling, topology, baking, sculpting, hard surface,
  animation, rigging, walk cycle, or scene building.
---

# Blender Modeling Skill

You are a senior 3D artist with 12 years of production experience across
AAA games and VFX. You build complete, detailed scenes end-to-end — not
placeholder geometry with default materials.

---

## STOP — Comprehension Gate

Before touching Blender, answer ALL of these:

1. **What is the deliverable?** Single asset, full scene, or animation?
2. **What is the target?** Game engine (Unity/Unreal/Godot), web (GLB), film (EXR), or Blender render?
3. **What style?** Realistic PBR, stylized, low-poly, photorealistic?
4. **Poly budget?** Hero (10K-30K), prop (1K-5K), background (500-2K)?
5. **Does it need animation?** Skeletal, shape keys, rigid body?
6. **Texture resolution?** 4K film, 2K game hero, 1K props, 512 background?

---

## Blender MCP Integration

### What Blender MCP Does

Blender MCP bridges AI agents to a running Blender instance via Model Context
Protocol. The agent sends Python (`bpy`) commands; Blender executes them live.

### MCP Tool Categories

| Tool Category | What It Controls |
|---------------|-----------------|
| Scene manipulation | Create, delete, transform, duplicate objects |
| Geometry | Add meshes, apply modifiers, edit mode operations |
| Materials & Shaders | Create node trees, assign textures, configure PBR |
| Lighting | Add/configure lights, HDRI environment, light rigs |
| Camera | Position, focal length, DOF, tracking constraints |
| Rendering | Engine selection, samples, output format, render |
| Animation | Keyframes, drivers, NLA strips |
| Scene analysis | Poly counts, material audit, performance check |
| Script execution | Run arbitrary `bpy` Python for complex operations |

### MCP Workflow Rules

1. **Always query scene state first** — before modifying, inspect what exists
2. **Batch related operations** — group transforms, material assignments
3. **Name everything** — every object, material, and collection gets a descriptive name
4. **Apply transforms after positioning** — `bpy.ops.object.transform_apply()`
5. **Save incrementally** — save before destructive operations
6. **Verify after each major step** — render preview or inspect poly count

### MCP Command Patterns

```python
# Scene inspection (ALWAYS do this first)
import bpy
scene_report = {
    "objects": len(bpy.data.objects),
    "meshes": len(bpy.data.meshes),
    "materials": len(bpy.data.materials),
    "collections": [c.name for c in bpy.data.collections],
}

# Create object with proper naming and collection
mesh = bpy.data.meshes.new("Table_Top_Mesh")
obj = bpy.data.objects.new("Table_Top", mesh)
collection = bpy.data.collections.get("Furniture")
if not collection:
    collection = bpy.data.collections.new("Furniture")
    bpy.context.scene.collection.children.link(collection)
collection.objects.link(obj)

# Apply all transforms (MANDATORY before export)
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
```

---

## End-to-End Scene Pipeline

### Phase 1: Scene Planning & Blockout

```
□ Define scene composition (rule of thirds, focal point)
□ Create reference collection with reference images
□ Block out major shapes with primitives (cubes, cylinders)
□ Establish scale — use a 1.8m human reference
□ Set up world units (Metric, 1.0 scale)
□ Organize collections: Environment, Props, Characters, Lighting, Camera
```

```python
# Blockout with proper collections
import bpy

collections = ["Environment", "Props", "Characters", "Lighting", "Camera"]
for name in collections:
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)

# Human scale reference (1.8m capsule)
bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=1.8, location=(0, 0, 0.9))
ref = bpy.context.active_object
ref.name = "REFERENCE_Human_Scale"
ref.display_type = 'WIRE'
```

### Phase 2: Modeling

Follow the topology standards in the Topology section below.

```
□ Model from large shapes to small details
□ Use modifiers non-destructively (Mirror, Subdivision, Array, Bevel)
□ Maintain quad topology for deforming meshes
□ Place edge loops at deformation points
□ Keep triangle count within budget
□ Check normals orientation (Face Orientation overlay)
□ Remove doubles / merge by distance (0.0001m threshold)
□ Apply scale before adding modifiers
```

### Phase 3: UV Mapping

```
□ Mark seams along natural edges (under folds, behind objects)
□ Unwrap with Angle Based or Conformal method
□ Straighten UV islands for hard surface
□ Check texel density — all islands same pixel-per-meter ratio
□ Pack islands with margin (0.01 minimum)
□ Create UV channel 2 for lightmaps if needed
□ No overlapping UVs for baked textures
```

```python
# UV unwrap via MCP
import bpy

obj = bpy.data.objects["Table_Top"]
bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.01)
bpy.ops.object.mode_set(mode='OBJECT')
```

### Phase 4: Materials & Texturing

```
□ Create named materials (Mat_Wood_Oak, Mat_Metal_Brushed)
□ Use Principled BSDF for all PBR materials
□ Connect texture maps: Base Color, Roughness, Normal, Metallic
□ Set color space: sRGB for color, Non-Color for data maps
□ Add detail with procedural nodes (Noise, Voronoi, Musgrave)
□ Verify material slots — no unused materials
□ Check texture resolution matches target
```

```python
# PBR material setup via MCP
import bpy

mat = bpy.data.materials.new(name="Mat_Wood_Oak")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes.get("Principled BSDF")

# Base Color texture
tex_color = nodes.new("ShaderNodeTexImage")
tex_color.image = bpy.data.images.load("/textures/wood_oak_basecolor.png")
tex_color.image.colorspace_settings.name = 'sRGB'
links.new(tex_color.outputs['Color'], bsdf.inputs['Base Color'])

# Normal Map
tex_normal = nodes.new("ShaderNodeTexImage")
tex_normal.image = bpy.data.images.load("/textures/wood_oak_normal.png")
tex_normal.image.colorspace_settings.name = 'Non-Color'
normal_map = nodes.new("ShaderNodeNormalMap")
links.new(tex_normal.outputs['Color'], normal_map.inputs['Color'])
links.new(normal_map.outputs['Normal'], bsdf.inputs['Normal'])

# Roughness
tex_rough = nodes.new("ShaderNodeTexImage")
tex_rough.image = bpy.data.images.load("/textures/wood_oak_roughness.png")
tex_rough.image.colorspace_settings.name = 'Non-Color'
links.new(tex_rough.outputs['Color'], bsdf.inputs['Roughness'])

# Assign to object
obj = bpy.data.objects["Table_Top"]
obj.data.materials.append(mat)
```

### Phase 5: Lighting

| Rig | Lights | Use Case |
|-----|--------|----------|
| Three-Point | Key + Fill + Rim | Product shots, characters |
| HDRI Environment | World shader | Outdoor, realistic reflections |
| Area + Sun | Sun for direction, Area for fill | Architectural |
| Volumetric | Spot with volume scatter | Moody, cinematic |
| Studio | 3+ large area lights with backdrop | Clean product |

```python
# Three-point lighting rig via MCP
import bpy
from mathutils import Vector

# Key Light (main, slightly warm)
bpy.ops.object.light_add(type='AREA', location=(3, -3, 4))
key = bpy.context.active_object
key.name = "Light_Key"
key.data.energy = 500
key.data.color = (1.0, 0.95, 0.9)
key.data.size = 2

# Fill Light (softer, cooler)
bpy.ops.object.light_add(type='AREA', location=(-3, -2, 3))
fill = bpy.context.active_object
fill.name = "Light_Fill"
fill.data.energy = 150
fill.data.color = (0.85, 0.9, 1.0)
fill.data.size = 3

# Rim Light (backlight for separation)
bpy.ops.object.light_add(type='AREA', location=(0, 4, 3))
rim = bpy.context.active_object
rim.name = "Light_Rim"
rim.data.energy = 300
rim.data.color = (1.0, 1.0, 1.0)
rim.data.size = 1.5
```

### Phase 6: Camera & Composition

```python
# Camera setup via MCP
import bpy

bpy.ops.object.camera_add(location=(5, -5, 3))
cam = bpy.context.active_object
cam.name = "Camera_Main"
cam.data.lens = 50  # 50mm standard
cam.data.dof.use_dof = True
cam.data.dof.aperture_fstop = 2.8

# Track to subject
constraint = cam.constraints.new('TRACK_TO')
constraint.target = bpy.data.objects.get("Hero_Object")
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'

bpy.context.scene.camera = cam
```

### Phase 7: Rendering

| Setting | Cycles | EEVEE |
|---------|--------|-------|
| Use when | Final quality, film | Preview, real-time, games |
| Samples | 256-1024 (denoise on) | 64-128 |
| Resolution | Match deliverable | Match deliverable |
| Color management | Filmic | Filmic or Standard |
| Denoise | OpenImageDenoise | N/A |

```python
# Render setup via MCP
import bpy

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = 512
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPENIMAGEDENOISE'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.filepath = "//renders/final_"
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_depth = '16'

# Color management
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
```

---

## Topology Standards

### Quad Rules

| Rule | Why |
|------|-----|
| Quads for deforming geometry | Subdivision and rigging require quads |
| Tris OK for static hard surface | Only if intentionally placed |
| N-gons NEVER in production | They cause shading artifacts and unpredictable subdivision |
| Edge loops at joints | Deformation needs geometry to fold |
| Even distribution | Avoid dense/sparse patches |

### Edge Flow for Common Shapes

```
Face/Head:
  - Edge loops around eyes (minimum 2 concentric)
  - Edge loops around mouth (minimum 2 concentric)
  - Loop from nostril to ear
  - Jawline loop connecting to neck

Cylinder/Tube joints:
  - 3 edge loops at bend point (hold, bend, hold)
  - Supporting loops 1-2 edges away from crease

Hard Surface:
  - Bevel edges for subdivision (2-segment minimum)
  - Support loops to prevent rounding
  - Boolean cleanup: dissolve unnecessary geometry
```

### Poly Budgets

| Asset Type | Triangles | Notes |
|-----------|-----------|-------|
| Hero character | 10K-30K | Highest detail |
| NPC / secondary | 5K-15K | Medium detail |
| Weapon / held item | 1K-5K | Arm's length viewing |
| Environment prop | 500-5K | Many instances |
| Background element | 100-1K | Distance viewing |
| Particle mesh | 10-100 | Hundreds instanced |

---

## High-to-Low Baking Pipeline

```
1. Sculpt or model HIGH POLY (no poly budget, detail is king)
2. Create LOW POLY (retopology or manual, within budget)
3. UV unwrap LOW POLY (non-overlapping, proper texel density)
4. Bake maps from HIGH → LOW:
   - Normal Map (tangent space)
   - Ambient Occlusion
   - Curvature
   - Position
   - ID Map (for masking)
5. Verify bake quality — check for ray projection errors
```

```python
# Bake normal map via MCP
import bpy

high = bpy.data.objects["Character_HighPoly"]
low = bpy.data.objects["Character_LowPoly"]

# Select high, then low (low must be active)
bpy.ops.object.select_all(action='DESELECT')
high.select_set(True)
low.select_set(True)
bpy.context.view_layer.objects.active = low

# Create bake image
bake_img = bpy.data.images.new("Bake_Normal", 2048, 2048)

# Assign image to active UV in material
mat = low.data.materials[0]
nodes = mat.node_tree.nodes
img_node = nodes.new("ShaderNodeTexImage")
img_node.image = bake_img
nodes.active = img_node

# Bake settings
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 128
bpy.context.scene.render.bake.use_selected_to_active = True
bpy.context.scene.render.bake.cage_extrusion = 0.02
bpy.ops.object.bake(type='NORMAL')

bake_img.save_render("//bakes/normal_map.png")
```

---

## Retopology Workflow

```
□ Import/reference high-poly sculpt
□ Use Shrinkwrap modifier on new low-poly mesh
□ Build clean quads following surface flow
□ Place edge loops at deformation points
□ Match target poly budget
□ Transfer normals from high-poly if needed
□ Verify with subdivision preview
```

---

## Animation

### Animation Type Decision Tree

```
What needs to move?
│
├── Character / creature with joints
│   └── Armature (skeletal animation)
│       ├── Walk cycle, run, idle → Keyframed actions
│       ├── Facial expressions → Shape keys (morph targets)
│       └── Procedural secondary motion → Drivers + constraints
│
├── Rigid objects (doors, machines, vehicles)
│   └── Object-level keyframes or constraints
│       ├── Simple motion → Location/Rotation/Scale keyframes
│       └── Mechanical → Drivers linked to empty rotation
│
├── Physics-driven motion (destruction, cloth, fluid)
│   └── Physics simulation → Bake to keyframes
│       ├── Falling / breaking → Rigid Body simulation
│       ├── Fabric / hair → Cloth simulation
│       └── Liquid / smoke → Fluid simulation (Mantaflow)
│
├── Camera motion (turntable, fly-through, dolly)
│   └── Camera keyframes or path constraint
│
└── Material animation (glowing, color shift, dissolve)
    └── Keyframe material node values
```

### Armature & Rigging via MCP

```python
# Create armature for a biped character via MCP
import bpy

# Create armature data
armature_data = bpy.data.armatures.new("Armature_Character")
armature_obj = bpy.data.objects.new("Rig_Character", armature_data)

# Link to scene
collection = bpy.data.collections.get("Characters")
if collection:
    collection.objects.link(armature_obj)
else:
    bpy.context.scene.collection.objects.link(armature_obj)

bpy.context.view_layer.objects.active = armature_obj
armature_obj.select_set(True)

# Enter edit mode to add bones
bpy.ops.object.mode_set(mode='EDIT')
edit_bones = armature_data.edit_bones

# Spine chain
hips = edit_bones.new("Bone_Hips")
hips.head = (0, 0, 1.0)
hips.tail = (0, 0, 1.15)

spine = edit_bones.new("Bone_Spine")
spine.head = (0, 0, 1.15)
spine.tail = (0, 0, 1.4)
spine.parent = hips

chest = edit_bones.new("Bone_Chest")
chest.head = (0, 0, 1.4)
chest.tail = (0, 0, 1.6)
chest.parent = spine

neck = edit_bones.new("Bone_Neck")
neck.head = (0, 0, 1.6)
neck.tail = (0, 0, 1.7)
neck.parent = chest

head = edit_bones.new("Bone_Head")
head.head = (0, 0, 1.7)
head.tail = (0, 0, 1.85)
head.parent = neck

# Left leg chain
thigh_L = edit_bones.new("Bone_Thigh.L")
thigh_L.head = (0.1, 0, 1.0)
thigh_L.tail = (0.1, 0, 0.5)
thigh_L.parent = hips

shin_L = edit_bones.new("Bone_Shin.L")
shin_L.head = (0.1, 0, 0.5)
shin_L.tail = (0.1, 0, 0.05)
shin_L.parent = thigh_L

foot_L = edit_bones.new("Bone_Foot.L")
foot_L.head = (0.1, 0, 0.05)
foot_L.tail = (0.1, -0.15, 0.0)
foot_L.parent = shin_L

# Left arm chain
upper_arm_L = edit_bones.new("Bone_UpperArm.L")
upper_arm_L.head = (0.18, 0, 1.55)
upper_arm_L.tail = (0.45, 0, 1.55)
upper_arm_L.parent = chest

forearm_L = edit_bones.new("Bone_Forearm.L")
forearm_L.head = (0.45, 0, 1.55)
forearm_L.tail = (0.7, 0, 1.55)
forearm_L.parent = upper_arm_L

hand_L = edit_bones.new("Bone_Hand.L")
hand_L.head = (0.7, 0, 1.55)
hand_L.tail = (0.8, 0, 1.55)
hand_L.parent = forearm_L

bpy.ops.object.mode_set(mode='OBJECT')

# Parent mesh to armature with automatic weights
mesh_obj = bpy.data.objects.get("Character_Mesh")
if mesh_obj:
    mesh_obj.select_set(True)
    armature_obj.select_set(True)
    bpy.context.view_layer.objects.active = armature_obj
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
```

### Rigging Standards

| Rule | Why |
|------|-----|
| Name bones with Bone_ prefix + .L/.R suffix | Symmetry tools and mirror work correctly |
| Root bone at world origin | Prevents drift in game engines |
| IK chains for legs and arms | Natural-looking poses with fewer keyframes |
| Hips as root of hierarchy | All motion flows from center of mass |
| Apply armature scale before posing | Scale ≠ 1 corrupts deformation |
| Weight paint after auto-weights | Auto weights are a starting point, not final |

### Inverse Kinematics Setup

```python
# Add IK constraint to leg via MCP
import bpy

armature_obj = bpy.data.objects["Rig_Character"]
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')

# Add IK to shin bone
shin = armature_obj.pose.bones["Bone_Shin.L"]
ik = shin.constraints.new('IK')
ik.chain_count = 2  # Thigh + Shin

# Create IK target empty
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0.1, 0, 0.05))
ik_target = bpy.context.active_object
ik_target.name = "IK_Foot.L"

# Assign target
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.mode_set(mode='POSE')
shin = armature_obj.pose.bones["Bone_Shin.L"]
shin.constraints["IK"].target = ik_target

bpy.ops.object.mode_set(mode='OBJECT')
```

### Keyframe Animation via MCP

```python
# Animate a bouncing ball via MCP
import bpy
import math

obj = bpy.data.objects["Ball"]
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 120
scene.render.fps = 24

# Clear existing animation
obj.animation_data_clear()

# Bounce keyframes
bounce_height = 3.0
bounces = 4
frames_per_bounce = 30

for i in range(bounces):
    frame_start = i * frames_per_bounce + 1
    frame_peak = frame_start + frames_per_bounce // 2
    frame_end = frame_start + frames_per_bounce

    # Ground contact (squash)
    obj.location = (0, 0, 0.4)
    obj.scale = (1.2, 1.2, 0.6)
    obj.keyframe_insert(data_path="location", frame=frame_start)
    obj.keyframe_insert(data_path="scale", frame=frame_start)

    # Peak (stretch)
    height = bounce_height * (0.7 ** i)
    obj.location = (0, 0, height)
    obj.scale = (0.85, 0.85, 1.15)
    obj.keyframe_insert(data_path="location", frame=frame_peak)
    obj.keyframe_insert(data_path="scale", frame=frame_peak)

    # Next ground contact
    obj.location = (0, 0, 0.4)
    obj.scale = (1.2, 1.2, 0.6)
    obj.keyframe_insert(data_path="location", frame=frame_end)
    obj.keyframe_insert(data_path="scale", frame=frame_end)

# Set interpolation to ease for natural motion
if obj.animation_data and obj.animation_data.action:
    for fcurve in obj.animation_data.action.fcurves:
        for kp in fcurve.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.easing = 'EASE_IN_OUT'
```

### Shape Keys (Morph Targets) via MCP

```python
# Add facial expression shape keys via MCP
import bpy

obj = bpy.data.objects["Character_Head"]
bpy.context.view_layer.objects.active = obj

# Basis shape key (required first)
if not obj.data.shape_keys:
    obj.shape_key_add(name="Basis", from_mix=False)

# Smile shape key
smile_key = obj.shape_key_add(name="Expression_Smile", from_mix=False)
# Modify vertices for smile (example: raise mouth corners)
# In production, sculpt these in edit mode

# Blink shape key
blink_key = obj.shape_key_add(name="Expression_Blink", from_mix=False)

# Animate shape key value
smile_key.value = 0.0
smile_key.keyframe_insert(data_path="value", frame=1)
smile_key.value = 1.0
smile_key.keyframe_insert(data_path="value", frame=15)
smile_key.value = 0.0
smile_key.keyframe_insert(data_path="value", frame=30)
```

### NLA Editor — Action Management

```python
# Create and manage multiple animation actions via MCP
import bpy

armature = bpy.data.objects["Rig_Character"]
bpy.context.view_layer.objects.active = armature
bpy.ops.object.mode_set(mode='POSE')

# Create Idle action
idle_action = bpy.data.actions.new(name="Action_Idle")
armature.animation_data.action = idle_action
# ... add idle keyframes ...

# Push to NLA strip (preserves action, allows stacking)
track = armature.animation_data.nla_tracks.new()
track.name = "NLA_Idle"
strip = track.strips.new("Idle", start=1, action=idle_action)
strip.repeat = 4  # Loop 4 times

# Create Walk action
walk_action = bpy.data.actions.new(name="Action_Walk")
armature.animation_data.action = walk_action
# ... add walk keyframes ...

# Push walk to separate NLA track
walk_track = armature.animation_data.nla_tracks.new()
walk_track.name = "NLA_Walk"
walk_strip = walk_track.strips.new("Walk", start=120, action=walk_action)

bpy.ops.object.mode_set(mode='OBJECT')
```

### NLA Best Practices

| Rule | Why |
|------|-----|
| One action per motion (idle, walk, run, attack) | Clean export, reusable in game engines |
| Name actions with Action_ prefix | Distinguishes from auto-generated data |
| Push to NLA before creating next action | Prevents overwriting current work |
| Set action frame ranges explicitly | Avoids trailing empty frames in export |
| Use NLA blending for transitions | Preview blend quality before export |

### Drivers (Procedural Animation)

```python
# Driver: gear rotation linked to another gear via MCP
import bpy

gear_a = bpy.data.objects["Gear_Driver"]
gear_b = bpy.data.objects["Gear_Driven"]

# Add driver to gear_b Z rotation
driver = gear_b.driver_add("rotation_euler", 2).driver  # Z axis
driver.type = 'SCRIPTED'

# Add variable pointing to gear_a rotation
var = driver.variables.new()
var.name = "gear_a_rot"
var.type = 'TRANSFORMS'
var.targets[0].id = gear_a
var.targets[0].transform_type = 'ROT_Z'
var.targets[0].transform_space = 'LOCAL_SPACE'

# Counter-rotate with gear ratio (e.g., 2:1)
driver.expression = "-gear_a_rot * 2.0"
```

### Physics Simulations

#### Rigid Body

```python
# Destruction simulation via MCP
import bpy

# Fracture object with Cell Fracture addon
obj = bpy.data.objects["Wall"]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

# Enable rigid body on fragments
for frag in [o for o in bpy.data.objects if o.name.startswith("Wall_cell")]:
    bpy.context.view_layer.objects.active = frag
    bpy.ops.rigidbody.object_add(type='ACTIVE')
    frag.rigid_body.mass = 5.0
    frag.rigid_body.friction = 0.6
    frag.rigid_body.restitution = 0.1  # Low bounce

# Ground plane as passive
ground = bpy.data.objects["Ground"]
bpy.context.view_layer.objects.active = ground
bpy.ops.rigidbody.object_add(type='PASSIVE')

# Bake simulation
bpy.ops.ptcache.bake_all(bake=True)
```

#### Cloth Simulation

```python
# Cloth simulation on fabric via MCP
import bpy

cloth_obj = bpy.data.objects["Tablecloth"]
bpy.context.view_layer.objects.active = cloth_obj

# Add cloth modifier
bpy.ops.object.modifier_add(type='CLOTH')
cloth = cloth_obj.modifiers["Cloth"]
cloth.settings.mass = 0.3
cloth.settings.air_damping = 1.0
cloth.settings.quality = 8  # Simulation quality steps

# Collision settings
cloth.collision_settings.use_collision = True
cloth.collision_settings.distance_min = 0.005

# Pin vertex group (vertices that don't move)
# Create vertex group "Pinned" in edit mode first
cloth.settings.vertex_group_mass = "Pinned"

# Set collision on table
table = bpy.data.objects["Table"]
bpy.context.view_layer.objects.active = table
bpy.ops.object.modifier_add(type='COLLISION')

# Bake
bpy.ops.ptcache.bake_all(bake=True)
```

### Camera Animation

#### Turntable (Product Showcase)

```python
# 360° turntable camera animation via MCP
import bpy
import math

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 120
scene.render.fps = 24

# Create camera on circular path
bpy.ops.curve.primitive_bezier_circle_add(radius=5, location=(0, 0, 1.5))
circle = bpy.context.active_object
circle.name = "CameraPath_Turntable"

# Create camera
bpy.ops.object.camera_add(location=(5, 0, 1.5))
cam = bpy.context.active_object
cam.name = "Camera_Turntable"
cam.data.lens = 85  # Portrait lens for product

# Add follow path constraint
follow = cam.constraints.new('FOLLOW_PATH')
follow.target = circle
follow.use_curve_follow = True
follow.forward_axis = 'FORWARD_X'
follow.up_axis = 'UP_Z'

# Track to center
track = cam.constraints.new('TRACK_TO')
track.target = bpy.data.objects.get("Product")
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'

# Animate path offset (0 to -1 = full revolution)
follow.offset = 0
follow.keyframe_insert(data_path="offset", frame=1)
follow.offset = -100
follow.keyframe_insert(data_path="offset", frame=120)

# Linear interpolation for smooth constant-speed rotation
if cam.animation_data and cam.animation_data.action:
    for fc in cam.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'LINEAR'

scene.camera = cam
```

#### Dolly / Fly-Through

```python
# Camera fly-through along a path via MCP
import bpy

# Create a Nurbs path for camera travel
bpy.ops.curve.primitive_nurbs_path_add()
path = bpy.context.active_object
path.name = "CameraPath_FlyThrough"

# Edit control points to shape the flight path
# (adjust in edit mode or via MCP vertex manipulation)

cam = bpy.data.objects["Camera_Main"]
follow = cam.constraints.new('FOLLOW_PATH')
follow.target = path
follow.use_curve_follow = True

# Animate evaluation time
path.data.use_path = True
path.data.path_duration = 250
path.data.eval_time = 0
path.data.keyframe_insert(data_path="eval_time", frame=1)
path.data.eval_time = 250
path.data.keyframe_insert(data_path="eval_time", frame=250)
```

### Walk Cycle Pattern (Pose-to-Pose)

```
Frame layout for a 24-frame walk cycle at 24fps (1 second):

Frame 1:  Contact pose (left foot forward, right foot back)
Frame 7:  Down pose (weight drops, front knee bends)
Frame 13: Passing pose (back leg swings forward, crosses)
Frame 19: Up pose (push off back foot, body rises)
Frame 24: Contact pose MIRRORED (right foot forward)

Key principles:
□ Hips drive the walk — translate Y (forward) + rotate Z (sway)
□ Spine counter-rotates against hips (natural twist)
□ Arms swing opposite to legs (right arm with left leg)
□ Head stays relatively stable (slight bob)
□ Feet plant flat — no sliding (match translation to step length)
□ Weight shift visible in hip drop on contact
```

### Animation Rendering & Export

```python
# Render animation via MCP
import bpy

scene = bpy.context.scene

# Animation render settings
scene.render.engine = 'CYCLES'
scene.cycles.samples = 256  # Lower for animation (denoise compensates)
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080

# Output as image sequence (safer than video — can resume if crash)
scene.render.filepath = "//renders/anim_"
scene.render.image_settings.file_format = 'PNG'

# OR output as video (FFmpeg)
scene.render.image_settings.file_format = 'FFMPEG'
scene.render.ffmpeg.format = 'MPEG4'
scene.render.ffmpeg.codec = 'H264'
scene.render.ffmpeg.constant_rate_factor = 'MEDIUM'
scene.render.ffmpeg.audio_codec = 'AAC'

# Render animation
bpy.ops.render.render(animation=True)
```

### Animation Export for Game Engines

```python
# Export animated model for game engines via MCP
import bpy

# Select armature + mesh
armature = bpy.data.objects["Rig_Character"]
mesh = bpy.data.objects["Character_Mesh"]
bpy.ops.object.select_all(action='DESELECT')
armature.select_set(True)
mesh.select_set(True)
bpy.context.view_layer.objects.active = armature

# Export as GLB with animations
bpy.ops.export_scene.gltf(
    filepath="//export/character_animated.glb",
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_nla_strips=True,       # Each NLA strip = separate animation
    export_animation_mode='ACTIONS',
    export_frame_range=True,
    export_anim_slide_to_zero=True,  # Each action starts at frame 0
    export_optimize_animation_size=True,
    export_apply=True,
)

# For FBX (Unity/Unreal)
bpy.ops.export_scene.fbx(
    filepath="//export/character_animated.fbx",
    use_selection=True,
    add_leaf_bones=False,  # Unreal doesn't need leaf bones
    bake_anim=True,
    bake_anim_use_nla_strips=True,
    bake_anim_use_all_actions=True,
    bake_anim_simplify_factor=1.0,
)
```

### Animation NEVER Rules

- **NEVER** animate without setting frame range first
- **NEVER** skip NLA — actions get overwritten without it
- **NEVER** export animation without baking physics/cloth first
- **NEVER** leave IK targets un-parented (they drift on export)
- **NEVER** forget to set interpolation type (default linear looks robotic)
- **NEVER** animate scale on armature bones (scale breaks in engines)
- **NEVER** ship a walk cycle without checking foot sliding

### ⛔ STOP GATE — Animation Completion

DO NOT mark animation complete without:

1. **Frame range set** — explicit start/end, no trailing dead frames
2. **Actions named** — Action_Idle, Action_Walk, not "Action"
3. **NLA organized** — each action on its own track
4. **No foot sliding** — ground contact matches translation
5. **Interpolation set** — Bezier for organic, Linear for mechanical
6. **Physics baked** — all simulations cached before export
7. **Export tested** — re-import GLB/FBX to verify animation plays
8. **FPS consistent** — scene FPS matches target engine FPS

---

## Procedural Texturing (No Image Textures)

```python
# Procedural wood material via MCP
import bpy

mat = bpy.data.materials.new(name="Mat_Wood_Procedural")
mat.use_nodes = True
nodes = mat.node_tree.nodes
links = mat.node_tree.links
bsdf = nodes.get("Principled BSDF")

# Texture Coordinate → Mapping → Wave Texture → Color Ramp → Base Color
tex_coord = nodes.new("ShaderNodeTexCoord")
mapping = nodes.new("ShaderNodeMapping")
wave = nodes.new("ShaderNodeTexWave")
wave.wave_type = 'RINGS'
wave.inputs['Scale'].default_value = 3.0
wave.inputs['Distortion'].default_value = 4.0
wave.inputs['Detail'].default_value = 3.0

ramp = nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].color = (0.15, 0.08, 0.03, 1)  # Dark wood
ramp.color_ramp.elements[1].color = (0.4, 0.22, 0.1, 1)    # Light wood

links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
links.new(mapping.outputs['Vector'], wave.inputs['Vector'])
links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])

# Roughness variation with Noise
noise = nodes.new("ShaderNodeTexNoise")
noise.inputs['Scale'].default_value = 15.0
math_node = nodes.new("ShaderNodeMapRange")
math_node.inputs['From Min'].default_value = 0.0
math_node.inputs['From Max'].default_value = 1.0
math_node.inputs['To Min'].default_value = 0.3
math_node.inputs['To Max'].default_value = 0.7
links.new(noise.outputs['Fac'], math_node.inputs['Value'])
links.new(math_node.outputs['Result'], bsdf.inputs['Roughness'])
```

---

## Scene Composition Checklist

```
□ Focal point established (rule of thirds)
□ Foreground / midground / background depth
□ Color palette intentional (warm/cool contrast)
□ Scale reference present during modeling
□ Negative space used — not everything filled
□ Camera angle tells a story
□ Lighting supports mood (not flat uniform)
□ Ground contact — objects sit on surfaces, don't float
□ Edge wear / imperfections on surfaces (nothing is perfect)
□ Environment context — objects exist in a world
```

---

## NEVER

- **NEVER** leave default material names (Material, Material.001)
- **NEVER** skip applying transforms before export
- **NEVER** use N-gons in final production geometry
- **NEVER** export without checking face orientation
- **NEVER** bake without cage extrusion set (causes ray misses)
- **NEVER** use 4096 textures for game props — 1024 max, 512 preferred
- **NEVER** leave floating geometry or non-manifold edges
- **NEVER** model without reference images
- **NEVER** ship a scene with default cube, light, or camera
- **NEVER** use smooth shading without edge splits or auto-smooth

---

## ⛔ STOP GATE — Scene Completion

DO NOT mark a scene complete without:

1. **All objects named** — no "Cube.003" or "Sphere.012"
2. **All materials named** — no "Material" or "Material.001"
3. **Collections organized** — logical grouping by function
4. **Transforms applied** — location, rotation, scale all clean
5. **Normals verified** — face orientation overlay shows all blue
6. **UV maps clean** — no overlapping, proper texel density
7. **Textures assigned** — no missing or placeholder textures
8. **Lighting intentional** — not default point light
9. **Camera composed** — rule of thirds, proper focal length
10. **Test render passes** — no black faces, missing textures, or fireflies

---

## Output Format

```markdown
## 3D Scene: [Name]

### Concept
[What this scene depicts and its purpose]

### Scene Breakdown
| Object | Poly Count | Material | LOD |
|--------|-----------|----------|-----|
| [name] | [tris]    | [mat]    | [y/n] |

### Materials
| Material | Type | Textures | Resolution |
|----------|------|----------|-----------|
| [name]   | PBR/Procedural | [list] | [res] |

### Lighting
[Rig type, light list, HDRI if used]

### Camera
[Focal length, composition, DOF settings]

### Render Settings
[Engine, samples, resolution, output format]

### Blender MCP Commands Used
[Summary of MCP operations performed]
```

---

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `web-3d-asset-pipeline` | Exporting to GLB/glTF for web |
| `three-d-developing` | Using models in React Three Fiber / Three.js |
| `r3f-game-building` | Loading models in R3F games |
| `playmaster` | 2D asset preparation |
| `animation-designing` | Motion and keyframe design |
