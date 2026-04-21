from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np
from feature_extraction import extract_features, get_feature_names
import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Phishing URL Detection API",
    description="API for detecting phishing URLs using machine learning.",
    version="1.0.0"
)

# Load model and scaler
MODEL_PATH = "models/best_model.pkl"
SCALER_PATH = "models/scaler.pkl"

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
except Exception as e:
    print(f"Warning: Model or Scaler not found. Run train.py first. Error: {e}")
    model = None
    scaler = None

class URLRequest(BaseModel):
    url: str
    mode: str = "fast"  # 'fast' or 'detailed'

class PredictionResponse(BaseModel):
    probability: float
    message: str
    features: dict = None
    timestamp: str

def log_to_database(url, features, probability, timestamp):
    """
    Logs the prediction to a CSV file for Power BI compatibility.
    """
    import pandas as pd
    log_file = "predictions_log.csv"
    
    # Create dictionary containing all data to log
    log_data = {'timestamp': timestamp, 'url': url, 'probability': probability}
    log_data.update(features)
    
    df = pd.DataFrame([log_data])
    
    if not os.path.exists(log_file):
        df.to_csv(log_file, index=False)
    else:
        df.to_csv(log_file, mode='a', header=False, index=False)

@app.post("/predict", response_model=PredictionResponse)
def predict_url(request: URLRequest):
    if model is None or scaler is None:
        raise HTTPException(status_code=500, detail="Model is not loaded. Please train the model first.")

    url = request.url
    mode = request.mode.lower()
    
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    try:
        # Extract features
        features_dict = extract_features(url)
        feature_names = get_feature_names()
        
        # Ensure features are in the exact order the model expects
        feature_values = [features_dict[name] for name in feature_names]
        
        # Scale features
        features_scaled = scaler.transform([feature_values])
        
        # Predict probability
        # Assuming index 1 is the 'Phishing' class
        prob = model.predict_proba(features_scaled)[0][1] * 100
        prob = round(prob, 2)
        
        timestamp = datetime.datetime.now().isoformat()
        
        # Log to DB (CSV) for Power BI
        log_to_database(url, features_dict, prob, timestamp)

        # Formulate response
        response = PredictionResponse(
            probability=prob,
            message=f"The URL has a phishing probability of {prob}%. You may consider a threshold like 50% to classify.",
            timestamp=timestamp
        )

        if mode == "detailed":
            response.features = features_dict

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during prediction: {str(e)}")

# To run the API, use: uvicorn api:app --reload
