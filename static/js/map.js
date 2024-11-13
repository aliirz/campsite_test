document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

        // Update button text
        randomizeBtn.textContent = 'Toggle Site Opacity';

        // Store selected sites
        let selectedRandomSites = null;

        // Function to get random sites
        function getRandomSites(sites, count) {
            const siteArray = Array.from(sites);
            const shuffled = [...siteArray].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        // Function to animate opacity change
        function animateOpacityChange(element, targetOpacity) {
            const currentOpacity = parseFloat(element.style.fillOpacity) || 1;
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

        // Function to toggle opacity state
        function toggleOpacity() {
            randomizeBtn.disabled = true; // Prevent multiple clicks during animation
            
            // If no sites are selected or all sites are at default opacity, select new random sites
            if (!selectedRandomSites || !selectedRandomSites[0].classList.contains('reduced-opacity')) {
                // Reset previous selection if exists
                if (selectedRandomSites) {
                    selectedRandomSites.forEach(site => {
                        site.classList.remove('reduced-opacity');
                        animateOpacityChange(site, 1);
                    });
                }
                // Select new random sites
                selectedRandomSites = getRandomSites(campsites, 20);
            }
            
            // Toggle opacity for selected sites only
            selectedRandomSites.forEach((site, index) => {
                setTimeout(() => {
                    const isReduced = site.classList.contains('reduced-opacity');
                    
                    if (isReduced) {
                        site.classList.remove('reduced-opacity');
                        animateOpacityChange(site, 1);
                        
                        // Reset selection when all sites return to default
                        if (index === selectedRandomSites.length - 1) {
                            selectedRandomSites = null;
                        }
                    } else {
                        site.classList.add('reduced-opacity');
                        animateOpacityChange(site, 0.3);
                    }
                    
                    // Enable button after last animation starts
                    if (index === selectedRandomSites.length - 1) {
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
                    // Keep opacity state for non-selected sites
                    if (s !== this && !s.classList.contains('reduced-opacity')) {
                        animateOpacityChange(s, 1);
                    }
                });
                
                // Add active class to clicked site and ensure it's fully opaque
                this.classList.add('active');
                this.classList.remove('reduced-opacity');
                animateOpacityChange(this, 1);
            });
        });

        // Add click handler to toggle opacity button
        randomizeBtn.addEventListener('click', toggleOpacity);
    });
});
