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
            return data.main.temp;
        } catch (error) {
            console.error('Weather API Error:', error);
            return null;
        }
    }

    function drawTemperature(temp) {
        ctx.clearRect(0, 0, weatherCanvas.width, weatherCanvas.height);
        
        // Background
        ctx.fillStyle = '#5C56F0';
        ctx.fillRect(0, 0, weatherCanvas.width, weatherCanvas.height);

        // Temperature display
        ctx.fillStyle = '#FFF';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(temp)}°C`, weatherCanvas.width/2, weatherCanvas.height/2);

        // Label
        ctx.font = '24px Arial';
        ctx.fillText('Current Temperature in Zurich', weatherCanvas.width/2, weatherCanvas.height/2 - 50);

        // Weather advice
        ctx.font = '16px Arial';
        let advice = '';
        if (temp <= 15) {
            advice = 'It is very cold at the moment. Don\'t forget to dress your child warmly.';
        } else if (temp < 25) {
            advice = 'The weather is mild at the moment. Dress your child comfortably, and consider bringing a light jacket just in case.';
        } else {
            advice = 'Make sure to dress your child appropriately for warm weather and apply sunscreen for protection.';
        }

        // Split advice text into multiple lines if too long
        const maxWidth = weatherCanvas.width - 40;
        let words = advice.split(' ');
        let line = '';
        let y = weatherCanvas.height/2 + 50;

        words.forEach(word => {
            let testLine = line + word + ' ';
            let metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== '') {
                ctx.fillText(line, weatherCanvas.width/2, y);
                line = word + ' ';
                y += 25;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line, weatherCanvas.width/2, y);
    }

    // Fetch and display weather data
    async function updateWeather() {
        const temperature = await fetchWeatherData();
        if (temperature !== null) {
            drawTemperature(temperature);
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
