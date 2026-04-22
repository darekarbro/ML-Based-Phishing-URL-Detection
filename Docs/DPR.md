# Detailed Project Report (DPR): Phishing URL Detection

## 1. Project Introduction
The goal of this project is to develop a robust, real-time Phishing URL Detection system. By utilizing Machine Learning and heuristic feature extraction, the system identifies malicious URLs with high precision.

## 2. Technical Stack
* **Language**: Python 3.13
* **Framework**: FastAPI (for real-time inference)
* **Libraries**: XGBoost, Scikit-Learn, Pandas, NumPy, Joblib, Tldextract
* **Visualizations**: Matplotlib, Seaborn, Power BI

## 3. Data Processing Pipeline

### 3.1 Data Collection
We utilize a dataset of ~450,000 URLs, containing both benign (safe) and phishing (malicious) examples.

### 3.2 Feature Extraction
We extract 20 features categorized as:
* **Structural**: Lengths, character counts (dots, hyphens, digits).
* **Domain**: Subdomain counts, TLD analysis, IP detection.
* **Behavioral**: Path depth, query parameters, TLD presence in path.
* **Security Tricks**: URL shorteners, double extensions.
* **Intent**: Phishing keyword matching.

**Optimization**: Feature extraction is accelerated using a **Parallel Processing Engine** (`ProcessPoolExecutor`) that leverages all available CPU cores.

## 4. Modeling & Training
We employ a comparative modeling approach:
1. **Decision Tree**: Baseline classifier.
2. **Logistic Regression**: Linear probability estimator.
3. **Random Forest**: Ensemble method for robust classification.
4. **XGBoost**: Gradient boosted trees for peak performance on large datasets.

**Hyperparameter Tuning**: We use `RandomizedSearchCV` to optimize the `max_depth`, `learning_rate`, and `n_estimators` of the XGBoost model.

## 5. Deployment Architecture
The system is deployed as an **Asynchronous REST API** using FastAPI. 
* Every prediction is logged to a `predictions_log.csv`.
* This log is designed for real-time connection to a **Power BI Dashboard**, providing live monitoring of phishing trends.
