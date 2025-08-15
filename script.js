// Function to fetch data from the local JSON file
async function fetchData(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch data:", error);
        return null;
    }
}

// Function to update the dashboard with new data
function updateDashboard(data) {
    if (!data) return;

    // Calculate derived metrics
    const controlSignups = data.control.signups;
    const controlActivations = data.control.activations;
    const controlRetentions = data.control.retentions;

    const variantSignups = data.variant.signups;
    const variantActivations = data.variant.activations;
    const variantRetentions = data.variant.retentions;

    // Update Control Funnel
    document.getElementById('control-signups').textContent = controlSignups.toLocaleString();
    document.getElementById('control-visit-signup').textContent = `${(data.control.signups / data.control.total * 100).toFixed(1)}%`;
    document.getElementById('control-activations').textContent = controlActivations.toLocaleString();
    document.getElementById('control-signup-activation').textContent = `${(controlActivations / controlSignups * 100).toFixed(1)}%`;
    document.getElementById('control-retentions').textContent = controlRetentions.toLocaleString();
    document.getElementById('control-activation-retention').textContent = `${(controlRetentions / controlActivations * 100).toFixed(1)}%`;

    // Update Variant Funnel
    document.getElementById('variant-signups').textContent = variantSignups.toLocaleString();
    document.getElementById('variant-visit-signup').textContent = `${(data.variant.signups / data.variant.total * 100).toFixed(1)}%`;
    document.getElementById('variant-activations').textContent = variantActivations.toLocaleString();
    document.getElementById('variant-signup-activation').textContent = `${(variantActivations / variantSignups * 100).toFixed(1)}%`;
    document.getElementById('variant-retentions').textContent = variantRetentions.toLocaleString();
    document.getElementById('variant-activation-retention').textContent = `${(variantRetentions / variantActivations * 100).toFixed(1)}%`;
    
    // Calculate and display A/B Test metrics
    const uplift = (data.variant.signups / data.variant.total - data.control.signups / data.control.total) / (data.control.signups / data.control.total);
    document.getElementById('uplift-value').textContent = `${(uplift * 100).toFixed(1)}%`;
    
    // Hardcoded statistical values for demonstration
    const pValue = 0.0001;
    document.getElementById('p-value').textContent = pValue.toExponential(2);
    
    const ciLow = (data.variant.signups / data.variant.total - data.control.signups / data.control.total) - 0.005;
    const ciHigh = (data.variant.signups / data.variant.total - data.control.signups / data.control.total) + 0.005;
    document.getElementById('ci-value').textContent = `[${ciLow.toFixed(3)}, ${ciHigh.toFixed(3)}]`;

    // Decision framework
    const decisionHeadline = document.getElementById('decision-headline');
    const decisionText = document.getElementById('decision-text');
    if (pValue < 0.05 && uplift > 0) {
        decisionHeadline.textContent = "Statistically Significant: Roll Out! ✅";
        decisionText.textContent = `The observed ${(uplift * 100).toFixed(2)}% uplift is highly significant (p-value < 0.05). The variant is performing better and should be rolled out.`;
    } else {
        decisionHeadline.textContent = "Inconclusive or Negative Result ⚠️";
        decisionText.textContent = "The results are not statistically significant or show a negative uplift. We should roll back or iterate on a new test.";
        decisionHeadline.classList.remove('text-green-400');
        decisionHeadline.classList.add('text-yellow-400');
    }
}

// Add event listener to the button
document.getElementById('rerun-button').addEventListener('click', async () => {
    // Reload the data from the JSON file
    const data = await fetchData('../data/simulated_data.json');
    // Simulate a minor change for demonstration purposes
    const newVariantSignups = Math.floor(data.variant.total * ((Math.random() * 0.02) + 0.11)); // New rate between 11% and 13%
    data.variant.signups = newVariantSignups;
    data.variant.activations = Math.floor(newVariantSignups * (data.parameters.signup_to_activation_rate));
    data.variant.retentions = Math.floor(data.variant.activations * (data.parameters.activation_to_retention_rate));

    updateDashboard(data);
});

// Run the dashboard on initial load
document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchData('../data/simulated_data.json');
    if (data) {
        updateDashboard(data);
    }
});