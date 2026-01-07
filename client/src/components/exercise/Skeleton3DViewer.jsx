import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * 3D Skeleton Visualization Component
 * Converts 2D pose landmarks into interactive 3D skeletal model
 * INNOVATION: Real-time 3D reconstruction from single webcam
 */

const Skeleton3DViewer = ({ landmarks, isActive = true }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const skeletonRef = useRef(null);
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'front', 'side', 'top'

  // MediaPipe pose landmark connections
  const POSE_CONNECTIONS = [
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [11, 23], [12, 24], // Torso
    [23, 24], // Hips
    [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
    [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
    [15, 17], [15, 19], [15, 21], // Left hand
    [16, 18], [16, 20], [16, 22], // Right hand
  ];

  // Joint colors based on quality
  const getJointColor = (landmark) => {
    if (!landmark || !landmark.visibility) return 0xff0000;
    const visibility = landmark.visibility;
    if (visibility > 0.8) return 0x00ff00; // Green - excellent
    if (visibility > 0.6) return 0xffff00; // Yellow - good
    return 0xff9900; // Orange - needs improvement
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Add spotlight for dramatic effect
    const spotlight = new THREE.SpotLight(0x00ffff, 0.5);
    spotlight.position.set(0, 10, 0);
    scene.add(spotlight);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controlsRef.current = controls;

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      if (controlsRef.current) controlsRef.current.dispose();
    };
  }, []);

  // Update skeleton based on landmarks
  useEffect(() => {
    if (!landmarks || !sceneRef.current || !isActive) return;

    // Remove old skeleton
    if (skeletonRef.current) {
      sceneRef.current.remove(skeletonRef.current);
    }

    // Create new skeleton group
    const skeletonGroup = new THREE.Group();

    // Convert 2D landmarks to 3D coordinates
    const convertTo3D = (landmark, index) => {
      // MediaPipe provides x, y (0-1), and z (depth)
      // Convert to Three.js coordinate system
      const x = (landmark.x - 0.5) * 2; // Center around 0
      const y = -(landmark.y - 0.5) * 2; // Flip Y axis
      const z = landmark.z || 0; // Use depth if available
      return new THREE.Vector3(x, y, z);
    };

    // Draw joints (spheres)
    landmarks.forEach((landmark, index) => {
      const position = convertTo3D(landmark, index);
      const geometry = new THREE.SphereGeometry(0.03, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: getJointColor(landmark),
        emissive: getJointColor(landmark),
        emissiveIntensity: 0.3,
      });
      const joint = new THREE.Mesh(geometry, material);
      joint.position.copy(position);
      skeletonGroup.add(joint);
    });

    // Draw bones (lines)
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      if (landmarks[startIdx] && landmarks[endIdx]) {
        const start = convertTo3D(landmarks[startIdx], startIdx);
        const end = convertTo3D(landmarks[endIdx], endIdx);
        
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          linewidth: 2,
        });
        const line = new THREE.Line(geometry, material);
        skeletonGroup.add(line);

        // Add cylinder for better visualization
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const cylinderGeometry = new THREE.CylinderGeometry(0.015, 0.015, length, 8);
        const cylinderMaterial = new THREE.MeshPhongMaterial({
          color: 0x00aaff,
          transparent: true,
          opacity: 0.7,
        });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        
        cylinder.position.copy(start.clone().add(direction.multiplyScalar(0.5)));
        cylinder.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction.clone().normalize()
        );
        skeletonGroup.add(cylinder);
      }
    });

    sceneRef.current.add(skeletonGroup);
    skeletonRef.current = skeletonGroup;
  }, [landmarks, isActive]);

  // Handle view mode changes
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    switch (viewMode) {
      case 'front':
        cameraRef.current.position.set(0, 0, 3);
        controlsRef.current.target.set(0, 0, 0);
        break;
      case 'side':
        cameraRef.current.position.set(3, 0, 0);
        controlsRef.current.target.set(0, 0, 0);
        break;
      case 'top':
        cameraRef.current.position.set(0, 3, 0);
        controlsRef.current.target.set(0, 0, 0);
        break;
      default:
        cameraRef.current.position.set(2, 1, 3);
        controlsRef.current.target.set(0, 0, 0);
    }
    controlsRef.current.update();
  }, [viewMode]);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" />

      {/* View Mode Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setViewMode('3d')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            viewMode === '3d'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
        >
          3D View
        </button>
        <button
          onClick={() => setViewMode('front')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'front'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Front
        </button>
        <button
          onClick={() => setViewMode('side')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'side'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Side
        </button>
        <button
          onClick={() => setViewMode('top')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'top'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Top
        </button>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-lg">
        <p className="text-xs text-gray-400">
          💡 Drag to rotate • Scroll to zoom • Right-click to pan
        </p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm px-4 py-3 rounded-lg space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-300">Excellent Form</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs text-gray-300">Good Form</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-300">Needs Adjustment</span>
        </div>
      </div>
    </div>
  );
};

export default Skeleton3DViewer;
