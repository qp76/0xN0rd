console.clear();

// Cursor logic
const cursorOuter = document.querySelector(".cursor--large");
const cursorInner = document.querySelector(".cursor--small");
let mouse = { x: -100, y: -100 };
let isStuck = false;
let scrollHeight = 0;

window.addEventListener("scroll", () => { scrollHeight = window.scrollY; });

let cursorOuterOriginalState = {
  width: cursorOuter.getBoundingClientRect().width,
  height: cursorOuter.getBoundingClientRect().height,
};

document.body.addEventListener("pointermove", (e) => {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
});
document.body.addEventListener("pointerdown", () => {
  gsap.to(cursorInner, 0.13, { scale: 2 });
});
document.body.addEventListener("pointerup", () => {
  gsap.to(cursorInner, 0.13, { scale: 1 });
});

function updateCursor() {
  gsap.set(cursorInner, { x: mouse.x, y: mouse.y });
  if (!isStuck) {
    gsap.to(cursorOuter, {
      duration: 0.16,
      x: mouse.x - cursorOuterOriginalState.width / 2,
      y: mouse.y - cursorOuterOriginalState.height / 2,
    });
  }
  requestAnimationFrame(updateCursor);
}
updateCursor();

function handleMouseEnter(e) {
  isStuck = true;
  const targetBox = e.currentTarget.getBoundingClientRect();
  gsap.to(cursorOuter, 0.18, {
    x: targetBox.left,
    y: targetBox.top + scrollHeight,
    width: targetBox.width,
    height: targetBox.width,
    borderRadius: 0,
    backgroundColor: "rgba(56, 129, 255, 0.13)",
  });
}
function handleMouseLeave() {
  isStuck = false;
  gsap.to(cursorOuter, 0.18, {
    width: cursorOuterOriginalState.width,
    height: cursorOuterOriginalState.width,
    borderRadius: "50%",
    backgroundColor: "transparent",
  });
}
// Attach to social and music buttons
document.querySelectorAll("main button, .social-bar button").forEach((button) => {
  button.addEventListener("pointerenter", handleMouseEnter);
  button.addEventListener("pointerleave", handleMouseLeave);
});

// Overlay logic
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const music = document.getElementById("music");
const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");
const videos = [
  document.getElementById("bg-video-1"),
  document.getElementById("bg-video-2"),
  document.getElementById("bg-video-3"),
  document.getElementById("bg-video-4"),
];
let currentVideo = 0;

// Hide all videos initially
videos.forEach((v) => (v.style.display = "none"));

// Start sequence
startBtn.addEventListener("click", () => {
  overlay.style.opacity = "0";
  setTimeout(() => overlay.style.display = "none", 600);
  startSequence();
});

// Video/music sequence logic
function startSequence() {
  currentVideo = 0;
  videos.forEach((v, i) => v.style.display = i === 0 ? "block" : "none");
  videos[0].play();
  if (music.paused) music.play();
  playButton.classList.add("active");
}
videos.forEach((video, i) => {
  video.addEventListener("ended", () => {
    video.style.display = "none";
    const next = (i + 1) % videos.length;
    videos[next].style.display = "block";
    videos[next].play();
    currentVideo = next;
  });
});

// Music toggle
playButton.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    playIcon.classList.replace("fa-volume-xmark", "fa-volume-high");
    playButton.classList.add("active");
  } else {
    music.pause();
    playIcon.classList.replace("fa-volume-high", "fa-volume-xmark");
    playButton.classList.remove("active");
  }
});

// Social buttons
document.querySelectorAll(".social-bar button, .bottom-right-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const link = btn.dataset.link;
    if (link) window.open(link, "_blank");
  });
});

// Clock logic
function updateClock() {
  const now = new Date();
  const options = { timeZone: 'Africa/Cairo', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formattedTime = now.toLocaleTimeString('en-US', options);
  document.getElementById('clock').textContent = formattedTime;
}
setInterval(updateClock, 1000);
window.onload = updateClock;

// Accessibility: allow toggling system cursor for those who prefer
document.addEventListener("keydown", (e) => {
  if (e.key === "c") {
    document.body.classList.toggle("show-cursor");
  }
});
