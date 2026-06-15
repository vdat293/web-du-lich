document.addEventListener('DOMContentLoaded', function() {
  // Scrollspy Implementation
  const sections = document.querySelectorAll('section, footer');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -55% 0px', // Target the reading sweet spot (upper half of viewport)
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all links
        navLinks.forEach(link => {
          link.classList.remove('active');
          link.classList.remove('text-primary'); // Remove Tailwind primary color if added directly
        });

        // Add active class to the corresponding link
        const id = entry.target.getAttribute('id');
        if (id) {
          const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Smooth scrolling for anchor links (fallback if CSS scroll-behavior doesn't work for some reason)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
});
