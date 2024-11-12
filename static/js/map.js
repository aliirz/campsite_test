document.addEventListener('DOMContentLoaded', function() {
    // Wait for SVG to load through object tag
    const mapObject = document.getElementById('campMap');
    
    mapObject.addEventListener('load', function() {
        const svgDoc = mapObject.contentDocument;
        // Select all site elements (assuming they have IDs starting with "site_")
        const campsites = svgDoc.querySelectorAll('[id^="site_"]');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const selectedSiteText = document.getElementById('selectedSite');

        // Function to generate random opacity between 0.3 and 1
        function getRandomOpacity() {
            return Math.random() * 0.7 + 0.3; // Range: 0.3 to 1.0
        }

        // Function to randomize opacities of all campsites
        function randomizeOpacities() {
            campsites.forEach(site => {
                site.style.fillOpacity = getRandomOpacity();
            });
        }

        // Add click handlers to each campsite
        campsites.forEach(site => {
            site.addEventListener('click', function(e) {
                const siteName = this.id.replace('site_', 'Site ').toUpperCase();
                console.log(`Clicked ${siteName}`);
                selectedSiteText.textContent = siteName;
                
                // Remove active class from all sites
                campsites.forEach(s => s.classList.remove('active'));
                // Add active class to clicked site
                this.classList.add('active');
            });
        });

        // Add click handler to randomize button
        randomizeBtn.addEventListener('click', randomizeOpacities);

        // Initial randomization
        randomizeOpacities();
    });
});
