document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        
        // Add error handling for SVG style injection
        if (svgDoc && svgDoc.documentElement) {
            const styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
            styleElement.textContent = `
                [id^="Site-"] {
                    cursor: pointer;
                }

                .active {
                    fill: #cfe2ff;
                    stroke: #0d6efd;
                    stroke-width: 2;
                }

                .reduced-opacity {
                    fill-opacity: 0.3;
                }
            `;
            svgDoc.documentElement.appendChild(styleElement);
        }
        
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

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
            element.style.fillOpacity = targetOpacity;
        }

        // Function to reset random sites
        function resetRandomSites() {
            if (selectedRandomSites.length > 0) {
                selectedRandomSites.forEach(site => {
                    site.classList.remove('reduced-opacity');
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
                    const classList = site.classList;
                    const isReduced = classList.contains('reduced-opacity');
                    
                    if (isReduced) {
                        classList.remove('reduced-opacity');
                        animateOpacityChange(site, 1);
                    } else {
                        classList.add('reduced-opacity');
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
                selectedSiteText.textContent = siteName;
                
                // Remove active class from all sites
                campsites.forEach(s => {
                    s.classList.remove('active');
                    if (s !== this && !s.classList.contains('reduced-opacity')) {
                        animateOpacityChange(s, 1);
                    }
                });
                
                // Add active class to clicked site
                this.classList.add('active');
                this.classList.remove('reduced-opacity');
                animateOpacityChange(this, 1);
            });
        });

        // Add click handler to toggle opacity button
        randomizeBtn.addEventListener('click', toggleOpacity);
        
        // Add double-click handler to toggle button for resetting
        randomizeBtn.addEventListener('dblclick', resetRandomSites);
    });
});
