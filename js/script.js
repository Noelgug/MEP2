document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('inputForm');
    const costForm = document.getElementById('costForm');
    const registrationOutput = document.getElementById('registrationOutput');
    const costOutput = document.getElementById('costOutput');

    function validateAge(age) {
        return !isNaN(age) && age >= 0 && age <= 12;
    }

    function validateForm() {
        const name = document.getElementById('name').value.trim();
        const age = parseInt(document.getElementById('age').value);
        const appointmentDate = document.getElementById('appointment_date').value;

        const errors = [];

        if (!name || name.length < 3 || name.length > 50) {
            errors.push('Name must be between 3 and 50 characters');
        }

        if (!validateAge(age)) {
            errors.push('Age must be between 0 and 12 years');
        }

        const date = new Date(appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        if (!appointmentDate || isNaN(date.getTime())) {
            errors.push('Please enter a valid date');
        } else if (date < today) {
            errors.push('Appointment date cannot be in the past');
        }

        return errors;
    }

    // Add welcome message display
    function checkForReturningUser() {
        const childName = getCookie('child_name');
        const welcomeDiv = document.getElementById('welcomeMessage');
        
        if (!welcomeDiv) return;

        if (childName) {
            try {
                welcomeDiv.innerHTML = `
                    <div class="w3-panel w3-pale-blue">
                        <h3>Welcome back, ${childName}'s parents!</h3>
                    </div>`;
                welcomeDiv.style.display = 'block';
            } catch (error) {
                console.error('Error displaying welcome message:', error);
                welcomeDiv.style.display = 'none';
            }
        } else {
            welcomeDiv.innerHTML = `
                <div class="w3-panel w3-pale-blue">
                    <h3>Welcome to our Childcare Center!</h3>
                </div>`;
            welcomeDiv.style.display = 'block';
        }
    }

    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
            if (cookieName === name) {
                return cookieValue;
            }
        }
        return null;
    }

    // Call on page load
    checkForReturningUser();

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            registrationOutput.innerHTML = `
                <div class="w3-panel w3-pale-red">
                    <h3>Validation Errors:</h3>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>`;
            return;
        }

        const formData = new FormData(registrationForm);

        try {
            const response = await fetch('backend.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                // Force cookie check after successful registration
                setTimeout(checkForReturningUser, 100);
            }
            
            // Create formatted date
            const appointmentDate = new Date(document.getElementById('appointment_date').value)
                .toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });

            // Create detailed confirmation message
            registrationOutput.innerHTML = `
                <div class="w3-panel w3-pale-green w3-padding">
                    <h3>Registration Successful!</h3>
                    <p>Your child <strong>${document.getElementById('name').value}</strong>, 
                    who is <strong>${document.getElementById('age').value}</strong> years old, 
                    has been registered for <strong>${appointmentDate}</strong>. For changes 
                    please call us at +41 12 345 67 89 or send an email to info@kinderhord.ch</p>
                </div>`;
            
            // Update welcome message after successful registration
            checkForReturningUser();
            
            // Copy age value to cost calculation form
            const age = document.getElementById('age').value;
            document.getElementById('child_age').value = age;
            
        } catch (error) {
            registrationOutput.innerHTML = `<p class="w3-text-red">Error: ${error.message}</p>`;
        }
    });

    costForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const childAge = parseInt(document.getElementById('child_age').value);

        if (!validateAge(childAge)) {
            costOutput.innerHTML = '<p class="w3-text-red">Please enter a valid age between 0 and 12 years.</p>';
            return;
        }

        let cost;
        if (childAge <= 3) cost = 80;
        else if (childAge <= 8) cost = 120;
        else cost = 140;

        // Format currency using Intl.NumberFormat
        const formattedCost = new Intl.NumberFormat('de-CH', {
            style: 'currency',
            currency: 'CHF'
        }).format(cost);

        costOutput.innerHTML = `<p class="w3-text-green">Daily Cost: ${formattedCost}</p>`;
    });

    // Weather canvas functionality
    const weatherCanvas = document.getElementById('weatherCanvas');
    const ctx = weatherCanvas.getContext('2d');
    const API_KEY = '2b62dce0a13c7f936725b0912f9e1247';

    async function fetchWeatherData() {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Zurich,CH&units=metric&appid=${API_KEY}`);
            const data = await response.json();
            return {
                temp: data.main.temp,
                cityName: data.name,
                weather: data.weather[0].main
            };
        } catch (error) {
            console.error('Weather API Error:', error);
            return null;
        }
    }

    function drawTemperature(weatherData) {
        ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
        const centerX = weatherCanvas.width / 2;
        const centerY = weatherCanvas.height / 2;
        const radius = Math.min(weatherCanvas.width, weatherCanvas.height) / 2.5;

        // 1. Draw outer dodecagon
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const angle = (i * 2 * Math.PI) / 12;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = '#5C56F0';
        ctx.fill();

        // 2. Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
        ctx.fillStyle = '#4347D9';
        ctx.fill();

        // 3. Draw decorative arcs
        for (let i = 0; i < 12; i++) {
            const angle = (i * 2 * Math.PI) / 12;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.85, angle, angle + Math.PI / 12);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 4. Draw small circles at vertices
        for (let i = 0; i < 12; i++) {
            const angle = (i * 2 * Math.PI) / 12;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }

        // 5. Draw temperature display background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = '#3F41C7';
        ctx.fill();

        // 6. Draw connecting lines
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            ctx.moveTo(centerX, centerY);
            const x = centerX + radius * 0.6 * Math.cos(angle);
            const y = centerY + radius * 0.6 * Math.sin(angle);
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 7. Temperature display
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(weatherData.temp)}°C`, centerX, centerY + 15);

        // 8. Draw title background
        ctx.beginPath();
        ctx.arc(centerX, centerY - radius * 0.5, radius * 0.3, Math.PI, 2 * Math.PI);
        ctx.fillStyle = '#3F41C7';
        ctx.fill();

        // 9. Draw title with city name and weather condition
        ctx.font = '20px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${weatherData.cityName} - ${weatherData.weather}`, centerX, centerY - radius * 0.5);

        // 10. Draw weather advice
        let advice = '';
        if (weatherData.temp <= 15) {
            advice = 'It is very cold at the moment. Don\'t forget to dress your child warmly.';
        } else if (weatherData.temp < 25) {
            advice = 'The weather is mild. Dress your child comfortably and bring a light jacket.';
        } else {
            advice = 'Dress your child for warm weather and apply sunscreen.';
        }

        ctx.font = '16px Arial';
        wrapText(ctx, advice, centerX, centerY + radius * 0.4, radius * 1.5, 25);
    }

    function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, y);
    }

    // Fetch and display weather data
    async function updateWeather() {
        const weatherData = await fetchWeatherData();
        if (weatherData !== null) {
            drawTemperature(weatherData);
        } else {
            ctx.fillStyle = '#333';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Weather data unavailable', weatherCanvas.width/2, weatherCanvas.height/2);
        }
    }

    // Initial weather update
    updateWeather();

    // Update weather every 5 minutes
    setInterval(updateWeather, 300000);
});
