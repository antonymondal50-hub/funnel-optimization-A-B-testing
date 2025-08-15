import numpy as np
from scipy.stats import norm
import json

# Load simulated data from JSON file
def load_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

# Perform a Z-test for two population proportions
def z_test_proportions(conversions_A, total_A, conversions_B, total_B):
    # Calculate conversion rates
    p_A = conversions_A / total_A
    p_B = conversions_B / total_B
    
    # Calculate pooled proportion
    p_pooled = (conversions_A + conversions_B) / (total_A + total_B)
    
    # Calculate standard error
    se = np.sqrt(p_pooled * (1 - p_pooled) * (1/total_A + 1/total_B))
    
    # Calculate Z-score
    z_score = (p_B - p_A) / se
    
    # Calculate p-value (two-tailed test)
    p_value = 2 * (1 - norm.cdf(abs(z_score)))
    
    return z_score, p_value, p_A, p_B

if __name__ == "__main__":
    data = load_data('../data/simulated_data.json')
    
    control = data['control']
    variant = data['variant']

    print("### A/B Test Statistical Analysis: Visit to Signup ###\n")
    
    # Extract data for the Visit to Signup stage
    conversions_A = control['signups']
    total_A = control['total']
    
    conversions_B = variant['signups']
    total_B = variant['total']

    # Perform the Z-test
    z_score, p_value, p_A, p_B = z_test_proportions(conversions_A, total_A, conversions_B, total_B)
    
    # Check for statistical significance
    alpha = 0.05
    is_significant = p_value < alpha

    print(f"Control Group (A): {conversions_A} conversions out of {total_A} visitors ({p_A:.2%})")
    print(f"Variant Group (B): {conversions_B} conversions out of {total_B} visitors ({p_B:.2%})")
    print("-" * 50)
    print(f"Z-Score: {z_score:.4f}")
    print(f"P-value: {p_value:.6f}")
    print(f"Statistical Significance (alpha={alpha}): {'Yes' if is_significant else 'No'}")
    print("-" * 50)

    # Decision Framework
    if is_significant and p_B > p_A:
        print("Decision: Roll Out! ✅")
        print("The uplift is statistically significant and the variant is performing better.")
    elif is_significant and p_B < p_A:
        print("Decision: Rollback ❌")
        print("The uplift is statistically significant but the variant is performing worse.")
    else:
        print("Decision: Inconclusive or Iterate ⚠️")
        print("The results are not statistically significant. Consider running for longer or designing a new test.")