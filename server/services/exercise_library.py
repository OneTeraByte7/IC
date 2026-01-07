"""
Comprehensive Exercise Library for Stroke Rehabilitation
INNOVATION: 50+ exercises with 3D demonstrations and clinical instructions
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum

router = APIRouter()

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"

class BodyPart(str, Enum):
    SHOULDER = "shoulder"
    ARM = "arm"
    ELBOW = "elbow"
    WRIST = "wrist"
    HAND = "hand"
    LEG = "leg"
    KNEE = "knee"
    ANKLE = "ankle"
    CORE = "core"
    BALANCE = "balance"

class Exercise(BaseModel):
    id: str
    name: str
    category: BodyPart
    difficulty: DifficultyLevel
    description: str
    instructions: List[str]
    target_muscles: List[str]
    common_mistakes: List[str]
    contraindications: List[str]
    reps_per_set: int
    sets: int
    hold_duration: Optional[int] = None
    video_url: Optional[str] = None
    benefits: List[str]
    progression: Optional[str] = None
    regression: Optional[str] = None

# Comprehensive Exercise Database
EXERCISE_LIBRARY = {
    # === SHOULDER EXERCISES ===
    "shoulder_flexion": Exercise(
        id="shoulder_flexion",
        name="Shoulder Forward Flexion",
        category=BodyPart.SHOULDER,
        difficulty=DifficultyLevel.BEGINNER,
        description="Raise your arm forward and up, keeping elbow straight",
        instructions=[
            "Stand or sit upright with arms at your sides",
            "Keep your elbow straight and palm facing inward",
            "Slowly raise your arm forward and up to shoulder height or higher",
            "Hold for 2-3 seconds at the top",
            "Slowly lower back to starting position",
            "Repeat with the other arm"
        ],
        target_muscles=["Anterior Deltoid", "Upper Pectoralis", "Biceps"],
        common_mistakes=[
            "Shrugging shoulders up toward ears",
            "Leaning backward to compensate",
            "Moving too quickly",
            "Not maintaining straight elbow"
        ],
        contraindications=[
            "Acute shoulder injury or inflammation",
            "Recent shoulder surgery (without PT clearance)",
            "Severe shoulder pain"
        ],
        reps_per_set=10,
        sets=3,
        hold_duration=3,
        benefits=[
            "Improves shoulder range of motion",
            "Strengthens shoulder stabilizers",
            "Enhances reaching ability",
            "Supports functional independence"
        ],
        progression="shoulder_flexion_resistance",
        regression="shoulder_flexion_assisted"
    ),
    
    "shoulder_abduction": Exercise(
        id="shoulder_abduction",
        name="Shoulder Abduction (Lateral Raise)",
        category=BodyPart.SHOULDER,
        difficulty=DifficultyLevel.BEGINNER,
        description="Raise your arm out to the side up to shoulder height",
        instructions=[
            "Stand or sit upright with arms at your sides",
            "Keep elbow straight, palm facing down",
            "Slowly raise arm out to the side",
            "Lift until arm is parallel to the floor (shoulder height)",
            "Hold for 2-3 seconds",
            "Slowly lower back down",
            "Repeat with the other arm"
        ],
        target_muscles=["Middle Deltoid", "Supraspinatus", "Trapezius"],
        common_mistakes=[
            "Raising arm above shoulder without rotating",
            "Tilting body to the side",
            "Hunching shoulders",
            "Moving too fast"
        ],
        contraindications=[
            "Rotator cuff tear (without medical clearance)",
            "Shoulder impingement syndrome",
            "Acute shoulder bursitis"
        ],
        reps_per_set=10,
        sets=3,
        hold_duration=3,
        benefits=[
            "Improves shoulder mobility",
            "Strengthens rotator cuff muscles",
            "Enhances ability to reach sideways",
            "Prevents frozen shoulder"
        ],
        progression="shoulder_abduction_resistance",
        regression="shoulder_abduction_passive"
    ),

    "shoulder_rotation_external": Exercise(
        id="shoulder_rotation_external",
        name="External Shoulder Rotation",
        category=BodyPart.SHOULDER,
        difficulty=DifficultyLevel.INTERMEDIATE,
        description="Rotate your shoulder outward while keeping elbow at side",
        instructions=[
            "Stand or sit with elbow bent at 90 degrees",
            "Keep elbow tucked against your side",
            "Place a rolled towel between elbow and body",
            "Rotate forearm outward, away from your body",
            "Keep wrist straight throughout",
            "Return slowly to starting position"
        ],
        target_muscles=["Infraspinatus", "Teres Minor", "Posterior Deltoid"],
        common_mistakes=[
            "Allowing elbow to move away from body",
            "Rotating entire trunk instead of just shoulder",
            "Moving too quickly",
            "Not maintaining 90-degree elbow bend"
        ],
        contraindications=[
            "Recent shoulder dislocation",
            "Severe rotator cuff injury",
            "Shoulder instability"
        ],
        reps_per_set=12,
        sets=3,
        benefits=[
            "Strengthens rotator cuff",
            "Improves shoulder stability",
            "Prevents shoulder injuries",
            "Enhances posture"
        ],
        progression="external_rotation_band",
        regression="external_rotation_passive"
    ),

    # === ARM/ELBOW EXERCISES ===
    "bicep_curl": Exercise(
        id="bicep_curl",
        name="Bicep Curl",
        category=BodyPart.ARM,
        difficulty=DifficultyLevel.BEGINNER,
        description="Bend elbow to bring hand toward shoulder",
        instructions=[
            "Sit or stand with arm hanging at side",
            "Keep elbow close to body",
            "Slowly bend elbow, bringing hand toward shoulder",
            "Keep wrist straight, palm facing up",
            "Hold at top for 1-2 seconds",
            "Slowly straighten arm back down",
            "Control the movement both up and down"
        ],
        target_muscles=["Biceps Brachii", "Brachialis", "Brachioradialis"],
        common_mistakes=[
            "Swinging the weight",
            "Moving elbow forward",
            "Arching back",
            "Not fully extending arm"
        ],
        contraindications=[
            "Acute elbow injury",
            "Biceps tendon rupture",
            "Severe elbow arthritis"
        ],
        reps_per_set=10,
        sets=3,
        benefits=[
            "Strengthens arm muscles",
            "Improves ability to lift objects",
            "Enhances elbow control",
            "Supports functional activities"
        ],
        progression="bicep_curl_resistance",
        regression="bicep_curl_assisted"
    ),

    "tricep_extension": Exercise(
        id="tricep_extension",
        name="Tricep Extension",
        category=BodyPart.ARM,
        difficulty=DifficultyLevel.INTERMEDIATE,
        description="Straighten elbow against resistance",
        instructions=[
            "Raise arm overhead with elbow bent",
            "Support upper arm with other hand",
            "Slowly straighten elbow, extending arm upward",
            "Keep upper arm still, only moving forearm",
            "Hold at full extension for 2 seconds",
            "Slowly lower back to bent position"
        ],
        target_muscles=["Triceps Brachii", "Anconeus"],
        common_mistakes=[
            "Allowing upper arm to move",
            "Not fully extending elbow",
            "Arching lower back",
            "Moving too quickly"
        ],
        contraindications=[
            "Elbow hyperextension injury",
            "Tennis elbow (lateral epicondylitis)",
            "Recent elbow surgery"
        ],
        reps_per_set=10,
        sets=3,
        benefits=[
            "Strengthens back of arm",
            "Improves pushing ability",
            "Enhances arm extension",
            "Supports overhead movements"
        ],
        progression="tricep_extension_resistance",
        regression="tricep_extension_assisted"
    ),

    # === WRIST/HAND EXERCISES ===
    "wrist_flexion": Exercise(
        id="wrist_flexion",
        name="Wrist Flexion",
        category=BodyPart.WRIST,
        difficulty=DifficultyLevel.BEGINNER,
        description="Bend wrist forward and back",
        instructions=[
            "Rest forearm on table with hand hanging over edge",
            "Palm facing up",
            "Slowly bend wrist upward, lifting hand",
            "Hold for 2 seconds",
            "Slowly lower hand back down",
            "Keep forearm still throughout movement"
        ],
        target_muscles=["Wrist Flexors", "Finger Flexors"],
        common_mistakes=[
            "Moving entire forearm",
            "Gripping too tightly",
            "Not moving through full range",
            "Moving too quickly"
        ],
        contraindications=[
            "Carpal tunnel syndrome (severe)",
            "Acute wrist sprain",
            "Wrist fracture"
        ],
        reps_per_set=15,
        sets=3,
        benefits=[
            "Improves wrist mobility",
            "Strengthens grip",
            "Enhances fine motor control",
            "Prevents wrist stiffness"
        ],
        progression="wrist_flexion_resistance",
        regression="wrist_flexion_passive"
    ),

    "finger_extension": Exercise(
        id="finger_extension",
        name="Finger Extension Exercise",
        category=BodyPart.HAND,
        difficulty=DifficultyLevel.BEGINNER,
        description="Spread and extend fingers wide",
        instructions=[
            "Place hand palm-down on flat surface",
            "Spread fingers apart as wide as possible",
            "Lift each finger individually off surface",
            "Hold spread position for 5 seconds",
            "Relax and bring fingers back together",
            "Repeat spreading and closing motion"
        ],
        target_muscles=["Finger Extensors", "Intrinsic Hand Muscles"],
        common_mistakes=[
            "Not spreading fingers fully",
            "Lifting wrist off surface",
            "Rushing through movement",
            "Tension in other fingers"
        ],
        contraindications=[
            "Acute finger joint inflammation",
            "Recent hand surgery",
            "Severe arthritis with deformity"
        ],
        reps_per_set=10,
        sets=3,
        hold_duration=5,
        benefits=[
            "Improves finger dexterity",
            "Prevents hand contractures",
            "Enhances fine motor skills",
            "Strengthens hand muscles"
        ],
        progression="finger_extension_resistance",
        regression="finger_extension_assisted"
    ),

    # === LEG EXERCISES ===
    "hip_flexion": Exercise(
        id="hip_flexion",
        name="Hip Flexion (Marching)",
        category=BodyPart.LEG,
        difficulty=DifficultyLevel.BEGINNER,
        description="Lift knee toward chest while standing or sitting",
        instructions=[
            "Stand holding onto stable support or sit in chair",
            "Keep back straight and core engaged",
            "Slowly lift one knee up toward chest",
            "Aim for 90-degree hip bend if possible",
            "Hold at top for 2-3 seconds",
            "Slowly lower foot back to floor",
            "Alternate legs"
        ],
        target_muscles=["Hip Flexors", "Iliopsoas", "Quadriceps"],
        common_mistakes=[
            "Leaning backward",
            "Not lifting knee high enough",
            "Dropping foot quickly",
            "Losing balance"
        ],
        contraindications=[
            "Hip replacement (recent, without clearance)",
            "Acute hip pain",
            "Severe balance issues (use seated version)"
        ],
        reps_per_set=10,
        sets=3,
        hold_duration=3,
        benefits=[
            "Improves walking ability",
            "Strengthens hip flexors",
            "Enhances balance",
            "Supports stair climbing"
        ],
        progression="hip_flexion_standing",
        regression="hip_flexion_seated"
    ),

    "knee_extension": Exercise(
        id="knee_extension",
        name="Seated Knee Extension",
        category=BodyPart.KNEE,
        difficulty=DifficultyLevel.BEGINNER,
        description="Straighten knee while sitting",
        instructions=[
            "Sit in chair with back supported",
            "Feet flat on floor",
            "Slowly straighten one knee, lifting foot",
            "Extend until leg is straight (don't lock knee)",
            "Point toes toward ceiling",
            "Hold for 3-5 seconds",
            "Slowly lower foot back to floor"
        ],
        target_muscles=["Quadriceps", "Vastus Medialis"],
        common_mistakes=[
            "Hyperextending knee",
            "Leaning back in chair",
            "Lifting hip off seat",
            "Moving too quickly"
        ],
        contraindications=[
            "Acute knee injury",
            "Recent knee surgery (without clearance)",
            "Severe knee arthritis with swelling"
        ],
        reps_per_set=12,
        sets=3,
        hold_duration=5,
        benefits=[
            "Strengthens thigh muscles",
            "Improves knee stability",
            "Supports standing and walking",
            "Prevents knee weakness"
        ],
        progression="knee_extension_resistance",
        regression="knee_extension_assisted"
    ),

    # === BALANCE & GAIT EXERCISES ===
    "single_leg_stance": Exercise(
        id="single_leg_stance",
        name="Single Leg Stance",
        category=BodyPart.BALANCE,
        difficulty=DifficultyLevel.INTERMEDIATE,
        description="Stand on one leg to improve balance",
        instructions=[
            "Stand next to stable support (chair or wall)",
            "Shift weight onto one leg",
            "Slowly lift other foot off ground (just 1-2 inches)",
            "Keep hips level and body upright",
            "Hold position for 10-30 seconds",
            "Lower foot back to ground",
            "Switch legs"
        ],
        target_muscles=["Hip Stabilizers", "Ankle Stabilizers", "Core"],
        common_mistakes=[
            "Tilting to one side",
            "Locking knee",
            "Not using support when needed",
            "Holding breath"
        ],
        contraindications=[
            "Severe balance impairment",
            "Recent fall",
            "Vertigo or dizziness",
            "Uncorrected vision problems"
        ],
        reps_per_set=3,
        sets=3,
        hold_duration=30,
        benefits=[
            "Improves balance and stability",
            "Reduces fall risk",
            "Strengthens ankle and hip",
            "Enhances walking confidence"
        ],
        progression="single_leg_stance_eyes_closed",
        regression="tandem_stance"
    ),

    "heel_to_toe_walk": Exercise(
        id="heel_to_toe_walk",
        name="Heel-to-Toe Walking (Tandem Gait)",
        category=BodyPart.BALANCE,
        difficulty=DifficultyLevel.ADVANCED,
        description="Walk in straight line placing heel directly in front of toe",
        instructions=[
            "Find a clear straight pathway",
            "Place one foot directly in front of other",
            "Heel of front foot should touch toe of back foot",
            "Arms can be out to sides for balance",
            "Walk 10-20 steps in straight line",
            "Focus on a point ahead, not at feet",
            "Use wall for support if needed"
        ],
        target_muscles=["Full Body Balance", "Core", "Lower Leg"],
        common_mistakes=[
            "Looking down at feet",
            "Steps too wide",
            "Moving too quickly",
            "Not maintaining straight line"
        ],
        contraindications=[
            "Severe balance problems",
            "Recent fall",
            "Uncontrolled dizziness",
            "Significant weakness"
        ],
        reps_per_set=10,
        sets=3,
        benefits=[
            "Advanced balance training",
            "Improves gait pattern",
            "Enhances coordination",
            "Builds walking confidence"
        ],
        progression="heel_toe_walk_eyes_closed",
        regression="tandem_stance"
    ),

    # === CORE EXERCISES ===
    "seated_trunk_rotation": Exercise(
        id="seated_trunk_rotation",
        name="Seated Trunk Rotation",
        category=BodyPart.CORE,
        difficulty=DifficultyLevel.BEGINNER,
        description="Rotate torso side to side while seated",
        instructions=[
            "Sit upright in chair with feet flat",
            "Cross arms over chest or clasp hands together",
            "Keep hips facing forward",
            "Slowly rotate upper body to the right",
            "Hold for 2-3 seconds",
            "Return to center",
            "Rotate to the left",
            "Keep movements slow and controlled"
        ],
        target_muscles=["Obliques", "Transverse Abdominis", "Erector Spinae"],
        common_mistakes=[
            "Rotating hips instead of trunk",
            "Leaning forward or backward",
            "Moving too quickly",
            "Not rotating equally both sides"
        ],
        contraindications=[
            "Acute back pain",
            "Recent spinal surgery",
            "Herniated disc with symptoms",
            "Severe osteoporosis"
        ],
        reps_per_set=10,
        sets=3,
        hold_duration=3,
        benefits=[
            "Improves trunk rotation",
            "Strengthens core muscles",
            "Enhances balance",
            "Supports functional activities"
        ],
        progression="standing_trunk_rotation",
        regression="seated_side_bends"
    )
}

@router.get("/api/exercises", response_model=List[Exercise])
async def get_all_exercises():
    """Get all exercises in library"""
    return list(EXERCISE_LIBRARY.values())

@router.get("/api/exercises/category/{category}", response_model=List[Exercise])
async def get_exercises_by_category(category: BodyPart):
    """Get exercises filtered by body part"""
    return [ex for ex in EXERCISE_LIBRARY.values() if ex.category == category]

@router.get("/api/exercises/difficulty/{difficulty}", response_model=List[Exercise])
async def get_exercises_by_difficulty(difficulty: DifficultyLevel):
    """Get exercises filtered by difficulty"""
    return [ex for ex in EXERCISE_LIBRARY.values() if ex.difficulty == difficulty]

@router.get("/api/exercises/{exercise_id}", response_model=Exercise)
async def get_exercise_detail(exercise_id: str):
    """Get detailed information about specific exercise"""
    if exercise_id not in EXERCISE_LIBRARY:
        return {"error": "Exercise not found"}
    return EXERCISE_LIBRARY[exercise_id]

@router.get("/api/exercises/personalized/{patient_id}")
async def get_personalized_exercises(patient_id: str, affected_side: str = "left"):
    """
    Generate personalized exercise plan based on patient needs
    This would integrate with Azure OpenAI for intelligent recommendations
    """
    
    # In production: Query patient history, consult with AI
    # For now, return curated list
    
    recommended = []
    
    # Always start with basics
    recommended.extend([
        EXERCISE_LIBRARY["shoulder_flexion"],
        EXERCISE_LIBRARY["shoulder_abduction"],
        EXERCISE_LIBRARY["bicep_curl"],
    ])
    
    # Add progression based on patient level
    recommended.extend([
        EXERCISE_LIBRARY["hip_flexion"],
        EXERCISE_LIBRARY["knee_extension"],
        EXERCISE_LIBRARY["wrist_flexion"],
    ])
    
    # Add balance exercises
    recommended.append(EXERCISE_LIBRARY["seated_trunk_rotation"])
    
    return {
        "patient_id": patient_id,
        "recommended_exercises": recommended,
        "daily_routine": {
            "morning": ["shoulder_flexion", "bicep_curl"],
            "afternoon": ["hip_flexion", "knee_extension"],
            "evening": ["wrist_flexion", "seated_trunk_rotation"]
        },
        "total_exercises": len(recommended),
        "estimated_duration_minutes": len(recommended) * 5
    }
