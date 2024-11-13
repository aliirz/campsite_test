document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        
        // Add error handling for SVG style injection with multiple retries
        const injectStyles = (retryCount = 0, maxRetries = 5) => {
            if (!svgDoc || !svgDoc.documentElement) {
                if (retryCount < maxRetries) {
                    setTimeout(() => injectStyles(retryCount + 1, maxRetries), 100);
                }
                return;
            }

            // Check if styles are already injected
            const existingStyle = svgDoc.querySelector('style');
            if (existingStyle) return;

            try {
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
            } catch (error) {
                console.warn('Style injection attempt failed, retrying...', error);
                if (retryCount < maxRetries) {
                    setTimeout(() => injectStyles(retryCount + 1, maxRetries), 100);
                }
            }
        };

        // Initial style injection with retry mechanism
        setTimeout(injectStyles, 100);
        
        // Select all site elements with correct case-sensitive prefix
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');
        const siteDetails = document.getElementById('siteDetails');
        const siteStatus = document.getElementById('siteStatus');
        const siteType = document.getElementById('siteType');
        const siteCapacity = document.getElementById('siteCapacity');
        const siteFeatures = document.getElementById('siteFeatures');

        // Mock data for site information (in real app, this would come from a database)
        const siteInfo = {
            'Site-A1': {
                type: 'RV Site',
                capacity: '4-6 people',
                status: 'available',
                features: ['Electric Hookup', 'Water Connection', 'Picnic Table', 'Fire Ring']
            },
            'Site-B2': {
                type: 'Tent Site',
                capacity: '2-4 people',
                status: 'occupied',
                features: ['Picnic Table', 'Fire Ring', 'Shade Cover']
            }
        };

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

        // Function to update site information display
        function updateSiteInfo(siteId) {
            const info = siteInfo[siteId] || {
                type: 'Standard Site',
                capacity: '4 people',
                status: 'available',
                features: ['Picnic Table', 'Fire Ring']
            };

            siteStatus.textContent = info.status.charAt(0).toUpperCase() + info.status.slice(1);
            siteStatus.className = `badge ${info.status === 'available' ? 'bg-success' : 'bg-danger'} ms-2`;
            siteType.textContent = info.type;
            siteCapacity.textContent = info.capacity;
            
            // Update features list
            siteFeatures.innerHTML = info.features
                .map(feature => `<li><i class="bi bi-check-circle-fill text-success me-2"></i>${feature}</li>`)
                .join('');

            siteDetails.classList.remove('d-none');
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
                
                // Update site information
                updateSiteInfo(this.id);
                
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
