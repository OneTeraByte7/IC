import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

/**
 * AI Holographic Coach Avatar
 * 3D avatar that demonstrates exercises and provides real-time coaching
 * INNOVATION: Interactive AI physical therapist with voice and visual guidance
 */

const AICoachAvatar = ({ 
  exerciseType = 'arm_raise',
  isPlaying = false,
  landmarks = null,
  onCoachingMessage 
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const avatarRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('idle'); // idle, demo, mirror

  // Memoize the coaching callback to prevent infinite loops
  const coachingCallback = useCallback((message) => {
    if (onCoachingMessage && !isMuted) {
      onCoachingMessage(message);
    }
  }, [onCoachingMessage, isMuted]);

  // Exercise animation sequences
  const EXERCISE_ANIMATIONS = {
    arm_raise: {
      name: "Arm Raise",
      keyframes: [
        { time: 0, positions: { leftArm: 0, rightArm: 0 } },
        { time: 2000, positions: { leftArm: 90, rightArm: 90 } },
        { time: 4000, positions: { leftArm: 0, rightArm: 0 } },
      ],
      instructions: [
        { time: 0, message: "Let's start with arm raises. Follow my movement." },
        { time: 1000, message: "Slowly lift both arms to shoulder height." },
        { time: 2500, message: "Hold this position for a moment." },
        { time: 3000, message: "Now slowly lower your arms back down." },
      ]
    },
    knee_extension: {
      name: "Knee Extension",
      keyframes: [
        { time: 0, positions: { leftLeg: 90, rightLeg: 90 } },
        { time: 2000, positions: { leftLeg: 180, rightLeg: 90 } },
        { time: 4000, positions: { leftLeg: 90, rightLeg: 90 } },
      ],
      instructions: [
        { time: 0, message: "Let's practice knee extensions. Sit comfortably." },
        { time: 1000, message: "Slowly extend your left leg straight out." },
        { time: 2500, message: "Hold with your leg fully extended." },
        { time: 3000, message: "Now slowly lower your leg back down." },
      ]
    },
    shoulder_rotation: {
      name: "Shoulder Rotation",
      keyframes: [
        { time: 0, positions: { leftShoulder: 0, rightShoulder: 0 } },
        { time: 1500, positions: { leftShoulder: 180, rightShoulder: -180 } },
        { time: 3000, positions: { leftShoulder: 0, rightShoulder: 0 } },
      ],
      instructions: [
        { time: 0, message: "Now let's work on shoulder rotation." },
        { time: 1000, message: "Rotate your shoulders in a circular motion." },
        { time: 2000, message: "Keep the movement smooth and controlled." },
      ]
    },
    leg_extension: {
      name: "Leg Extension",
      keyframes: [
        { time: 0, positions: { leftLeg: 0, rightLeg: 0 } },
        { time: 2000, positions: { leftLeg: 45, rightLeg: 0 } },
        { time: 4000, positions: { leftLeg: 0, rightLeg: 45 } },
        { time: 6000, positions: { leftLeg: 0, rightLeg: 0 } },
      ],
      instructions: [
        { time: 0, message: "Time for leg extensions." },
        { time: 1500, message: "Extend your left leg forward." },
        { time: 3500, message: "Now extend your right leg." },
        { time: 5000, message: "Excellent! Back to starting position." },
      ]
    }
  };

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Dark blue background
    sceneRef.current = scene;

    // Lighting for holographic effect
    const ambientLight = new THREE.AmbientLight(0x00ffff, 0.5);
    scene.add(ambientLight);

    // Rim light for holographic glow
    const rimLight1 = new THREE.DirectionalLight(0x00ffff, 0.8);
    rimLight1.position.set(-5, 5, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0x0088ff, 0.6);
    rimLight2.position.set(5, 3, 5);
    scene.add(rimLight2);

    // Holographic spotlight
    const spotlight = new THREE.SpotLight(0x00ffff, 1);
    spotlight.position.set(0, 10, 0);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.5;
    scene.add(spotlight);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create avatar
    createAvatar(scene);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Gentle breathing animation (always animate, exercise animation will override)
      if (avatarRef.current) {
        const time = Date.now() * 0.001;
        avatarRef.current.position.y = Math.sin(time * 2) * 0.02;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  // Create stylized avatar
  const createAvatar = (scene) => {
    const avatarGroup = new THREE.Group();

    // Holographic material
    const holographicMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });

    // Head
    const headGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const head = new THREE.Mesh(headGeometry, holographicMaterial);
    head.position.y = 1.5;
    avatarGroup.add(head);

    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.7, 8);
    const torso = new THREE.Mesh(torsoGeometry, holographicMaterial);
    torso.position.y = 0.8;
    avatarGroup.add(torso);

    // Arms (will be animated)
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
    
    const leftArm = new THREE.Mesh(armGeometry, holographicMaterial);
    leftArm.position.set(-0.3, 1.0, 0);
    leftArm.name = 'leftArm';
    avatarGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, holographicMaterial);
    rightArm.position.set(0.3, 1.0, 0);
    rightArm.name = 'rightArm';
    avatarGroup.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    
    const leftLeg = new THREE.Mesh(legGeometry, holographicMaterial);
    leftLeg.position.set(-0.1, 0.1, 0);
    leftLeg.name = 'leftLeg';
    avatarGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, holographicMaterial);
    rightLeg.position.set(0.1, 0.1, 0);
    rightLeg.name = 'rightLeg';
    avatarGroup.add(rightLeg);

    // Add holographic grid effect
    const gridGeometry = new THREE.PlaneGeometry(2, 3, 20, 30);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    grid.position.z = -0.5;
    avatarGroup.add(grid);

    scene.add(avatarGroup);
    avatarRef.current = avatarGroup;
  };

  // Play exercise animation
  useEffect(() => {
    if (!isPlaying || !avatarRef.current) {
      // Cleanup animation when stopped
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animation = EXERCISE_ANIMATIONS[exerciseType];
    if (!animation) return;

    const startTime = Date.now();
    const instructionShown = useRef(new Set());

    const animateExercise = () => {
      if (!avatarRef.current || !isPlaying) return;

      const elapsed = Date.now() - startTime;
      const totalDuration = animation.keyframes[animation.keyframes.length - 1].time;
      const loopTime = elapsed % totalDuration;

      // Find current keyframe
      let currentKeyframe = animation.keyframes[0];
      let nextKeyframe = animation.keyframes[1];

      for (let i = 0; i < animation.keyframes.length - 1; i++) {
        if (loopTime >= animation.keyframes[i].time && loopTime < animation.keyframes[i + 1].time) {
          currentKeyframe = animation.keyframes[i];
          nextKeyframe = animation.keyframes[i + 1];
          break;
        }
      }

      // Interpolate between keyframes
      const segmentProgress = (loopTime - currentKeyframe.time) / (nextKeyframe.time - currentKeyframe.time);
      
      // Update arm positions
      if (currentKeyframe.positions.leftArm !== undefined) {
        const leftArm = avatarRef.current.getObjectByName('leftArm');
        const rightArm = avatarRef.current.getObjectByName('rightArm');
        
        if (leftArm && rightArm) {
          const leftAngle = THREE.MathUtils.lerp(
            currentKeyframe.positions.leftArm,
            nextKeyframe.positions.leftArm,
            segmentProgress
          );
          const rightAngle = THREE.MathUtils.lerp(
            currentKeyframe.positions.rightArm,
            nextKeyframe.positions.rightArm,
            segmentProgress
          );
          
          leftArm.rotation.z = THREE.MathUtils.degToRad(leftAngle);
          rightArm.rotation.z = THREE.MathUtils.degToRad(-rightAngle);
        }
      }

      // Show coaching instructions (once per loop)
      for (let i = 0; i < animation.instructions.length; i++) {
        const instruction = animation.instructions[i];
        const instructionKey = `${Math.floor(elapsed / totalDuration)}_${i}`;
        if (loopTime >= instruction.time && !instructionShown.current.has(instructionKey)) {
          instructionShown.current.add(instructionKey);
          coachingCallback(instruction.message);
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 2000);
        }
      }

      // Clear shown instructions on loop reset
      if (loopTime < 100) {
        instructionShown.current.clear();
      }

      animationRef.current = requestAnimationFrame(animateExercise);
    };

    animateExercise();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, exerciseType, coachingCallback]);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950" />

      {/* Avatar Status */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-500/50'}`} />
          <span className="text-cyan-300 text-sm font-medium">
            {currentPhase === 'demo' ? 'Demonstrating Exercise' : 'AI Coach Ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-lg transition-all ${
            isMuted 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          } hover:bg-opacity-30 backdrop-blur-md`}
          title={isMuted ? 'Unmute Coach' : 'Mute Coach'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Exercise Info */}
      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md px-4 py-3 rounded-lg border border-cyan-500/30">
        <h3 className="text-cyan-300 font-medium text-sm mb-1">
          {EXERCISE_ANIMATIONS[exerciseType]?.name || 'Ready'}
        </h3>
        <p className="text-cyan-400/70 text-xs">
          Watch the holographic coach and mirror the movements
        </p>
      </div>

      {/* Holographic Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-blue-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      </div>
    </div>
  );
};

export default AICoachAvatar;
