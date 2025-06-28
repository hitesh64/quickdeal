// threejs.js - Updated version
function initThreeJSBackground() {
    const container = document.createElement('div');
    container.id = 'threejs-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.1;
        pointer-events: none;
    `;
    document.body.appendChild(container);
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "low-power"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // Reduced number of items for performance
    const items = [];
    const itemTextures = [
        'https://images.unsplash.com/photo-1589927986089-35812388d1f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
    ];
    
    // Load textures and create items
    const textureLoader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(0.5, 16, 16); // Reduced geometry complexity
    
    itemTextures.forEach((texUrl, i) => {
        textureLoader.load(texUrl, (texture) => {
            const material = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true,
                opacity: 0.6
            });
            
            for (let j = 0; j < 3; j++) { // Create 3 instances of each texture
                const item = new THREE.Mesh(geometry, material);
                
                item.position.x = (Math.random() - 0.5) * 20;
                item.position.y = (Math.random() - 0.5) * 10;
                item.position.z = Math.random() * -50;
                
                item.userData = {
                    originalY: item.position.y,
                    speed: Math.random() * 0.01 + 0.005, // Slower speed
                    rotationSpeed: Math.random() * 0.01 - 0.005
                };
                
                scene.add(item);
                items.push(item);
            }
        });
    });
    
    camera.position.z = 5;
    
    // Optimized animation loop
    let lastTime = 0;
    const animate = (time) => {
        requestAnimationFrame(animate);
        
        // Throttle updates
        if (!lastTime || time - lastTime > 16) { // ~60fps
            const delta = (time - lastTime) / 1000 || 0;
            lastTime = time;
            
            items.forEach(item => {
                item.position.y = item.userData.originalY + Math.sin(time * item.userData.speed) * 1.5;
                item.rotation.x += item.userData.rotationSpeed * delta * 60;
                item.rotation.y += item.userData.rotationSpeed * delta * 60;
            });
            
            renderer.render(scene, camera);
        }
    };
    
    animate();
    
    // Efficient resize handler
    const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    
    // Cleanup function
    window.addEventListener('beforeunload', () => {
        resizeObserver.disconnect();
        renderer.dispose();
        container.remove();
    });
}