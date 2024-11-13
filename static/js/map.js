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
                        fill: var(--bs-dark);
                        stroke: var(--bs-secondary);
                        stroke-width: 1;
                    }

                    [id^="Site-"]:hover:not(.active) {
                        fill: var(--bs-secondary-bg-subtle);
                        stroke: var(--bs-secondary);
                        stroke-width: 1.5;
                    }

                    .active {
                        fill: #60a5fa;
                        stroke: #2563eb;
                        stroke-width: 1.5;
                    }

                    .reduced-opacity {
                        fill-opacity: 0.3;
                    }
                `;
                
                const svgRoot = svgDoc.documentElement;
                if (svgRoot) {
                    svgRoot.appendChild(styleElement);
                    console.log('SVG styles successfully injected');
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

        // Function to animate opacity change
        function animateOpacityChange(element, targetOpacity) {
            element.style.fillOpacity = targetOpacity;
        }

        // Function to reset random sites
        function resetRandomSites() {
            if (isAnimating) return;
            
            if (selectedRandomSites.length > 0) {
                selectedRandomSites.forEach(site => {
                    site.classList.remove('reduced-opacity');
                    animateOpacityChange(site, 1);
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
                selectedRandomSites = getRandomSites(campsites, 50);
            }
            
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
                    
                    // Update site info if this is the currently selected site
                    if (site === currentlySelectedSite) {
                        updateSiteInfo(site.id, site);
                        // Remove active class if site becomes unavailable
                        if (!isReduced) {
                            site.classList.remove('active');
                            currentlySelectedSite = null;
                        }
                    }
                    
                    if (index === selectedRandomSites.length - 1) {
                        setTimeout(() => {
                            randomizeBtn.disabled = false;
                            isAnimating = false;
                        }, 500);
                    }
                }, index * 50);
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
                selectedSiteText.textContent = siteName;
                
                // Update site information
                updateSiteInfo(this.id, this);
                
                // Remove active class from previous selection
                if (currentlySelectedSite) {
                    currentlySelectedSite.classList.remove('active');
                }
                
                // Update current selection only if site is available
                if (!this.classList.contains('reduced-opacity')) {
                    currentlySelectedSite = this;
                    this.classList.add('active');
                } else {
                    currentlySelectedSite = null;
                }
            });
        });

        // Add click handler to toggle opacity button
        randomizeBtn.addEventListener('click', toggleOpacity);
        
        // Add double-click handler to toggle button for resetting
        randomizeBtn.addEventListener('dblclick', resetRandomSites);
    });
});
