import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260912_104036_bd6924f6-3c8e-417e-8465-6d03c8c2e9e6.mp4';
const POSTER_SRC =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/82e7eb75-c65f-490a-99b5-f3d1cad54200.webp';

export default function SellixHeroVideo() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const v1 = document.getElementById('bg-video-1') as HTMLVideoElement | null;
    const v2 = document.getElementById('bg-video-2') as HTMLVideoElement | null;
    if (!v1 || !v2) return;

    let activeVideo: HTMLVideoElement = v1;
    let inactiveVideo: HTMLVideoElement = v2;
    let isCrossfading = false;
    const CROSSFADE_WINDOW = 1.35; // seconds before end to crossfade

    function prepare(v: HTMLVideoElement) {
      v.muted = true;
      v.playsInline = true;
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
    }

    prepare(v1);
    prepare(v2);

    function tryPlay(v: HTMLVideoElement) {
      const p = v.play();
      if (p !== undefined) {
        p.catch(() => {
          function unlock() {
            v.play().catch(() => {});
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
          }
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
        inactiveVideo.currentTime = 0;

        const playPromise = inactiveVideo.play();
        const performFade = () => {
          inactiveVideo.classList.add('active');
          activeVideo.classList.remove('active');

          setTimeout(() => {
            activeVideo.pause();
            activeVideo.currentTime = 0;
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

    v1.addEventListener('timeupdate', checkCrossfade);
    v2.addEventListener('timeupdate', checkCrossfade);

    const handleVisibility = () => {
      if (!document.hidden && activeVideo) {
        activeVideo.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      v1.removeEventListener('timeupdate', checkCrossfade);
      v2.removeEventListener('timeupdate', checkCrossfade);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (Platform.OS === 'web') {
    return (
      <div className="video-viewport" aria-hidden="true">
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
