import joblib
import os
import sys
from feature_extraction import extract_features, get_feature_names

url = "http://google.com"

# train.py saves only the best model as best_model.pkl.
# This script trains a standalone Random Forest on the extracted dataset for quick testing.
# Note: Run train.py first to generate urldata_extracted.csv and models/scaler.pkl.
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

def main():
    extracted_path = 'urldata_extracted.csv'
    scaler_path = 'models/scaler.pkl'

    if not os.path.exists(extracted_path):
        print("Error: 'urldata_extracted.csv' not found. Run 'python train.py' first.")
        sys.exit(1)
    if not os.path.exists(scaler_path):
        print("Error: 'models/scaler.pkl' not found. Run 'python train.py' first.")
        sys.exit(1)

    df = pd.read_csv(extracted_path)
    feature_names = get_feature_names()
    X = df[feature_names]
    y = df['target']

    scaler = joblib.load(scaler_path)
    X_scaled = scaler.transform(X)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_scaled, y)

    features_dict = extract_features(url)
    features_values = [features_dict[name] for name in feature_names]
    feature_df = pd.DataFrame([features_values], columns=feature_names)
    features_scaled = scaler.transform(feature_df)

    prob = rf.predict_proba(features_scaled)[0][1] * 100
    print(f"RF Probability for {url}: {prob}%")


if __name__ == "__main__":
    main()
