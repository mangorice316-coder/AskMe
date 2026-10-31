import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4';
const POSTER_SRC =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

interface RadarRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export default function SellixHeroVideo() {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // 1. Dual-Video Seamless Looping Crossfade Engine
    const v1 = document.getElementById('bg-video-1') as HTMLVideoElement | null;
    const v2 = document.getElementById('bg-video-2') as HTMLVideoElement | null;
    let activeVideo: HTMLVideoElement | null = v1;
    let inactiveVideo: HTMLVideoElement | null = v2;
    let isCrossfading = false;
    const CROSSFADE_WINDOW = 1.35; // seconds before loop boundary

    function prepare(v: HTMLVideoElement | null) {
      if (!v) return;
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
    }
    prepare(v1);
    prepare(v2);

    function tryPlay(v: HTMLVideoElement | null) {
      if (!v) return;
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => {
          const unlock = () => {
            v.play().catch(() => {});
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
          };
          window.addEventListener('pointerdown', unlock, { once: true });
          window.addEventListener('keydown', unlock, { once: true });
        });
      }
    }
    tryPlay(v1);

    function checkCrossfade(e: Event) {
      const curr = e.target as HTMLVideoElement;
      if (curr !== activeVideo) return;
      if (!isCrossfading && curr.duration && curr.currentTime >= curr.duration - CROSSFADE_WINDOW) {
        isCrossfading = true;
        if (inactiveVideo) {
          inactiveVideo.currentTime = 0;
          const playPromise = inactiveVideo.play();
          const performFade = () => {
            inactiveVideo?.classList.add('active');
            activeVideo?.classList.remove('active');
            setTimeout(() => {
              if (activeVideo) {
                activeVideo.pause();
                activeVideo.currentTime = 0;
              }
              const temp = activeVideo;
              activeVideo = inactiveVideo;
              inactiveVideo = temp;
              isCrossfading = false;
            }, 1300);
          };
          if (playPromise !== undefined) {
            playPromise.then(performFade).catch(() => {
              isCrossfading = false;
            });
          } else {
            performFade();
          }
        }
      }
    }
    v1?.addEventListener('timeupdate', checkCrossfade);
    v2?.addEventListener('timeupdate', checkCrossfade);

    // 2. Interactive Parallax & Cursor Spotlight Engine
    const parallaxWrapper = document.getElementById('video-parallax-wrapper');
    const glowEl = document.getElementById('interactive-cursor-glow');
    const canvas = document.getElementById('interactive-bg-canvas') as HTMLCanvasElement | null;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
    };

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMouseMove = (e: MouseEvent) => {
      mouse.isHovered = true;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;

      if (!isReduced) {
        const relX = e.clientX / window.innerWidth - 0.5;
        const relY = e.clientY / window.innerHeight - 0.5;
        targetParallaxX = relX * -24;
        targetParallaxY = relY * -18;
      }

      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    const onMouseLeave = () => {
      mouse.isHovered = false;
      targetParallaxX = 0;
      targetParallaxY = 0;
      if (glowEl) glowEl.classList.remove('active');
    };

    const onMouseEnter = () => {
      mouse.isHovered = true;
      if (glowEl) glowEl.classList.add('active');
    };

    // 3. Interactive Sonar Radar Ripples on Click / Tap
    const ripples: RadarRipple[] = [];
    const triggerRipple = (clientX: number, clientY: number, color = 'rgba(255, 113, 53, ') => {
      ripples.push({
        x: clientX,
        y: clientY,
        radius: 4,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.45,
        alpha: 0.65,
        speed: 4.0,
        color,
      });
      setTimeout(() => {
        ripples.push({
          x: clientX,
          y: clientY,
          radius: 2,
          maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35,
          alpha: 0.38,
          speed: 3.0,
          color: 'rgba(255, 255, 255, ',
        });
      }, 130);
    };

    const onPointerDown = (e: PointerEvent) => {
      triggerRipple(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // 4. Interactive Civic Constellation Setup
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 26 : 52;

    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (ctx) ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      particles = [];
      const colors = ['#ffffff', '#ffffff', '#FF7135', '#38D982', '#ffffff'];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const baseAlpha = 0.25 + Math.random() * 0.55;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          radius: 0.8 + Math.random() * 1.5,
          baseAlpha,
          alpha: baseAlpha,
          color: colors[Math.floor(Math.random() * colors.length)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.025,
        });
      }
    };

    resizeCanvas();
    initParticles();
    const onResize = () => {
      resizeCanvas();
      initParticles();
    };
    window.addEventListener('resize', onResize);

    // 5. High-Performance 120fps Animation Loop
    let animId: number;
    let isVisible = true;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Parallax smooth interpolation
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.07;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.07;

      if (parallaxWrapper && !isReduced) {
        parallaxWrapper.style.transform = `translate3d(${currentParallaxX.toFixed(2)}px, ${currentParallaxY.toFixed(2)}px, 0)`;
      }

      // Cursor spotlight smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      if (glowEl && mouse.isHovered) {
        glowEl.style.background = `radial-gradient(550px circle at ${mouse.x.toFixed(1)}px ${mouse.y.toFixed(1)}px, rgba(255, 113, 53, 0.11), rgba(255, 255, 255, 0.02) 42%, transparent 75%)`;
        if (!glowEl.classList.contains('active')) glowEl.classList.add('active');
      }

      // Canvas Rendering
      if (ctx && canvas) {
        ctx.clearRect(0, 0, width, height);

        // Radar Ripples
        for (let r = ripples.length - 1; r >= 0; r--) {
          const rip = ripples[r];
          rip.radius += rip.speed;
          rip.alpha = (1 - rip.radius / rip.maxRadius) * 0.65;
          if (rip.radius >= rip.maxRadius || rip.alpha <= 0.01) {
            ripples.splice(r, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `${rip.color}${rip.alpha.toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Outer echo ring
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius * 0.85, 0, Math.PI * 2);
          ctx.strokeStyle = `${rip.color}${(rip.alpha * 0.35).toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Constellation Particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.pulse += p.pulseSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.pulse) * 0.18;

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -20) p.x = width + 20;
          else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          else if (p.y > height + 20) p.y = -20;

          // Mouse magnetic interaction & connection tracer
          if (mouse.isHovered) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const PROXIMITY = 160;

            if (dist < PROXIMITY) {
              const force = (PROXIMITY - dist) / PROXIMITY;
              p.x += (dx / dist) * force * 1.8;
              p.y += (dy / dist) * force * 1.8;

              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = `rgba(255, 113, 53, ${(force * 0.28).toFixed(3)})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }

          // Node-to-node constellation lines
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const MAX_LINE_DIST = 105;

            if (dist < MAX_LINE_DIST) {
              const lineAlpha = (1 - dist / MAX_LINE_DIST) * 0.15;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha.toFixed(3)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }

          // Particle node
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (!document.hidden && activeVideo) {
        activeVideo.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibility);
      v1?.removeEventListener('timeupdate', checkCrossfade);
      v2?.removeEventListener('timeupdate', checkCrossfade);
    };
  }, []);

  if (Platform.OS === 'web') {
    return (
      <div className="video-viewport" aria-hidden="true" ref={containerRef}>
        {/* 3D Parallax Video Wrapper */}
        <div className="video-parallax-wrapper" id="video-parallax-wrapper">
          <video
            id="bg-video-1"
            className="video-layer active"
            muted
            playsInline
            autoPlay
            preload="auto"
            poster={POSTER_SRC}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>

          <video
            id="bg-video-2"
            className="video-layer"
            muted
            playsInline
            preload="auto"
            poster={POSTER_SRC}
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        </div>

        {/* Interactive Dynamic Cursor Glow Spotlight */}
        <div id="interactive-cursor-glow" className="interactive-cursor-glow" />

        {/* Interactive Civic Constellation & Sonar Radar Canvas */}
        <canvas id="interactive-bg-canvas" className="interactive-bg-canvas" />

        {/* Cinematic Sellix Vignette Overlay */}
        <div className="video-vignette" />
      </div>
    );
  }

  // Native fallback
  return (
    <View style={styles.nativeContainer} pointerEvents="none">
      <Image
        source={{ uri: POSTER_SRC }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.nativeOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  nativeOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
});
