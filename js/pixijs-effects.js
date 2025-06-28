// pixijs-effects.js - Updated version
function initPixiJSEffects() {
    // Create canvas for effects
    const canvas = document.createElement('canvas');
    canvas.id = 'pixi-effects';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
    `;
    document.body.appendChild(canvas);
    
    // Initialize PixiJS with performance settings
    const app = new PIXI.Application({
        view: canvas,
        transparent: true,
        autoResize: true,
        resolution: Math.min(window.devicePixelRatio, 2),
        antialias: false,
        powerPreference: "low-power"
    });
    
    // Resize handler
    const resize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);
    resize();
    
    // Particle system with object pooling
    const particles = [];
    const particlePool = [];
    const MAX_PARTICLES = 200;
    
    const particleContainer = new PIXI.ParticleContainer(MAX_PARTICLES, {
        scale: true,
        position: true,
        rotation: true,
        alpha: true
    });
    app.stage.addChild(particleContainer);
    
    // Preload textures
    const textures = [
        PIXI.Texture.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEEjIXY8Xp9QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAADKUlEQVRYw+2Xz0sUURzHP7Oz7q6uP9ZcNc0fQYQHQ0o6dOjQH6BLhw6FdOjQHxBBhw6FdIgOQR0KIiKCCKJDaGm1uWqauqauP2Z3Z3fGQ7u6u7O6axQd+8AwM+/7/b7fz3u/9z5vYI89/kd8XgXj8TjpdJp8Po+u6+i6jqZp6LqOYRgYhoFpmliWhWVZ2LaN4zjYto3jODiOg+M4OI6Dbds4joNt29i2jWVZWJaFaZqYpolhGOi6jqZpaJqGqqqoqoqiKCiKgizLyLJMPp8nl8uRzWbJZDKk02lSqRTJZJJkMkkikSAejxOLxYhGo0QiEcLhMKFQiGAwyMbGBoFAgPX1dfx+P2tra6yurrKyssLy8jJLS0ssLi6ysLDA/Pw8c3NzzM7OMjMzw/T0NFNTU0xOTjIxMcH4+DhjY2OMjo4yMjLC8PAwQ0NDDA4OMjAwwMDAAP39/fT19dHb20tPTw/d3d10dXXR2dlJR0cH7e3ttLW10dLSQnNzM01NTTQ2NtLQ0EB9fT11dXXU1tZSU1NDdXU1VVVVVFZWUlFRQXl5OWVlZZSWllJSUkJxcTFFRUUUFhZSUFBAfn4+eXl55ObmkpOTQ3Z2NllZWWRmZpKRkUF6ejppaWmkpqaSkpJCcnIySUlJJCYmkpCQQHx8PHFxcQiCgCAI+P1+fwHw+XwEg0FCoRChUIhwOEwkEiEajRKLxYjH4yQSCZLJJKlUinQ6TSaTIZvNksvlyOfzFAoFisUipVKJcrlMpVKhWq1Sq9Wo1+s0Gg2azSatVot2u02n06Hb7dLr9ej3+wwGA4bDIaPRiPF4zGQyYTqdMpvNmM/nLBYLlsvlHwG8Xv4L4P8G+AO8dQvQxXj5JAAAAABJRU5ErkJggg=='),
        PIXI.Texture.from('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEEjMZqKq1JQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAADJklEQVRYw+2Xz0sUURzHP7Oz7q6uP9ZcNc0fQYQHQ0o6dOjQH6BLhw6FdOjQHxBBhw6FdIgOQR0KIiKCCKJDaGm1uWqauqauP2Z3Z3fGQ7u6u7O6axQd+8AwM+/7/b7fz3u/9z5vYI89/kd8XgXj8TjpdJp8Po+u6+i6jqZpaJqGYRgYhoFpmliWhWVZ2LaN4zjYto3jODiOg+M4OI6Dbds4joNt29i2jWVZWJaFaZqYpolhGOi6jqZpaJqGqqqoqoqiKCiKgizLyLJMPp8nl8uRzWbJZDKk02lSqRTJZJJkMkkikSAejxOLxYhGo0QiEcLhMKFQiGAwyMbGBoFAgPX1dfx+P2tra6yurrKyssLy8jJLS0ssLi6ysLDA/Pw8c3NzzM7OMjMzw/T0NFNTU0xOTjIxMcH4+DhjY2OMjo4yMjLC8PAwQ0NDDA4OMjAwwMDAAP39/fT19dHb20tPTw/d3d10dXXR2dlJR0cH7e3ttLW10dLSQnNzM01NTTQ2NtLQ0EB9fT11dXXU1tZSU1NDdXU1VVVVVFZWUlFRQXl5OWVlZZSWllJSUkJxcTFFRUUUFhZSUFBAfn4+eXl55ObmkpOTQ3Z2NllZWWRmZpKRkUF6ejppaWmkpqaSkpJCcnIySUlJJCYmkpCQQHx8PHFxcQiCgCAI+P1+fwHw+XwEg0FCoRChUIhwOEwkEiEajRKLxYjH4yQSCZLJJKlUinQ6TSaTIZvNksvlyOfzFAoFisUipVKJcrlMpVKhWq1Sq9VoNBo0m02azSatVot2u02n06Hb7dLr9ej3+wwGA4bDIaPRiPF4zGQyYTqdMpvNmM/nLBYLlsvlHwG8Xv4L4P8G+AO8dQvQxXj5JAAAAABJRU5ErkJggg==')
    ];
    
    // Product hover effect
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (particles.length >= MAX_PARTICLES) return;
            
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 10; i++) {
                let particle;
                if (particlePool.length > 0) {
                    particle = particlePool.pop();
                    particle.visible = true;
                    particle.alpha = 1;
                } else {
                    const texture = textures[Math.floor(Math.random() * textures.length)];
                    particle = new PIXI.Sprite(texture);
                    particle.anchor.set(0.5);
                    particleContainer.addChild(particle);
                }
                
                particle.x = centerX;
                particle.y = centerY;
                particle.scale.set(0.05 + Math.random() * 0.05);
                particle.tint = Math.random() * 0xFFFFFF;
                
                particle.speed = 1 + Math.random() * 2;
                particle.direction = Math.random() * Math.PI * 2;
                particle.rotationSpeed = Math.random() * 0.05 - 0.025;
                particle.fade = 0.01 + Math.random() * 0.02;
                
                particles.push(particle);
            }
        });
    });
    
    // Animation loop
    app.ticker.add((delta) => {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            particle.x += Math.cos(particle.direction) * particle.speed;
            particle.y += Math.sin(particle.direction) * particle.speed;
            particle.rotation += particle.rotationSpeed;
            particle.alpha -= particle.fade;
            
            if (particle.alpha <= 0) {
                particle.visible = false;
                particlePool.push(particle);
                particles.splice(i, 1);
            }
        }
    });
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        app.destroy(true);
        canvas.remove();
    });
}