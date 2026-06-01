/**
 * Advanced Pro Portfolio
 * Modular architecture with separated concerns
 * Audio & Video properly isolated to prevent conflicts
 */

console.log("[v0] Pro Portfolio v2.0 - Initializing...");

// ===== Configuration =====
const CONFIG = {
  performanceMode: window.innerWidth < 768,
  enableCursor: !('ontouchstart' in window),
  videoEnabled: true,
  audioEnabled: true,
  debugMode: false,
};

// ===== Module System =====
const Modules = {
  active: new Set(),
  
  register(name, module) {
    this.active.add(name);
    return module;
  },

  log(name, message) {
    if (CONFIG.debugMode) {
      console.log(`[${name}] ${message}`);
    }
  }
};

// ===== Performance Monitor =====
const perfStart = performance.now();

// ===== Cursor System =====
const CursorSystem = Modules.register('cursor', {
  large: document.querySelector('.cursor--large'),
  small: document.querySelector('.cursor--small'),
  mouse: { x: -100, y: -100 },
  isStuck: false,
  originalSize: { width: 0, height: 0 },

  init() {
    if (!CONFIG.enableCursor) {
      document.body.classList.add('show-cursor');
      return;
    }

    this.originalSize = {
      width: this.large.offsetWidth,
      height: this.large.offsetHeight,
    };

    this.setupEventListeners();
    this.animate();
    this.setupHoverTargets();
  },

  setupEventListeners() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    document.addEventListener('mousedown', () => {
      gsap.to(this.small, { duration: 0.15, scale: 1.5 });
    });

    document.addEventListener('mouseup', () => {
      gsap.to(this.small, { duration: 0.15, scale: 1 });
    });

    // Toggle cursor with 'c' key
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'c') {
        document.body.classList.toggle('show-cursor');
      }
    });
  },

  animate() {
    gsap.set(this.small, { x: this.mouse.x, y: this.mouse.y });

    if (!this.isStuck) {
      gsap.to(this.large, {
        duration: 0.16,
        x: this.mouse.x - this.originalSize.width / 2,
        y: this.mouse.y - this.originalSize.height / 2,
        overwrite: 'auto',
      });
    }

    requestAnimationFrame(() => this.animate());
  },

  setupHoverTargets() {
    const hoverElements = document.querySelectorAll(
      '.social-link, .btn, .nav-item, .music-btn, .project-link, .theme-toggle'
    );

    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', (e) => this.handleHoverIn(e));
      el.addEventListener('mouseleave', () => this.handleHoverOut());
    });
  },

  handleHoverIn(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    this.isStuck = true;
    gsap.to(this.large, {
      duration: 0.2,
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      borderRadius: 8,
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
    });
  },

  handleHoverOut() {
    this.isStuck = false;
    gsap.to(this.large, {
      duration: 0.2,
      width: this.originalSize.width,
      height: this.originalSize.height,
      borderRadius: '50%',
      backgroundColor: 'transparent',
      boxShadow: 'inset 0 0 12px rgba(59, 130, 246, 0.2)',
    });
  },
});

// ===== Overlay System (Load Screen) =====
const OverlaySystem = Modules.register('overlay', {
  overlay: document.getElementById('overlay'),
  startBtn: document.getElementById('startBtn'),
  progressBar: document.getElementById('progressBar'),
  isEntered: false,

  init() {
    this.startBtn.addEventListener('click', () => this.enter());
    this.animateProgressBar();

    // Auto-enter after delay for demo
    setTimeout(() => {
      if (!this.isEntered) {
        this.enter();
      }
    }, 5000);
  },

  animateProgressBar() {
    gsap.fromTo(
      this.progressBar,
      { width: '0%' },
      { width: '100%', duration: 4.5, ease: 'power1.inOut' }
    );
  },

  enter() {
    if (this.isEntered) return;
    this.isEntered = true;

    gsap.to(this.overlay, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        this.overlay.classList.add('hide');
        VideoSystem.start();
        window.dispatchEvent(new CustomEvent('portfolioEntered'));
      },
    });
  },
});

// ===== Video System (Background Videos Only) =====
const VideoSystem = Modules.register('video', {
  videos: Array.from(document.querySelectorAll('.bg-video')),
  currentIndex: 0,

  init() {
    if (!CONFIG.videoEnabled) return;

    this.videos.forEach((video) => {
      video.addEventListener('ended', () => this.nextVideo());
      video.addEventListener('error', (e) => {
        Modules.log('VideoSystem', `Video error: ${e.target.src}`);
      });
    });
  },

  start() {
    this.showVideo(0);
    const video = this.videos[0];
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        Modules.log('VideoSystem', `Autoplay blocked: ${error.name}`);
      });
    }
  },

  showVideo(index) {
    this.videos.forEach((video, i) => {
      if (i === index) {
        video.classList.add('active');
      } else {
        video.classList.remove('active');
        video.pause();
        video.currentTime = 0;
      }
    });
    this.currentIndex = index;
  },

  nextVideo() {
    const nextIndex = (this.currentIndex + 1) % this.videos.length;
    this.showVideo(nextIndex);
    
    const video = this.videos[nextIndex];
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        Modules.log('VideoSystem', `Video playback failed: ${error.name}`);
      });
    }
  },
});

// ===== Audio System (Separate from Video) =====
const AudioSystem = Modules.register('audio', {
  audio: document.getElementById('bgAudio'),
  musicBtn: document.getElementById('musicToggle'),
  isPlaying: false,
  
  // Your audio source here
  audioSrc: 'https://cdn.discordapp.com/attachments/1133001504614252664/1162213280937418844/x2mate.com_-_-_Mostafa_Elnesr_-_ANA_Z3LTK_Official_Audio_128_kbps.mp3?ex=653b1e77&is=6528a977&hm=c7171d8afd9fdac97c725a7d6544817fdbca305da3c9b63e0e64f40455c5cb1b&',

  init() {
    if (!CONFIG.audioEnabled) return;

    // Set audio properties
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';
    
    // Set the audio source
    this.audio.src = this.audioSrc;

    // Event listeners
    this.musicBtn.addEventListener('click', () => this.toggle());
    this.audio.addEventListener('play', () => this.updateUI(true));
    this.audio.addEventListener('pause', () => this.updateUI(false));
    this.audio.addEventListener('error', (e) => {
      Modules.log('AudioSystem', `Audio error: ${e.target.error?.message}`);
    });

    Modules.log('AudioSystem', 'Audio system initialized');
  },

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },

  play() {
    const playPromise = this.audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          Modules.log('AudioSystem', 'Audio playing');
          this.updateUI(true);
        })
        .catch((error) => {
          Modules.log('AudioSystem', `Playback failed: ${error.name}`);
          // Try with user gesture
          this.setupUserGesturePlayback();
        });
    }
  },

  pause() {
    this.audio.pause();
    this.updateUI(false);
    Modules.log('AudioSystem', 'Audio paused');
  },

  updateUI(playing) {
    this.isPlaying = playing;
    const icon = this.musicBtn.querySelector('i');
    
    if (playing) {
      icon.classList.remove('fa-compact-disc');
      icon.classList.add('fa-pause');
      this.musicBtn.setAttribute('aria-pressed', 'true');
    } else {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-compact-disc');
      this.musicBtn.setAttribute('aria-pressed', 'false');
    }
  },

  setupUserGesturePlayback() {
    // Setup for first user interaction if autoplay fails
    const startPlayback = () => {
      this.play();
      document.removeEventListener('click', startPlayback);
    };
    document.addEventListener('click', startPlayback);
  },
});

// ===== Clock System =====
const ClockSystem = Modules.register('clock', {
  display: document.getElementById('timeDisplay'),

  init() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  },

  updateTime() {
    const now = new Date();
    const options = {
      timeZone: 'Africa/Cairo',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    };
    const time = now.toLocaleTimeString('en-US', options);
    this.display.textContent = time;
  },
});

// ===== Scroll Animations =====
const ScrollAnimations = Modules.register('scroll', {
  init() {
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections
    document.querySelectorAll('.section').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Animate project cards
    document.querySelectorAll('.project-card').forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Animate timeline items
    document.querySelectorAll('.timeline-item').forEach((item, index) => {
      gsap.fromTo(
        item,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  },
});

// ===== Navigation System =====
const NavigationSystem = Modules.register('navigation', {
  navItems: document.querySelectorAll('.nav-item'),

  init() {
    this.navItems.forEach((item) => {
      item.addEventListener('click', (e) => this.handleNavClick(e));
    });
  },

  handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  },
});

// ===== Contact System =====
const ContactSystem = Modules.register('contact', {
  init() {
    // Email button
    const emailBtn = document.querySelector('a[href^="mailto:"]');
    if (emailBtn) {
      emailBtn.addEventListener('click', (e) => {
        Modules.log('ContactSystem', 'Email link clicked');
      });
    }
  },
});

// ===== Theme System =====
const ThemeSystem = Modules.register('theme', {
  toggle: document.getElementById('themeToggle'),
  currentTheme: 'dark',

  init() {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = prefersDark ? 'dark' : 'light';

    this.toggle.addEventListener('click', () => this.toggleTheme());
    Modules.log('ThemeSystem', `Initial theme: ${this.currentTheme}`);
  },

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.style.colorScheme = this.currentTheme;
    Modules.log('ThemeSystem', `Theme changed to: ${this.currentTheme}`);
  },
});

// ===== Footer System =====
const FooterSystem = Modules.register('footer', {
  init() {
    const yearElement = document.getElementById('footerYear');
    if (yearElement) {
      yearElement.textContent = `© ${new Date().getFullYear()} Nord87q`;
    }
  },
});

// ===== Main Initialization =====
const initPortfolio = () => {
  Modules.log('Core', 'Starting initialization...');

  // Initialize all systems
  CursorSystem.init();
  OverlaySystem.init();
  VideoSystem.init();
  AudioSystem.init();
  ClockSystem.init();
  NavigationSystem.init();
  ContactSystem.init();
  ThemeSystem.init();
  FooterSystem.init();

  // Initialize scroll animations after portfolio enters
  window.addEventListener('portfolioEntered', () => {
    setTimeout(() => {
      ScrollAnimations.init();
      Modules.log('Core', 'Scroll animations initialized');
    }, 300);
  });

  // Log performance
  const perfEnd = performance.now();
  Modules.log('Core', `Portfolio loaded in ${(perfEnd - perfStart).toFixed(2)}ms`);
  Modules.log('Core', `Active modules: ${Array.from(Modules.active).join(', ')}`);
};

// ===== Error Handling =====
window.addEventListener('error', (event) => {
  console.error('[Portfolio Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Promise Rejection]', event.reason);
});

// Start the portfolio
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}

console.log("[v0] Pro Portfolio v2.0 - Ready!");
