# Low-Level Design (LLD): Phishing URL Detection

## 1. Module Specifications

### 1.1 `feature_extraction.py`
This module contains the mathematical logic for feature engineering.
* **`extract_features(url)`**: Returns a dict of 20 heuristic features.
* **`extract_features_parallel(urls)`**: Uses `concurrent.futures.ProcessPoolExecutor` to map `extract_features` across multiple CPU cores for batch processing.
* **Libraries**: `urllib.parse`, `tldextract`, `re`.

### 1.2 `Training_Pipeline.ipynb`
The research workspace.
* **`RandomizedSearchCV`**: Used for XGBoost hyperparameter optimization.
* **Caching**: Implements a lightweight CSV caching check to skip feature extraction if `urldata_extracted.csv` already exists and is up to date.

### 1.3 `API.py`
The production web server.
* **Endpoint `/predict`**:
  - `Input`: URL string, mode (fast/detailed).
  - `Process`: 
    1. Extract features using `feature_extraction.py`.
    2. Convert to DataFrame (preserving column order).
    3. Scale via `joblib.load('models/scaler.pkl')`.
    4. Predict via `joblib.load('models/best_model.pkl')`.
  - `Output`: JSON response with timestamp and probability.

## 2. Model Configuration (XGBoost)
* **Objective**: `binary:logistic`
* **Tree Method**: `hist` (Histogram-based algorithm for memory efficiency).
* **Tuned Parameters**: `n_estimators`, `max_depth`, `learning_rate`.

## 3. Storage Format
* Models are stored as `.pkl` (Python Pickle) files for fast serialization/deserialization.
* Logs are stored in CSV format for direct compatibility with Power BI.
