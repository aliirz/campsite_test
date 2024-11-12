document.addEventListener('DOMContentLoaded', function() {
    const campsites = document.querySelectorAll('.campsite');
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
            const siteName = this.getAttribute('data-name') || 'Unknown Site';
            console.log(`Clicked campsite: ${siteName}`);
            selectedSiteText.textContent = siteName;
            
            // Visual feedback
            campsites.forEach(s => s.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add click handler to randomize button
    randomizeBtn.addEventListener('click', randomizeOpacities);

    // Initial randomization
    randomizeOpacities();
});
