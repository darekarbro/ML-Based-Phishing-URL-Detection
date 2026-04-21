

import os
from API import get_prediction

# path to trained model (relative path from current directory)
model_path = os.path.join(os.path.dirname(__file__), "models", "Malicious_URL_Prediction.h5")

# Test URLs
test_urls = [
    "https://msbte.ac.in/",
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "instagram.com/",
    "https://free-itunes-code.com/",  # Example suspicious URL
]

print("=" * 60)
print("Phishing URL Detection System")
print("=" * 60)

# Test each URL
for url in test_urls:
    print(f"\n🔍 Testing: {url}")
    try:
        prediction = get_prediction(url, model_path)
        print(f"✅ Result: {prediction}% chance of being malicious")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

print("\n" + "=" * 60)

