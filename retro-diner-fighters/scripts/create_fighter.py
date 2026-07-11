"""
Blender headless script: Create a stylized low-poly 3D fighter
Run: blender --background --python create_fighter.py
Exports: ../public/models/fighter3d.glb
"""
import bpy
import math
import os
import sys

# ── Clean scene ──
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 60

# Output path
script_dir = os.path.dirname(os.path.abspath(__file__))
export_dir = os.path.join(script_dir, '..', 'public', 'models')
os.makedirs(export_dir, exist_ok=True)
export_path = os.path.join(export_dir, 'fighter3d.glb')

# ── Materials ──
def make_mat(name, r, g, b):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Base Color'].default_value = (r, g, b, 1)
    bsdf.inputs['Roughness'].default_value = 0.6
    bsdf.inputs['Metallic'].default_value = 0.1
    return mat

mat_skin = make_mat("Skin", 0.45, 0.28, 0.18)
mat_shirt = make_mat("Shirt", 0.1, 0.1, 0.9)  # blue fighter top
mat_pants = make_mat("Pants", 0.15, 0.15, 0.15)
mat_shoes = make_mat("Shoes", 0.9, 0.2, 0.2)
mat_hair = make_mat("Hair", 0.05, 0.05, 0.05)
mat_gloves = make_mat("Gloves", 0.8, 0.1, 0.1)
mat_belt = make_mat("Belt", 0.7, 0.6, 0.1)

# ── Helper: create mesh with material ──
def add_cube(name, loc, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(scale=True)
    obj.data.materials.append(mat)
    return obj

def add_sphere(name, loc, radius, mat, segments=12):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, segments=segments, ring_count=8, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.materials.append(mat)
    return obj

# ── Build Character Parts ──
parts = []

# Head
head = add_sphere("Head", (0, 0, 1.65), 0.12, mat_skin, 10)
parts.append(head)

# Hair (flat top style)
hair = add_cube("Hair", (0, 0, 1.78), (0.11, 0.11, 0.04), mat_hair)
parts.append(hair)

# Neck
neck = add_cube("Neck", (0, 0, 1.5), (0.04, 0.04, 0.04), mat_skin)
parts.append(neck)

# Torso (upper)
torso_upper = add_cube("Torso_Upper", (0, 0, 1.35), (0.18, 0.1, 0.12), mat_shirt)
parts.append(torso_upper)

# Torso (lower / abs)
torso_lower = add_cube("Torso_Lower", (0, 0, 1.18), (0.15, 0.08, 0.08), mat_shirt)
parts.append(torso_lower)

# Belt
belt = add_cube("Belt", (0, 0, 1.1), (0.16, 0.09, 0.02), mat_belt)
parts.append(belt)

# ── Arms ──
# Upper arms
arm_up_L = add_cube("UpperArm_L", (0.22, 0, 1.38), (0.05, 0.05, 0.12), mat_shirt)
arm_up_R = add_cube("UpperArm_R", (-0.22, 0, 1.38), (0.05, 0.05, 0.12), mat_shirt)
parts.extend([arm_up_L, arm_up_R])

# Forearms
arm_lo_L = add_cube("Forearm_L", (0.22, 0, 1.2), (0.04, 0.04, 0.11), mat_skin)
arm_lo_R = add_cube("Forearm_R", (-0.22, 0, 1.2), (0.04, 0.04, 0.11), mat_skin)
parts.extend([arm_lo_L, arm_lo_R])

# Gloves / fists
fist_L = add_sphere("Fist_L", (0.22, 0, 1.08), 0.04, mat_gloves, 8)
fist_R = add_sphere("Fist_R", (-0.22, 0, 1.08), 0.04, mat_gloves, 8)
parts.extend([fist_L, fist_R])

# ── Legs ──
# Upper legs
leg_up_L = add_cube("UpperLeg_L", (0.08, 0, 0.9), (0.06, 0.06, 0.14), mat_pants)
leg_up_R = add_cube("UpperLeg_R", (-0.08, 0, 0.9), (0.06, 0.06, 0.14), mat_pants)
parts.extend([leg_up_L, leg_up_R])

# Lower legs
leg_lo_L = add_cube("LowerLeg_L", (0.08, 0, 0.6), (0.05, 0.05, 0.15), mat_pants)
leg_lo_R = add_cube("LowerLeg_R", (-0.08, 0, 0.6), (0.05, 0.05, 0.15), mat_pants)
parts.extend([leg_lo_L, leg_lo_R])

# Shoes
shoe_L = add_cube("Shoe_L", (0.08, -0.02, 0.42), (0.05, 0.08, 0.04), mat_shoes)
shoe_R = add_cube("Shoe_R", (-0.08, -0.02, 0.42), (0.05, 0.08, 0.04), mat_shoes)
parts.extend([shoe_L, shoe_R])

# ── Join all parts into one mesh ──
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = torso_upper
bpy.ops.object.join()
mesh_obj = bpy.context.active_object
mesh_obj.name = "Fighter3D"

# Smooth shading
bpy.ops.object.shade_smooth()

# ── Create Armature ──
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.armature_add(location=(0, 0, 0))
armature_obj = bpy.context.active_object
armature_obj.name = "Rig_Fighter"
armature = armature_obj.data
armature.name = "Armature_Fighter"

bpy.ops.object.mode_set(mode='EDIT')
edit_bones = armature.edit_bones

# Remove default bone
for b in edit_bones:
    edit_bones.remove(b)

# Build skeleton
def bone(name, head, tail, parent=None):
    b = edit_bones.new(name)
    b.head = head
    b.tail = tail
    if parent:
        b.parent = edit_bones.get(parent)
    return b

bone("Hips",       (0, 0, 1.05),  (0, 0, 1.15))
bone("Spine",      (0, 0, 1.15),  (0, 0, 1.3),   "Hips")
bone("Chest",      (0, 0, 1.3),   (0, 0, 1.45),  "Spine")
bone("Neck",       (0, 0, 1.45),  (0, 0, 1.55),  "Chest")
bone("Head",       (0, 0, 1.55),  (0, 0, 1.75),  "Neck")

# Left arm
bone("UpperArm.L", (0.18, 0, 1.42), (0.22, 0, 1.28), "Chest")
bone("Forearm.L",  (0.22, 0, 1.28), (0.22, 0, 1.12), "UpperArm.L")
bone("Hand.L",     (0.22, 0, 1.12), (0.22, 0, 1.05), "Forearm.L")

# Right arm
bone("UpperArm.R", (-0.18, 0, 1.42), (-0.22, 0, 1.28), "Chest")
bone("Forearm.R",  (-0.22, 0, 1.28), (-0.22, 0, 1.12), "UpperArm.R")
bone("Hand.R",     (-0.22, 0, 1.12), (-0.22, 0, 1.05), "Forearm.R")

# Left leg
bone("Thigh.L",    (0.08, 0, 1.05), (0.08, 0, 0.7), "Hips")
bone("Shin.L",     (0.08, 0, 0.7),  (0.08, 0, 0.45), "Thigh.L")
bone("Foot.L",     (0.08, 0, 0.45), (0.08, -0.1, 0.4), "Shin.L")

# Right leg
bone("Thigh.R",    (-0.08, 0, 1.05), (-0.08, 0, 0.7), "Hips")
bone("Shin.R",     (-0.08, 0, 0.7),  (-0.08, 0, 0.45), "Thigh.R")
bone("Foot.R",     (-0.08, 0, 0.45), (-0.08, -0.1, 0.4), "Shin.R")

bpy.ops.object.mode_set(mode='OBJECT')

# ── Parent mesh to armature with auto weights ──
bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)
armature_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj
bpy.ops.object.parent_set(type='ARMATURE_AUTO')

# ── Animations ──
def set_pose_keyframe(arm_obj, frame, bone_rotations):
    """Set rotation keyframes for multiple bones at a given frame."""
    scene.frame_set(frame)
    for bone_name, (rx, ry, rz) in bone_rotations.items():
        pb = arm_obj.pose.bones.get(bone_name)
        if pb:
            pb.rotation_mode = 'XYZ'
            pb.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
            pb.keyframe_insert(data_path="rotation_euler", frame=frame)

def set_loc_keyframe(arm_obj, frame, bone_locs):
    """Set location keyframes."""
    scene.frame_set(frame)
    for bone_name, (x, y, z) in bone_locs.items():
        pb = arm_obj.pose.bones.get(bone_name)
        if pb:
            pb.keyframe_insert(data_path="location", frame=frame)

def create_action(name, frame_start, frame_end, keyframes):
    """Create a named action with keyframes."""
    action = bpy.data.actions.new(name=name)
    armature_obj.animation_data_create()
    armature_obj.animation_data.action = action

    for frame, rotations in keyframes:
        set_pose_keyframe(armature_obj, frame, rotations)

    # Set frame range
    action.frame_start = frame_start
    action.frame_end = frame_end

    # Push to NLA so it exports as separate animation
    track = armature_obj.animation_data.nla_tracks.new()
    track.name = name
    strip = track.strips.new(name, start=frame_start, action=action)
    strip.action_frame_start = frame_start
    strip.action_frame_end = frame_end

    armature_obj.animation_data.action = None
    return action

# ── Define Animations ──

# IDLE - subtle breathing sway
create_action("idle", 1, 60, [
    (1,  {"Spine": (0, 0, 0), "Chest": (2, 0, 0), "UpperArm.L": (0, 0, 10), "UpperArm.R": (0, 0, -10)}),
    (30, {"Spine": (3, 0, 0), "Chest": (0, 0, 0), "UpperArm.L": (0, 0, 12), "UpperArm.R": (0, 0, -12)}),
    (60, {"Spine": (0, 0, 0), "Chest": (2, 0, 0), "UpperArm.L": (0, 0, 10), "UpperArm.R": (0, 0, -10)}),
])

# PUNCH - right cross
create_action("punch", 1, 20, [
    (1,  {"Chest": (0, 0, 0), "UpperArm.R": (0, 0, 0), "Forearm.R": (0, 0, 0)}),
    (5,  {"Chest": (0, 30, 0), "UpperArm.R": (-80, 0, -30), "Forearm.R": (-90, 0, 0)}),
    (10, {"Chest": (0, -20, 0), "UpperArm.R": (-90, 0, -90), "Forearm.R": (-20, 0, 0)}),
    (20, {"Chest": (0, 0, 0), "UpperArm.R": (0, 0, 0), "Forearm.R": (0, 0, 0)}),
])

# KICK - right roundhouse
create_action("kick", 1, 25, [
    (1,  {"Thigh.R": (0, 0, 0), "Shin.R": (0, 0, 0), "Hips": (0, 0, 0)}),
    (8,  {"Thigh.R": (-90, 0, 30), "Shin.R": (60, 0, 0), "Hips": (0, -15, 0)}),
    (14, {"Thigh.R": (-90, 0, 80), "Shin.R": (10, 0, 0), "Hips": (0, -30, 0)}),
    (25, {"Thigh.R": (0, 0, 0), "Shin.R": (0, 0, 0), "Hips": (0, 0, 0)}),
])

# BLOCK - guard up
create_action("block", 1, 10, [
    (1,  {"UpperArm.L": (-60, 0, 40), "Forearm.L": (-100, 0, 0),
           "UpperArm.R": (-60, 0, -40), "Forearm.R": (-100, 0, 0), "Spine": (10, 0, 0)}),
    (10, {"UpperArm.L": (-60, 0, 40), "Forearm.L": (-100, 0, 0),
           "UpperArm.R": (-60, 0, -40), "Forearm.R": (-100, 0, 0), "Spine": (10, 0, 0)}),
])

# HURT - reel back
create_action("hurt", 1, 20, [
    (1,  {"Spine": (0, 0, 0), "Head": (0, 0, 0)}),
    (5,  {"Spine": (-20, 10, 0), "Head": (-15, 15, 0), "Chest": (-10, 0, 0)}),
    (12, {"Spine": (-15, 5, 0), "Head": (-10, 10, 0), "Chest": (-5, 0, 0)}),
    (20, {"Spine": (0, 0, 0), "Head": (0, 0, 0), "Chest": (0, 0, 0)}),
])

# JUMP - crouch then leap
create_action("jump", 1, 30, [
    (1,  {"Hips": (0, 0, 0), "Thigh.L": (0, 0, 0), "Thigh.R": (0, 0, 0)}),
    (8,  {"Hips": (0, 0, 0), "Thigh.L": (-30, 0, 0), "Shin.L": (50, 0, 0),
           "Thigh.R": (-30, 0, 0), "Shin.R": (50, 0, 0), "Spine": (15, 0, 0)}),
    (18, {"Hips": (0, 0, 0), "Thigh.L": (15, 0, 0), "Shin.L": (0, 0, 0),
           "Thigh.R": (15, 0, 0), "Shin.R": (0, 0, 0), "Spine": (-5, 0, 0)}),
    (30, {"Hips": (0, 0, 0), "Thigh.L": (0, 0, 0), "Shin.L": (0, 0, 0),
           "Thigh.R": (0, 0, 0), "Shin.R": (0, 0, 0), "Spine": (0, 0, 0)}),
])

# KNOCKDOWN - fall
create_action("knockdown", 1, 30, [
    (1,  {"Hips": (0, 0, 0), "Spine": (0, 0, 0)}),
    (15, {"Hips": (0, 0, 0), "Spine": (-60, 0, 10), "Head": (-30, 0, 0),
           "Thigh.L": (40, 0, 0), "Thigh.R": (20, 0, 0)}),
    (30, {"Hips": (0, 0, 0), "Spine": (-80, 0, 10), "Head": (-40, 0, 0),
           "Thigh.L": (50, 0, 0), "Thigh.R": (30, 0, 0)}),
])

# VICTORY - fist pump
create_action("victory", 1, 40, [
    (1,  {"UpperArm.R": (0, 0, 0), "Forearm.R": (0, 0, 0), "Spine": (0, 0, 0)}),
    (12, {"UpperArm.R": (-170, 0, 0), "Forearm.R": (-30, 0, 0), "Spine": (-5, 0, 0)}),
    (25, {"UpperArm.R": (-160, 0, 0), "Forearm.R": (-40, 0, 0), "Spine": (-8, 0, 0)}),
    (40, {"UpperArm.R": (-170, 0, 0), "Forearm.R": (-30, 0, 0), "Spine": (-5, 0, 0)}),
])

# ── Export as GLB ──
bpy.ops.object.select_all(action='DESELECT')
armature_obj.select_set(True)
mesh_obj.select_set(True)
bpy.context.view_layer.objects.active = armature_obj

bpy.ops.export_scene.gltf(
    filepath=export_path,
    export_format='GLB',
    use_selection=True,
    export_animations=True,
    export_nla_strips=True,
    export_apply=True,
    export_yup=True,
)

print(f"\n✅ Fighter3D exported to: {export_path}")
print(f"   Mesh: {len(mesh_obj.data.vertices)} verts, {len(mesh_obj.data.polygons)} faces")
print(f"   Bones: {len(armature.bones)}")
print(f"   Animations: {len(bpy.data.actions)}")
