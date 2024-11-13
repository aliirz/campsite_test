document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

        // Function to generate random opacity between 0.3 and 1
        function getRandomOpacity() {
            return Math.random() * 0.7 + 0.3; // Range: 0.3 to 1.0
        }

        // Function to animate opacity change
        function animateOpacityChange(element, targetOpacity) {
            const currentOpacity = parseFloat(element.style.fillOpacity) || 0.7;
            element.style.setProperty('--previous-opacity', currentOpacity);
            element.style.setProperty('--target-opacity', targetOpacity);
            
            // Remove and re-add animation class to trigger it
            element.classList.remove('site-fade');
            void element.offsetWidth; // Force reflow
            element.classList.add('site-fade');
            
            // Set the final opacity after animation
            setTimeout(() => {
                element.style.fillOpacity = targetOpacity;
            }, 500);
        }

        // Function to randomize opacities of all campsites with staggered animation
        function randomizeOpacities() {
            randomizeBtn.disabled = true; // Prevent multiple clicks during animation
            
            campsites.forEach((site, index) => {
                setTimeout(() => {
                    const newOpacity = getRandomOpacity();
                    animateOpacityChange(site, newOpacity);
                    
                    // Enable button after last animation starts
                    if (index === campsites.length - 1) {
                        setTimeout(() => {
                            randomizeBtn.disabled = false;
                        }, 500);
                    }
                }, index * 50); // Stagger each site's animation by 50ms
            });
        }

        // Add click handlers to each campsite
        campsites.forEach(site => {
            site.addEventListener('click', function(e) {
                const siteName = this.id.replace('Site-', 'Site ').toUpperCase();
                console.log(`Clicked ${siteName}`);
                selectedSiteText.textContent = siteName;
                
                // Remove active class from all sites
                campsites.forEach(s => {
                    s.classList.remove('active');
                    // Reset opacity for non-selected sites
                    if (s !== this) {
                        animateOpacityChange(s, 0.7);
                    }
                });
                
                // Add active class to clicked site
                this.classList.add('active');
                animateOpacityChange(this, 1);
            });
        });

        // Add click handler to randomize button
        randomizeBtn.addEventListener('click', randomizeOpacities);

        // Initial randomization
        randomizeOpacities();
    });
});
