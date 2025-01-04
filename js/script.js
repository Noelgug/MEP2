document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inputForm');
    const outputArea = document.getElementById('outputArea');

    function validateForm() {
        const field1 = document.getElementById('field1').value.trim();
        const field2 = parseInt(document.getElementById('field2').value);
        const field3 = document.getElementById('field3').value;

        const errors = [];

        if (field1.length < 3 || field1.length > 50) {
            errors.push('Field 1 must be between 3 and 50 characters');
        }

        if (isNaN(field2) || field2 < 0 || field2 > 100) {
            errors.push('Field 2 must be a number between 0 and 100');
        }

        const date = new Date(field3);
        if (isNaN(date.getTime())) {
            errors.push('Field 3 must be a valid date');
        }

        return errors;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (errors.length > 0) {
            outputArea.innerHTML = `
                <div class="w3-panel w3-pale-red">
                    <h3>Validation Errors:</h3>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>`;
            return;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch('backend.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            outputArea.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        } catch (error) {
            outputArea.innerHTML = `<p class="w3-text-red">Error: ${error.message}</p>`;
        }
    });
});
