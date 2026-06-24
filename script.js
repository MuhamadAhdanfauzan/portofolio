// Sticky Navbar
window.addEventListener('scroll', function() {
    let header = document.querySelector('nav');
    header.classList.toggle('sticky', window.scrollY > 100);
});

// Menu Toggle
let menuBtn = document.querySelector('.menu-btn');
let menuIcon = document.querySelector('.menu-btn i');
let navLinks = document.querySelector('.nav-links');

menuBtn.onclick = () => {
    navLinks.classList.toggle('active');
    if(navLinks.classList.contains('active')){
        menuIcon.classList.remove('fa-bars');
        menuIcon.classList.add('fa-xmark');
    } else {
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    }
};

// Active link on scroll
let sections = document.querySelectorAll('section[id]');
let navItems = document.querySelectorAll('.nav-links a');

if (sections.length > 0) {
    window.onscroll = () => {
        sections.forEach(sec => {
            let top = window.scrollY;
            let offset = sec.offsetTop - 150;
            let height = sec.offsetHeight;
            let id = sec.getAttribute('id');

            if(top >= offset && top < offset + height) {
                navItems.forEach(links => {
                    links.classList.remove('active');
                    document.querySelector('.nav-links a[href*=' + id + ']')?.classList.add('active');
                });
            }
        });

        // Remove toggle icon and navbar when click navbar link (scroll)
        navLinks.classList.remove('active');
        menuIcon.classList.remove('fa-xmark');
        menuIcon.classList.add('fa-bars');
    };
}

// Scroll Reveal Animation
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        } else {
            reveals[i].classList.remove("active");
        }
    }
}

window.addEventListener("scroll", reveal);
// Trigger once on load
reveal();

// Typed.js Animation
var typed = new Typed(".typing", {
    strings: ["Frontend Developer", "Web Designer", "UI/UX Designer"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
});

// FAQ Accordion
var faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(function(item) {
    var question = item.querySelector(".faq-question");
    question.addEventListener("click", function() {
        var isActive = item.classList.contains("active");
        
        // Close all FAQ items
        faqItems.forEach(function(otherItem) {
            otherItem.classList.remove("active");
        });
        
        // Toggle clicked item
        if (!isActive) {
            item.classList.add("active");
        }
    });
});

// Skill Bar Animation on Scroll
function animateSkills() {
    var skillsSection = document.querySelector("#skills");
    if (!skillsSection) return;
    
    var skillsTop = skillsSection.getBoundingClientRect().top;
    var windowHeight = window.innerHeight;
    
    if (skillsTop < windowHeight - 100) {
        var skillBars = document.querySelectorAll(".skill-progress");
        skillBars.forEach(function(bar) {
            var progress = bar.getAttribute("data-progress");
            bar.style.setProperty("--progress-width", progress);
            bar.classList.add("animate");
        });
        // Remove event listener once animation is triggered
        window.removeEventListener("scroll", animateSkills);
    }
}

window.addEventListener("scroll", animateSkills);
// Trigger once on load
setTimeout(animateSkills, 500);

// ===== Supabase Contact Form Integration =====
// Configuration
const SUPABASE_URL = "https://zopyryqjtbpwlilwsbnl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvcHlyeXFqdGJwd2xpbHdzYm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTQ3OTEsImV4cCI6MjA5Nzg5MDc5MX0.HjBw-2yDa1RIb7nLbdOv66wHbufSKD7nJi5Ty-lWRkA";

// Handle form submission
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    
    // Basic validation
    if (!fullName || !email || !message) {
        showFormStatus("Please fill in all required fields.", "error");
        return;
    }
    
    // Validate email must be @gmail.com
    if (!email.endsWith("@gmail.com")) {
        showFormStatus("Please use a valid @gmail.com email address.", "error");
        return;
    }
    
    // Disable button and show loading
    const submitBtn = contactForm.querySelector('input[type="submit"]');
    submitBtn.value = "Sending...";
    submitBtn.disabled = true;
    
    try {
        // Send data to Supabase
        const response = await fetch(SUPABASE_URL + "/rest/v1/contacts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": "Bearer " + SUPABASE_ANON_KEY,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                phone: phone || null,
                subject: subject || null,
                message: message,
                created_at: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            // Try to get error details from response
            let errorText = "";
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData);
            } catch(e) {
                errorText = await response.text();
            }
            console.error("Supabase error response:", response.status, errorText);
            throw new Error("Server responded with " + response.status + ": " + errorText);
        }
        
        // Success
        showFormStatus("Message sent successfully! I'll get back to you soon.", "success");
        contactForm.reset();
        
    } catch (error) {
        console.error("Supabase error:", error);
        // Show user-friendly message
        if (error.message.includes("42501") || error.message.includes("row-level security")) {
            showFormStatus("Database permission issue. Please enable insert policy for the contacts table in Supabase.", "error");
        } else {
            showFormStatus("Failed to send message. Error: " + error.message, "error");
        }
    } finally {
        submitBtn.value = "Send Message";
        submitBtn.disabled = false;
    }
});

function showFormStatus(text, type) {
    formStatus.textContent = text;
    formStatus.className = "form-status " + type;
    formStatus.style.display = "block";
    
    // Auto hide after 5 seconds
    setTimeout(function() {
        formStatus.style.display = "none";
    }, 5000);
}

// ===== Floating Music Player =====
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicPlayerBtn");
const musicContainer = document.getElementById("musicPlayerContainer");
const playPauseBtn = document.getElementById("playPauseBtn");
const progressBar = document.getElementById("musicProgress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeControl = document.getElementById("volumeControl");

let isPlaying = false;

// Format time helper
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
}

// Toggle player visibility
function toggleMusicPlayer() {
    const isActive = musicContainer.classList.contains("active");
    if (!isActive) {
        musicContainer.classList.add("active");
    } else {
        musicContainer.classList.remove("active");
    }
}

// Close player (just hide, music keeps playing)
function closeMusicPlayer() {
    musicContainer.classList.remove("active");
}

// Toggle play/pause
function togglePlay() {
    if (isPlaying) {
        bgMusic.pause();
    } else {
        bgMusic.play().catch(function(e) {
            console.log("Play prevented:", e);
        });
    }
}

// Update UI based on play state
bgMusic.addEventListener("play", function() {
    isPlaying = true;
    playPauseBtn.querySelector("i").className = "fas fa-pause";
    musicBtn.querySelector("i").className = "fas fa-music";
    musicBtn.classList.add("playing");
    musicContainer.classList.add("playing");
});

bgMusic.addEventListener("pause", function() {
    isPlaying = false;
    playPauseBtn.querySelector("i").className = "fas fa-play";
    musicBtn.querySelector("i").className = "fas fa-music";
    musicBtn.classList.remove("playing");
    musicContainer.classList.remove("playing");
});

// Update progress bar
bgMusic.addEventListener("timeupdate", function() {
    if (!progressBar.dragging) {
        const progress = (bgMusic.currentTime / bgMusic.duration) * 100;
        progressBar.value = progress || 0;
        currentTimeEl.textContent = formatTime(bgMusic.currentTime);
    }
});

// Load metadata (duration)
bgMusic.addEventListener("loadedmetadata", function() {
    durationEl.textContent = formatTime(bgMusic.duration);
});

// Seek when user drags progress bar
function seekMusic(e) {
    bgMusic.currentTime = (e.target.value / 100) * bgMusic.duration;
}

// Prevent progress bar jump while dragging
progressBar.addEventListener("mousedown", function() {
    this.dragging = true;
});
progressBar.addEventListener("mouseup", function() {
    this.dragging = false;
});

// Next/Prev (for now just restart or loop)
function nextMusic() {
    bgMusic.currentTime = 0;
    if (!isPlaying) togglePlay();
}

function prevMusic() {
    bgMusic.currentTime = 0;
    if (!isPlaying) togglePlay();
}

// Auto-play next when song ends (loop for single track)
bgMusic.addEventListener("ended", function() {
    bgMusic.currentTime = 0;
    bgMusic.play();
});

// Click outside to close player (but music keeps playing)
document.addEventListener("click", function(e) {
    if (musicContainer && musicBtn) {
        if (!musicContainer.contains(e.target) && !musicBtn.contains(e.target)) {
            closeMusicPlayer();
        }
    }
});
