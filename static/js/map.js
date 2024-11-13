document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        
        // Inject styles directly into SVG document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            [id^="Site-"] {
                cursor: pointer !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                transform-origin: center !important;
                transform-box: fill-box !important;
            }

            [id^="Site-"]:hover {
                transform: scale(1.05) !important;
                filter: drop-shadow(0 0 5px #0d6efd) !important;
                fill: #cfe2ff !important;
                stroke: #0d6efd !important;
                stroke-width: 2 !important;
            }

            .active {
                transform: scale(1.05) !important;
                filter: drop-shadow(0 0 5px #0d6efd) !important;
                fill: #cfe2ff !important;
                stroke: #0d6efd !important;
                stroke-width: 2 !important;
            }

            .reduced-opacity {
                fill-opacity: 0.3 !important;
            }

            .site-fade {
                animation: fadeTransition 0.5s ease-in-out;
            }

            @keyframes fadeTransition {
                0% { fill-opacity: var(--previous-opacity); }
                50% { fill-opacity: 0.5; }
                100% { fill-opacity: var(--target-opacity); }
            }
        `;
        svgDoc.head.appendChild(styleSheet);
        
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

        // Update button text
        randomizeBtn.textContent = 'Toggle Site Opacity';

        // Store selected sites
        let selectedRandomSites = [];

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
            element.setAttribute('class', element.getAttribute('class')?.replace('site-fade', '') || '');
            void element.offsetWidth; // Force reflow
            element.setAttribute('class', (element.getAttribute('class') || '') + ' site-fade');
            
            // Set the final opacity after animation
            setTimeout(() => {
                element.style.fillOpacity = targetOpacity;
            }, 500);
        }

        // Function to reset random sites
        function resetRandomSites() {
            if (selectedRandomSites.length > 0) {
                selectedRandomSites.forEach(site => {
                    site.setAttribute('class', site.getAttribute('class')?.replace('reduced-opacity', '') || '');
                    animateOpacityChange(site, 1);
                });
                selectedRandomSites = [];
            }
        }

        // Function to toggle opacity state
        function toggleOpacity() {
            randomizeBtn.disabled = true;
            
            // Select new random sites only if none are currently selected
            if (selectedRandomSites.length === 0) {
                selectedRandomSites = getRandomSites(campsites, 50);
            }
            
            // Toggle opacity for selected sites
            selectedRandomSites.forEach((site, index) => {
                setTimeout(() => {
                    const isReduced = site.getAttribute('class')?.includes('reduced-opacity');
                    
                    if (isReduced) {
                        site.setAttribute('class', site.getAttribute('class')?.replace('reduced-opacity', '') || '');
                        animateOpacityChange(site, 1);
                    } else {
                        site.setAttribute('class', (site.getAttribute('class') || '') + ' reduced-opacity');
                        animateOpacityChange(site, 0.3);
                    }
                    
                    // Enable button after last animation starts
                    if (index === selectedRandomSites.length - 1) {
                        setTimeout(() => {
                            randomizeBtn.disabled = false;
                        }, 500);
                    }
                }, index * 50);
            });
        }

        // Add click handlers to each campsite
        campsites.forEach(site => {
            let lastClickTime = 0;
            
            site.addEventListener('click', function(e) {
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastClickTime;
                
                // Handle double click (if click interval is less than 300ms)
                if (timeDiff < 300) {
                    resetRandomSites();
                    return;
                }
                
                lastClickTime = currentTime;
                
                const siteName = this.id.replace('Site-', 'Site ').toUpperCase();
                console.log(`Clicked ${siteName}`);
                selectedSiteText.textContent = siteName;
                
                // Remove active class from all sites
                campsites.forEach(s => {
                    s.setAttribute('class', s.getAttribute('class')?.replace('active', '') || '');
                    // Keep opacity state for non-selected sites
                    if (s !== this && !s.getAttribute('class')?.includes('reduced-opacity')) {
                        animateOpacityChange(s, 1);
                    }
                });
                
                // Add active class to clicked site and ensure it's fully opaque
                this.setAttribute('class', (this.getAttribute('class') || '') + ' active');
                this.setAttribute('class', this.getAttribute('class')?.replace('reduced-opacity', '') || '');
                animateOpacityChange(this, 1);
            });
        });

        // Add click handler to toggle opacity button
        randomizeBtn.addEventListener('click', toggleOpacity);
        
        // Add double-click handler to toggle button for resetting
        randomizeBtn.addEventListener('dblclick', resetRandomSites);
    });
});
