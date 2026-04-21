import joblib
from feature_extraction import extract_features, get_feature_names

url = "http://google.com"

# In train.py we trained all models but saved SVM as best_model.pkl.
# Wait, train.py only saved the best model. To use RF, I'd have to retrain it and save it.
# Let's write a script to just train RF on the extracted dataset and test it.
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv('urldata_extracted.csv')
X = df[get_feature_names()]
y = df['target']

scaler = joblib.load('models/scaler.pkl')
X_scaled = scaler.transform(X)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_scaled, y)

features_dict = extract_features(url)
features_values = [features_dict[name] for name in get_feature_names()]
features_scaled = scaler.transform([features_values])

prob = rf.predict_proba(features_scaled)[0][1] * 100
print(f"RF Probability for {url}: {prob}%")
