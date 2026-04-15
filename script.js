// Initialize Lucide icons
lucide.createIcons();

// Register GSAP Plugins
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Mobile Menu Toggle (Robust & Smooth)
const menuToggle = document.getElementById('menuToggle');
const navContainer = document.querySelector('.nav-container');
const body = document.body;

if (menuToggle && navContainer) {
    const toggleMenu = (isOpen) => {
        const icon = menuToggle.querySelector('i');

        if (isOpen) {
            navContainer.classList.add('active');
            body.style.overflow = 'hidden'; // Lock scroll
            icon.setAttribute('data-lucide', 'x');
        } else {
            navContainer.classList.remove('active');
            body.style.overflow = ''; // Unlock scroll
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    };

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navContainer.classList.contains('active');
        toggleMenu(!isOpen);
    });

    // Close on Link Click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });

    // Close on Outside Click
    document.addEventListener('click', (e) => {
        const isOpen = navContainer.classList.contains('active');
        if (isOpen && !navContainer.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleMenu(false);
    });
}

// --------------------------------------------------------------------------
// CONSOLIDATED SCROLL & INTERACTION MANAGER (Performance Optimized)
// --------------------------------------------------------------------------
const OptimizationManager = {
    ticking: false,
    lastScrollY: window.scrollY,
    lastMouseX: 0,
    lastMouseY: 0,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

    // Elements
    header: document.querySelector('.header'),
    navLinks: document.querySelectorAll('.nav-menu a'),
    sections: document.querySelectorAll('section[id]'),
    footer: document.querySelector('.footer-premium-studio'),
    parallaxText: document.querySelector('.footer-parallax-text span'),
    cards: document.querySelectorAll('.card-wrapper'),
    rippleTexts: document.querySelectorAll('.ripple-text'),
    auroraBlobs: document.querySelectorAll('.aurora-blob'),

    init() {
        // Passive listeners for best performance
        window.addEventListener('scroll', () => this.onScroll(), { passive: true });
        window.addEventListener('resize', () => this.onResize(), { passive: true });

        if (!this.reducedMotion) {
            window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });
        }

        // Initial setup
        this.update();
    },

    onScroll() {
        this.lastScrollY = window.scrollY;
        this.requestTick();
    },

    onResize() {
        this.viewportHeight = window.innerHeight;
        this.viewportWidth = window.innerWidth;
        this.requestTick();
    },

    onMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.requestTick();
    },

    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    },

    update() {
        const scrollPos = this.lastScrollY;
        const mouseX = this.lastMouseX;
        const mouseY = this.lastMouseY;

        // 1. Sticky Header
        if (this.header) {
            this.header.classList.toggle('sticky', scrollPos > 100);
        }

        // 2. Active Link Highlighting (Index page only)
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            let current = "";
            for (const section of this.sections) {
                if (scrollPos >= section.offsetTop - 250) {
                    current = section.getAttribute("id");
                }
            }
            this.navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href').split('#')[1] === current);
            });
        }

        // 3. Footer Parallax
        if (this.footer && this.parallaxText && !this.reducedMotion) {
            const rect = this.footer.getBoundingClientRect();
            if (rect.top <= this.viewportHeight && rect.bottom >= 0) {
                const percentage = (this.viewportHeight - rect.top) / (this.viewportHeight + rect.height);
                const moveY = (percentage - 0.5) * 200;
                this.parallaxText.style.transform = `translate3d(0, ${moveY}px, 0)`;
            }
        }

        // 4. Project Card Stacking
        if (this.cards.length > 0) {
            this.cards.forEach((cardWrapper, index) => {
                const cardInner = cardWrapper.querySelector('.project-card');
                const nextCard = this.cards[index + 1];
                let scale = 1, blur = 0, brightness = 1;

                if (nextCard) {
                    const nextRect = nextCard.getBoundingClientRect();
                    const stickPoint = this.viewportHeight * 0.15;
                    let progress = Math.max(0, Math.min((nextRect.top - stickPoint) / (this.viewportHeight - stickPoint), 1));

                    scale = 0.9 + (0.1 * progress);
                    blur = (1 - progress) * 8;
                    brightness = 0.6 + (0.4 * progress);
                }

                const rx = cardInner.style.getPropertyValue('--rx') || '0deg';
                const ry = cardInner.style.getPropertyValue('--ry') || '0deg';

                // Use translate3d for GPU acceleration
                cardInner.style.transform = `translate3d(0,0,0) scale(${scale}) perspective(1000px) rotateX(${rx}) rotateY(${ry})`;

                if (!this.reducedMotion) {
                    cardInner.style.filter = `blur(${blur}px) brightness(${brightness})`;
                }
            });
        }

        // 5. Ripple Texts (Integrated)
        if (this.rippleTexts.length > 0 && !this.reducedMotion) {
            this.rippleTexts.forEach(text => {
                const rect = text.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const moveX = (mouseX - centerX) * 0.05;
                const moveY = (mouseY - centerY) * 0.05;
                text.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) skewX(${moveX * 0.1}deg)`;
            });
        }

        // 6. Aurora Blobs (Integrated)
        if (this.auroraBlobs.length > 0 && !this.reducedMotion) {
            this.auroraBlobs.forEach((blob, index) => {
                const speed = (index + 1) * 0.02;
                const dx = (mouseX - this.viewportWidth / 2) * speed;
                const dy = (mouseY - this.viewportHeight / 2) * speed;
                const pulse = 1 + Math.sin(Date.now() * 0.001 + index) * 0.1;
                blob.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${pulse})`;
            });
            // Keep loop alive for aurora pulse if screen is not static
            this.requestTick();
        }

        this.ticking = false;
    }
};

// Start Manager
OptimizationManager.init();

// Smooth Scroll for links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            navContainer.classList.remove('active');
            body.style.overflow = '';
            lucide.createIcons();
        }
    });
});

// Magnetic Buttons (Consolidated & Passive)
const setupMagnetic = (elements, strength = 0.5) => {
    if (OptimizationManager.reducedMotion) return;

    elements.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const moveX = (e.clientX - rect.left - rect.width / 2) * strength;
            const moveY = (e.clientY - rect.top - rect.height / 2) * strength;
            btn.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;

            const icon = btn.querySelector('.btn-icon');
            if (icon) icon.style.transform = `translate3d(${moveX * 0.5}px, ${moveY * 0.5}px, 0)`;
        }, { passive: true });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate3d(0, 0, 0)';
            const icon = btn.querySelector('.btn-icon');
            if (icon) icon.style.transform = 'translate3d(0, 0, 0)';
        });
    });
};

setupMagnetic(document.querySelectorAll('.magnetic-btn, .btn, .social-planet, .magnetic-card'));

// Card Tilt Logic
const setupTilt = (cards) => {
    if (OptimizationManager.reducedMotion) return;

    cards.forEach(wrapper => {
        const card = wrapper.querySelector('.project-card');
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const rotateX = ((y - rect.height / 2) / rect.height) * -10;
            const rotateY = ((x - rect.width / 2) / rect.width) * 10;

            card.style.setProperty('--rx', `${rotateX}deg`);
            card.style.setProperty('--ry', `${rotateY}deg`);
            OptimizationManager.requestTick();
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--rx', `0deg`);
            card.style.setProperty('--ry', `0deg`);
            card.style.setProperty('--mouse-x', `-100%`);
            card.style.setProperty('--mouse-y', `-100%`);
            OptimizationManager.requestTick();
        });
    });
};

setupTilt(document.querySelectorAll('.card-wrapper'));

// Tech Card Mouse Tracking (Radial Glow)
const setupTechCardHover = (cards) => {
    if (OptimizationManager.reducedMotion) return;
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }, { passive: true });
    });
};
setupTechCardHover(document.querySelectorAll('.tech-card'));

// 1. Scroll Reveal Observer
const revealElements = document.querySelectorAll('.reveal-on-scroll');
const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => revealOnScroll.observe(el));

// Fade in Hero Title
const heroTitle = document.querySelector('.hero-text h1');
if (heroTitle) {
    setTimeout(() => {
        heroTitle.style.transition = 'opacity 1s ease, transform 1s ease';
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0)';
    }, 300);
}

// Stats Counter
const statNumbers = document.querySelectorAll('.stat-number');
const runCounter = (el) => {
    const target = +el.getAttribute('data-target');
    const duration = Math.min(2000, Math.max(500, target * 50));
    const increment = target / (duration / 16);
    let current = 0;

    const updateCount = () => {
        current += increment;
        if (current < target) {
            const val = Math.floor(current);
            const targetStr = el.getAttribute('data-target');
            el.innerText = (targetStr.startsWith('0') && val < 10) ? '0' + val : val;
            requestAnimationFrame(updateCount);
        } else {
            el.innerText = el.getAttribute('data-target');
        }
    };
    updateCount();
};

const statObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(number => statObserver.observe(number));

// FAQ Accordion (Generic)
const setupAccordion = (itemSelector, headerSelector, bodySelector) => {
    const items = document.querySelectorAll(itemSelector);
    items.forEach(item => {
        const header = item.querySelector(headerSelector);
        const body = item.querySelector(bodySelector);
        if (header && body) {
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                items.forEach(other => {
                    if (other !== item && other.classList.contains('active')) {
                        other.classList.remove('active');
                        const otherBody = other.querySelector(bodySelector);
                        if (otherBody) otherBody.style.height = '0';
                    }
                });
                item.classList.toggle('active');
                body.style.height = isActive ? '0' : body.scrollHeight + 'px';
                lucide.createIcons();
            });
        }
    });
};

setupAccordion('.faq-item', '.faq-question', '.faq-answer');
setupAccordion('.cc-item', '.cc-header', '.cc-body');
setupAccordion('.sf-item', '.sf-header', '.sf-body');

// Holographic Ticket Tilt
const ticketContainer = document.querySelector('.holo-ticket-container');
const ticketGlass = document.querySelector('.ticket-glass');
if (ticketContainer && ticketGlass && !OptimizationManager.reducedMotion) {
    ticketContainer.addEventListener('mousemove', (e) => {
        const rect = ticketContainer.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -15;
        const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 15;
        ticketGlass.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }, { passive: true });
    ticketContainer.addEventListener('mouseleave', () => {
        ticketGlass.style.transform = `rotateX(0deg) rotateY(0deg)`;
    });
}



// INTRO-OVERLAY


window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("introOverlay").style.display = "none";
    }, 3500);
});
// Navbar Scroll Logic
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header'); // Nammude navbar select cheyyunnu

    if (window.scrollY > 50) {
        // 50px-il kooduthal scroll cheythaal background varum
        header.classList.add('scrolled');
    } else {
        // Mukalil ethumpol background pogum
        header.classList.remove('scrolled');
    }
});

// Navbar Scroll Logic - 
function handleScroll() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);



// Code Card Typing Animation
const initCodeAnimation = () => {
    const typewriter = document.getElementById('typewriter');
    if (!typewriter) return;

    const code = `const Ashifa = {
  role: 'Creative Developer',
  skills: [
    'UI/UX Design',
    '
  ],
  createMagic: function() {
    return 'Stunning Experiences';
  }
}`;

    const highlight = (text) => {
        return text
            .replace(/\b(const|function|return)\b/g, '<span class="keyword">$1</span>')
            .replace(/\b(Anfas)\b/g, '<span class="class-name">$1</span>')
            .replace(/\b(role|skills|createMagic)\b/g, '<span class="property">$1</span>')
            .replace(/('.*?')/g, '<span class="string">$1</span>');
    };

    let i = 0;
    typewriter.innerHTML = '';

    const type = () => {
        if (i < code.length) {
            const char = code.charAt(i);
            // Handle multiple characters at once for faster feel on spaces/newlines
            let skip = 0;
            if (char === ' ' || char === '\n') skip = 1;

            i += 1 + skip;
            const currentText = code.substring(0, Math.min(i, code.length));
            typewriter.innerHTML = highlight(currentText);

            let delay = Math.random() * 40 + 30;
            if (char === '\n') delay = 300;
            if (char === ':') delay = 150;

            setTimeout(type, delay);
        } else {
            // Pulse effect when finished
            const card = typewriter.closest('.code-card');
            if (card) {
                card.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.4)';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 1000);
            }

            setTimeout(() => {
                i = 0;
                typewriter.innerHTML = '';
                type();
            }, 6000); // 6s pause before restart
        }
    };

    // Use Intersection Observer to start when visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            type();
            observer.disconnect();
        }
    }, { threshold: 0.5 });

    observer.observe(typewriter);
};

// --------------------------------------------------------------------------
// Contact Form Logic (Reliable & Decoupled)
// --------------------------------------------------------------------------
const initContactForm = () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('Subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            alert("Please fill all fields");
            return;
        }

        const whatsappNumber = '918848798636';
        const text = encodeURIComponent(
            `Hello Ashifa:\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message: ${message}`
        );

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${text}`;

        const formStatus = document.getElementById('formStatus');
        if (formStatus) {
            formStatus.innerText = 'PREPARING TRANSMISSION...';
            formStatus.style.opacity = '1';
            formStatus.style.color = 'var(--accent-primary)';
        }

        const activeBtn = document.querySelector(".studio-submit") || document.querySelector(".silk-submit");
        if (activeBtn && typeof gsap !== 'undefined') {
            gsap.to(activeBtn, {
                scale: 0.95,
                opacity: 0.5,
                duration: 0.3
            });
        }

        setTimeout(() => {
            // Reliable redirection
            window.location.href = whatsappURL;

            setTimeout(() => {
                contactForm.reset();
                if (activeBtn && typeof gsap !== 'undefined') gsap.to(activeBtn, { scale: 1, opacity: 1, duration: 0.5 });
                if (formStatus) {
                    formStatus.innerText = 'MESSAGE SENT.';
                    setTimeout(() => {
                        gsap.to(formStatus, { opacity: 0, duration: 1 });
                    }, 3000);
                }
            }, 500);
        }, 1000);

        return false;
    });
};

// Silk/Studio Minimalist Interaction Architecture (Motion-Dependent)
const setupContactInteractions = () => {
    if (OptimizationManager.reducedMotion) return;

    const studioSection = document.querySelector('.studio-contact') || document.querySelector('.silk-minimalist');
    const submitBtn = document.querySelector('.studio-submit') || document.querySelector('.silk-submit');

    if (!studioSection) return;

    // 1. Studio/Silk Reveal Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const isStudio = studioSection.classList.contains('studio-contact');
        const trigger = isStudio ? ".studio-contact" : ".silk-minimalist";

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: trigger,
                start: "top 70%",
            }
        });

        if (isStudio) {
            tl.from(".studio-badge", { opacity: 0, x: -20, duration: 1, ease: "power3.out" })
                .from(".studio-title", { opacity: 0, y: 40, duration: 1.2, ease: "power4.out" }, "-=0.7")
                .from(".studio-description", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.8")
                .from(".studio-card", { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out" }, "-=0.8")
                .from(".studio-form-container", { opacity: 0, x: 40, duration: 1.5, ease: "expo.out" }, "-=1.2");
        } else {
            tl.from(".silk-tag", { opacity: 0, x: -20, duration: 1, ease: "power3.out" })
                .from(".silk-title", { opacity: 0, y: 40, duration: 1.2, ease: "power4.out" }, "-=0.7")
                .from(".silk-subtext", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.8")
                .from(".silk-link", { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, "-=0.8")
                .from(".silk-form-container", { opacity: 0, x: 40, duration: 1.5, ease: "expo.out" }, "-=1.2")
                .from(".silk-field", { opacity: 0, y: 30, stagger: 0.1, duration: 1, ease: "power3.out" }, "-=1");
        }
    }

    // 2. Refined Magnetic Button logic
    if (submitBtn && typeof gsap !== 'undefined') {
        submitBtn.addEventListener('mousemove', (e) => {
            const rect = submitBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(submitBtn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        submitBtn.addEventListener('mouseleave', () => {
            gsap.to(submitBtn, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }
};

const initProcessAnimation = () => {
    const processSection = document.querySelector('.process-section');
    const processLayout = document.querySelector('.process-layout');
    const cards = document.querySelectorAll('.process-card');

    if (processSection && processLayout && cards.length > 0 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

        const mm = gsap.matchMedia();

        mm.add("(min-width: 1024px)", () => {
            // Function to calculate exact scroll distance
            const getScrollWidth = () => processLayout.scrollWidth - window.innerWidth;

            gsap.to(processLayout, {
                x: () => -getScrollWidth(),
                ease: "none",
                scrollTrigger: {
                    trigger: processSection,
                    start: "top top",
                    end: () => `+=${getScrollWidth()}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true, // Crucial for recalculating on resize
                }
            });

            // Refresh on load to ensure accuracy
            window.addEventListener('load', () => ScrollTrigger.refresh());
        });

        // Simple Reveal on Mobile
        mm.add("(max-width: 1023px)", () => {
            gsap.from(cards, {
                y: 50,
                opacity: 0,
                stagger: 0.2,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: processSection,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });
        });
    }
};

// Initialize Section
if (document.readyState === 'complete') {
    setupContactInteractions();
    initContactForm();
    initCodeAnimation();
    initProcessAnimation();
} else {
    window.addEventListener('load', () => {
        setupContactInteractions();
        initContactForm();
        initCodeAnimation();
        initProcessAnimation();
    });
}

// Initialize Lenis Smooth Scroll
const lenis = (typeof Lenis !== 'undefined') ? new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
}) : null;

if (lenis) {
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis scroll position with OptimizationManager & ScrollTrigger
    lenis.on('scroll', (e) => {
        ScrollTrigger.update(); // CRITICAL for GSAP scroll animations
        OptimizationManager.lastScrollY = e.scroll;
        OptimizationManager.requestTick();

        // Robust Sticky Header Management
        const header = document.querySelector('.header');
        if (header) {
            header.classList.toggle('sticky', e.scroll > 100);
        }
    });

    // Back to Top logic with Lenis
    const btnTop = document.getElementById('backToTop');
    if (btnTop) {
        btnTop.addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(0, { duration: 1.5 });
        });
    }
} else {
    // Fallback for native scroll if Lenis is not loaded
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.toggle('sticky', window.scrollY > 100);
        }
    }, { passive: true });

    // Fallback Back to Top
    const btnTop = document.getElementById('backToTop');
    if (btnTop) {
        btnTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}
