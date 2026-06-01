console.log("[v0] Portfolio Enhanced - Loading...");

// ===== Configuration =====
const CONFIG = {
  mouseTrackingEnabled: true,
  particlesEnabled: true,
  performanceMode: window.innerWidth < 768,
};

// ===== Performance Monitor =====
const perfStart = performance.now();

// ===== Cursor System =====
const cursorSystem = {
  outer: document.querySelector(".cursor--large"),
  inner: document.querySelector(".cursor--small"),
  mouse: { x: -100, y: -100 },
  isStuck: false,
  scrollHeight: 0,
  originalState: null,

  init() {
    if (!CONFIG.mouseTrackingEnabled) return;
    
    this.originalState = {
      width: this.outer.getBoundingClientRect().width,
      height: this.outer.getBoundingClientRect().height,
    };

    window.addEventListener("scroll", () => {
      this.scrollHeight = window.scrollY;
    });

    document.body.addEventListener("pointermove", (e) => {
      this.mouse.x = e.pageX;
      this.mouse.y = e.pageY;
    });

    document.body.addEventListener("pointerdown", () => {
      gsap.to(this.inner, { duration: 0.13, scale: 1.5 });
    });

    document.body.addEventListener("pointerup", () => {
      gsap.to(this.inner, { duration: 0.13, scale: 1 });
    });

    this.animate();
    this.attachEventListeners();
  },

  animate() {
    gsap.set(this.inner, { x: this.mouse.x, y: this.mouse.y });
    
    if (!this.isStuck) {
      gsap.to(this.outer, {
        duration: 0.16,
        x: this.mouse.x - this.originalState.width / 2,
        y: this.mouse.y - this.originalState.height / 2,
        overwrite: "auto",
      });
    }
    
    requestAnimationFrame(() => this.animate());
  },

  handleMouseEnter(e) {
    const targetBox = e.currentTarget.getBoundingClientRect();
    cursorSystem.isStuck = true;
    gsap.to(cursorSystem.outer, 0.18, {
      x: targetBox.left,
      y: targetBox.top + cursorSystem.scrollHeight,
      width: targetBox.width,
      height: targetBox.height,
      borderRadius: 6,
      backgroundColor: "rgba(56, 129, 255, 0.2)",
      boxShadow: "0 0 20px rgba(56, 129, 255, 0.4)",
    });
  },

  handleMouseLeave() {
    cursorSystem.isStuck = false;
    gsap.to(cursorSystem.outer, 0.18, {
      width: cursorSystem.originalState.width,
      height: cursorSystem.originalState.height,
      borderRadius: "50%",
      backgroundColor: "transparent",
      boxShadow: "inset 0 0 10px rgba(56, 129, 255, 0.3)",
    });
  },

  attachEventListeners() {
    document.querySelectorAll(".social-button, .contact-btn, .feedback-button, .player-btn, .nav-link").forEach((el) => {
      el.addEventListener("pointerenter", (e) => this.handleMouseEnter(e));
      el.addEventListener("pointerleave", () => this.handleMouseLeave());
    });
  },
};

// ===== Overlay System =====
const overlaySystem = {
  overlay: document.getElementById("overlay"),
  startBtn: document.getElementById("startBtn"),
  loadingBar: document.getElementById("loadingBar"),
  isEntered: false,

  init() {
    this.startBtn.addEventListener("click", () => this.enter());
    this.animateLoadingBar();
  },

  animateLoadingBar() {
    gsap.fromTo(
      this.loadingBar,
      { width: "0%" },
      { width: "100%", duration: 2, ease: "power2.inOut" }
    );
  },

  enter() {
    if (this.isEntered) return;
    this.isEntered = true;

    gsap.to(this.overlay, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        this.overlay.classList.add("hide");
        videoSystem.startSequence();
        window.dispatchEvent(new Event("portfolioEntered"));
      },
    });
  },
};

// ===== Video System =====
const videoSystem = {
  videos: Array.from(document.querySelectorAll(".bg-video")),
  currentVideoIndex: 0,
  isPlaying: false,

  init() {
    this.videos.forEach((video, index) => {
      video.addEventListener("ended", () => this.nextVideo());
      video.addEventListener("play", () => {
        this.isPlaying = true;
      });
      video.addEventListener("pause", () => {
        this.isPlaying = false;
      });
    });
  },

  startSequence() {
    this.showVideo(0);
    this.videos[0].play().catch((err) => {
      console.log("[v0] Video autoplay prevented:", err);
    });
  },

  showVideo(index) {
    this.videos.forEach((video, i) => {
      video.classList.remove("active");
      if (i !== index) video.pause();
    });
    this.videos[index].classList.add("active");
    this.currentVideoIndex = index;
  },

  nextVideo() {
    const nextIndex = (this.currentVideoIndex + 1) % this.videos.length;
    this.showVideo(nextIndex);
    this.videos[nextIndex].play().catch((err) => {
      console.log("[v0] Video playback error:", err);
    });
  },
};

// ===== Music System =====
const musicSystem = {
  audio: document.getElementById("music"),
  playButton: document.getElementById("playButton"),
  playIcon: document.getElementById("playIcon"),

  init() {
    this.playButton.addEventListener("click", () => this.togglePlayPause());
  },

  togglePlayPause() {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  },

  play() {
    this.audio.play().catch((err) => {
      console.log("[v0] Music autoplay prevented:", err);
    });
    this.updateUIState(true);
  },

  pause() {
    this.audio.pause();
    this.updateUIState(false);
  },

  updateUIState(isPlaying) {
    if (isPlaying) {
      this.playIcon.classList.replace("fa-volume-xmark", "fa-volume-high");
      this.playButton.classList.add("active");
    } else {
      this.playIcon.classList.replace("fa-volume-high", "fa-volume-xmark");
      this.playButton.classList.remove("active");
    }
  },
};

// ===== Clock System =====
const clockSystem = {
  clockElement: document.getElementById("clock"),

  init() {
    this.updateClock();
    setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const now = new Date();
    const options = {
      timeZone: "Africa/Cairo",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const formattedTime = now.toLocaleTimeString("en-US", options);
    this.clockElement.textContent = formattedTime;
  },
};

// ===== Scroll Animations =====
const scrollAnimations = {
  init() {
    gsap.registerPlugin(ScrollTrigger);

    // Animate sections on scroll
    document.querySelectorAll(".about-section, .projects-section, .contact-section").forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Animate project cards on scroll
    document.querySelectorAll(".project-card").forEach((card, index) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  },
};

// ===== Social Links =====
const socialLinks = {
  init() {
    document.querySelectorAll(".social-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const href = button.getAttribute("href");
        if (href) window.open(href, "_blank", "noopener");
      });
    });
  },
};

// ===== Contact Buttons =====
const contactButtons = {
  init() {
    document.getElementById("feedbackBtn").addEventListener("click", () => {
      window.open("https://yousif111.github.io/FeedBack/", "_blank", "noopener");
    });

    document.getElementById("emailBtn").addEventListener("click", () => {
      window.open("mailto:contact@nord87q.dev", "_blank");
    });
  },
};

// ===== Accessibility =====
const accessibility = {
  init() {
    // Toggle system cursor with 'c' key
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "c") {
        document.body.classList.toggle("show-cursor");
      }
    });

    // Keyboard navigation for buttons
    document.querySelectorAll("button, a[role='button']").forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    });
  },
};

// ===== Smooth Scroll Offset =====
const smoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const href = anchor.getAttribute("href");
        if (href === "#") return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  },
};

// ===== Performance Optimizations =====
const performanceOptimizations = {
  init() {
    // Lazy load images
    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll("img[data-src]").forEach((img) => {
        imageObserver.observe(img);
      });
    }

    // Reduce animations on low-end devices
    if (CONFIG.performanceMode) {
      document.body.classList.add("performance-mode");
    }
  },
};

// ===== Theme System =====
const themeSystem = {
  init() {
    // Detect system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.style.colorScheme = "dark";
    }
  },
};

// ===== Main Initialization =====
const init = () => {
  console.log("[v0] Initializing portfolio systems...");

  // Initialize all systems
  cursorSystem.init();
  overlaySystem.init();
  videoSystem.init();
  musicSystem.init();
  clockSystem.init();
  socialLinks.init();
  contactButtons.init();
  accessibility.init();
  smoothScroll.init();
  performanceOptimizations.init();
  themeSystem.init();

  // Initialize scroll animations after a short delay
  window.addEventListener("portfolioEntered", () => {
    setTimeout(() => scrollAnimations.init(), 500);
  });

  // Log performance
  const perfEnd = performance.now();
  console.log(`[v0] Portfolio loaded in ${(perfEnd - perfStart).toFixed(2)}ms`);
};

// ===== Error Handling =====
window.addEventListener("error", (event) => {
  console.error("[v0] Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[v0] Unhandled promise rejection:", event.reason);
});

// Start initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

console.log("[v0] Portfolio Enhanced - Ready!");
