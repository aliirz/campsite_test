document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    let currentlySelectedSite = null;
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        
        // Add error handling for SVG style injection with multiple retries
        function injectStyles(retryCount = 0, maxRetries = 5) {
            if (!svgDoc?.documentElement?.ownerDocument?.documentElement) {
                if (retryCount < maxRetries) {
                    console.log(`Retry ${retryCount + 1}: Waiting for SVG document...`);
                    setTimeout(() => injectStyles(retryCount + 1, maxRetries), 200);
                }
                return;
            }

            try {
                // Check if styles are already injected
                if (svgDoc.querySelector('style')) return;

                const styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
                styleElement.textContent = `
                    [id^="Site-"] {
                        cursor: pointer;
                        fill: #2d3748;
                        stroke: #4a5568;
                        stroke-width: 1;
                        user-select: none;
                    }

                    [id^="Site-"] text {
                        pointer-events: none;
                        user-select: none;
                        transition: opacity 0.3s ease;
                    }

                    [id^="Site-"].active:not(.reduced-opacity) {
                        fill: #3b82f6 !important;
                        stroke: #1d4ed8 !important;
                        stroke-width: 2 !important;
                    }

                    .reduced-opacity {
                        fill-opacity: 0.3;
                    }

                    .reduced-opacity text {
                        opacity: 0 !important;
                    }
                `;
                
                const svgRoot = svgDoc.documentElement;
                if (svgRoot) {
                    svgRoot.appendChild(styleElement);
                    console.log('SVG styles successfully injected');
                    
                    // Add pointer-events style to SVG root
                    svgRoot.style.pointerEvents = 'none';
                    
                    // Enable pointer events only for interactive elements
                    const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
                    campsites.forEach(site => {
                        site.style.pointerEvents = 'all';
                    });
                }
            } catch (error) {
                console.warn('Style injection failed:', error);
                if (retryCount < maxRetries) {
                    setTimeout(() => injectStyles(retryCount + 1, maxRetries), 200);
                }
            }
        }

        // Initial style injection with delay to ensure SVG is loaded
        setTimeout(() => {
            injectStyles();
        }, 100);
        
        // Select all site elements
        const campsites = svgDoc.querySelectorAll('[id^="Site-"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');
        const siteDetails = document.getElementById('siteDetails');
        const siteStatus = document.getElementById('siteStatus');
        const siteType = document.getElementById('siteType');
        const siteCapacity = document.getElementById('siteCapacity');
        const siteFeatures = document.getElementById('siteFeatures');

        // Mock data for site information
        const siteInfo = {
            'Site-A1': {
                type: 'RV Site',
                capacity: '4-6 people',
                features: ['Electric Hookup', 'Water Connection', 'Picnic Table', 'Fire Ring']
            },
            'Site-B2': {
                type: 'Tent Site',
                capacity: '2-4 people',
                features: ['Picnic Table', 'Fire Ring', 'Shade Cover']
            }
        };

        // Store selected sites
        let selectedRandomSites = [];
        let isAnimating = false;

        // Function to get random sites
        function getRandomSites(sites, count) {
            const siteArray = Array.from(sites);
            const shuffled = [...siteArray].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        // Function to update site opacity
        function updateSiteOpacity(site, isReduced) {
            if (isReduced) {
                site.classList.add('reduced-opacity');
            } else {
                site.classList.remove('reduced-opacity');
            }
        }

        // Function to reset random sites
        function resetRandomSites() {
            if (isAnimating) return;
            
            if (selectedRandomSites.length > 0) {
                selectedRandomSites.forEach(site => {
                    updateSiteOpacity(site, false);
                });
                selectedRandomSites = [];
                
                // Update site info if currently selected site was affected
                if (currentlySelectedSite) {
                    updateSiteInfo(currentlySelectedSite.id, currentlySelectedSite);
                }
            }
        }

        // Function to update site information display
        function updateSiteInfo(siteId, element) {
            const info = siteInfo[siteId] || {
                type: 'Standard Site',
                capacity: '4 people',
                features: ['Picnic Table', 'Fire Ring']
            };
            
            const isUnavailable = element.classList.contains('reduced-opacity');
            const status = isUnavailable ? 'unavailable' : 'available';
            
            siteStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            siteStatus.className = `badge ${status === 'available' ? 'bg-success' : 'bg-danger'} ms-2`;
            siteType.textContent = info.type;
            siteCapacity.textContent = info.capacity;
            
            siteFeatures.innerHTML = info.features
                .map(feature => `<li><i class="bi bi-check-circle-fill text-success me-2"></i>${feature}</li>`)
                .join('');

            siteDetails.classList.remove('d-none');
        }

        // Function to toggle opacity state
        function toggleOpacity() {
            if (isAnimating) return;
            
            randomizeBtn.disabled = true;
            isAnimating = true;
            
            if (selectedRandomSites.length === 0) {
                selectedRandomSites = getRandomSites(campsites, Math.ceil(campsites.length / 2));
            }
            
            selectedRandomSites.forEach((site, index) => {
                setTimeout(() => {
                    const isReduced = site.classList.contains('reduced-opacity');
                    updateSiteOpacity(site, !isReduced);
                    
                    // Update site info if this is the currently selected site
                    if (site === currentlySelectedSite) {
                        updateSiteInfo(site.id, site);
                    }
                    
                    if (index === selectedRandomSites.length - 1) {
                        setTimeout(() => {
                            randomizeBtn.disabled = false;
                            isAnimating = false;
                        }, 100);
                    }
                }, index * 25); // Reduced delay between sites
            });
        }

        // Add click handlers to each campsite
        campsites.forEach(site => {
            let lastClickTime = 0;
            
            site.addEventListener('click', function(e) {
                if (isAnimating) return;
                
                const currentTime = new Date().getTime();
                const timeDiff = currentTime - lastClickTime;
                
                if (timeDiff < 300) {
                    resetRandomSites();
                    return;
                }
                
                lastClickTime = currentTime;
                
                const siteName = this.id.replace('Site-', 'Site ').toUpperCase();
                
                if (!this.classList.contains('reduced-opacity')) {
                    // Clear previous selection
                    if (currentlySelectedSite && currentlySelectedSite !== this) {
                        currentlySelectedSite.classList.remove('active');
                    }
                    
                    // Toggle selection on current site
                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                        currentlySelectedSite = null;
                        selectedSiteText.textContent = 'None';
                    } else {
                        this.classList.add('active');
                        currentlySelectedSite = this;
                        selectedSiteText.textContent = siteName;
                    }
                } else {
                    // Clear selection if clicking unavailable site
                    if (currentlySelectedSite) {
                        currentlySelectedSite.classList.remove('active');
                        currentlySelectedSite = null;
                        selectedSiteText.textContent = 'None';
                    }
                }
                
                // Update site information
                updateSiteInfo(this.id, this);
            });
        });

        // Add click handler to toggle opacity button
        randomizeBtn.addEventListener('click', toggleOpacity);
        
        // Add double-click handler to toggle button for resetting
        randomizeBtn.addEventListener('dblclick', resetRandomSites);
    });
});
