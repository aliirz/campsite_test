document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

        // Function to animate opacity change
        function animateOpacityChange(element, targetOpacity) {
            const currentOpacity = parseFloat(element.style.fillOpacity) || 0.3;
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

        // Function to reset all sites to default opacity with staggered animation
        function resetOpacities() {
            randomizeBtn.disabled = true; // Prevent multiple clicks during animation
            
            campsites.forEach((site, index) => {
                setTimeout(() => {
                    animateOpacityChange(site, 0.3);
                    
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
                        animateOpacityChange(s, 0.3);
                    }
                });
                
                // Add active class to clicked site
                this.classList.add('active');
                animateOpacityChange(this, 1);
            });
        });

        // Add click handler to randomize button
        randomizeBtn.addEventListener('click', resetOpacities);

        // Initial opacity reset
        resetOpacities();
    });
});
