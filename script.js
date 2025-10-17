document.addEventListener('DOMContentLoaded', function handleDOMContentLoaded() {
    const bodyElement = document.body;
    const menuToggleButton = document.getElementById('menu-toggle');
    const mobileNavElement = document.getElementById('mobile-nav');

    const desktopNavButtons = Array.from(document.querySelectorAll('.nav-item'));
    const mobileNavButtons = Array.from(document.querySelectorAll('.mobile-nav-item'));

    const primaryCtaButton = document.querySelector('.btn.btn-primary[data-action="contact"]');
    const outlineCtaButton = document.querySelector('.btn.btn-outline');

    function scrollToSectionById(sectionId) {
        const targetElement = document.getElementById(sectionId);
        if (!targetElement) return;
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Mobile menu toggle
    if (menuToggleButton) {
        menuToggleButton.addEventListener('click', function onMenuToggleClick() {
            bodyElement.classList.toggle('nav-open');
        });
    }

    // Close mobile nav when clicking a menu item
    function handleNavItemClick(event) {
        const button = event.currentTarget;
        const sectionId = button.getAttribute('data-section');
        if (sectionId) {
            scrollToSectionById(sectionId);
        }
        bodyElement.classList.remove('nav-open');
    }

    desktopNavButtons.forEach(function attachDesktopNav(button) {
        button.addEventListener('click', handleNavItemClick);
    });

    mobileNavButtons.forEach(function attachMobileNav(button) {
        button.addEventListener('click', handleNavItemClick);
    });

    // CTAs
    // if (primaryCtaButton) {
    //     primaryCtaButton.addEventListener('click', function onPrimaryCtaClick() {
    //         scrollToSectionById('contact');
    //     });
    // }
    if (outlineCtaButton) {
        outlineCtaButton.addEventListener('click', function onOutlineCtaClick() {
            scrollToSectionById('portfolio');
        });
    }

    // Close mobile nav with Escape
    document.addEventListener('keydown', function onDocumentKeydown(event) {
        if (event.key === 'Escape') {
            bodyElement.classList.remove('nav-open');
        }
    });

    // Click outside to close (basic)
    document.addEventListener('click', function onDocumentClick(event) {
        if (!bodyElement.classList.contains('nav-open')) return;
        const isClickInsideNav = mobileNavElement && mobileNavElement.contains(event.target);
        const isClickToggle = menuToggleButton && menuToggleButton.contains(event.target);
        if (!isClickInsideNav && !isClickToggle) {
            bodyElement.classList.remove('nav-open');
        }
    });

    // Reveal on scroll with IntersectionObserver
    const revealTargets = [];
    const sectionSelectors = [
        '.section-title',
        '.hero-text',
        '.hero-buttons',
        '.social-links',
        '.about-content p',
        '.image-placeholder',
        '.skills-grid',
        '.skill-item',
        '.tools-grid .tool-item',
        '.portfolio-grid .project-card',
        '.contact-content',
        '.contact-item',
        '.contact-form'
    ];

    sectionSelectors.forEach(function registerSelector(selector) {
        document.querySelectorAll(selector).forEach(function pushEl(el) {
            el.classList.add('reveal');
            revealTargets.push(el);
        });
    });

    const observer = new IntersectionObserver(function onIntersect(entries) {
        entries.forEach(function applyEntry(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach(function observeEl(el) { observer.observe(el); });

    // Contact form handling with Web3Forms
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        const statusElement = contactForm.querySelector('.form-status');
        function setFormStatus(message, type) {
            if (!statusElement) return;
            statusElement.textContent = message;
            statusElement.classList.remove('status-success', 'status-error');
            if (type === 'success') {
                statusElement.classList.add('status-success');
            } else if (type === 'error') {
                statusElement.classList.add('status-error');
            }
        }

        contactForm.addEventListener('submit', function handleFormSubmit(event) {
            event.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                setFormStatus('Please fill in all fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setFormStatus('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            setFormStatus('', '');
            
            // Debug: Log form data
            console.log('Form data being sent:', {
                name: name,
                email: email,
                subject: subject,
                message: message
            });
            
            // Improve deliverability/reply behavior
            formData.set('reply_to', email);
            formData.set('from_name', name);

            // Submit form using fetch
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Web3Forms response:', data);
                if (data.success) {
                    // Success
                    setFormStatus('Thank you! Your message has been sent successfully.', 'success');
                    contactForm.reset();
                } else {
                    // Error
                    setFormStatus('Sorry, there was an error sending your message. Please try again.', 'error');
                    console.error('Web3Forms Error:', data);
                }
            })
            .catch(error => {
                // Network error
                setFormStatus('Sorry, there was an error sending your message. Please try again.', 'error');
                console.error('Web3Forms Error:', error);
            })
            .finally(() => {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }
});

