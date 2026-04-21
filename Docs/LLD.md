# Low-Level Design (LLD): Phishing URL Detection System

## 1. Introduction
The Low-Level Design (LLD) document provides a detailed, module-by-module breakdown of the system logic, internal data structures, and function specifications.

## 2. Core Modules Breakdown

### 2.1 `feature_extraction.py`
This module acts as the pre-processing engine. 

**Functions:**
* `extract_features(url: str) -> dict`
  * **Input**: A raw string URL (e.g., `https://google.com/login.php?user=1`).
  * **Logic**: Forces `http://` scheme if missing. Parses URL using `urllib.parse` and extracts Top Level Domains using `tldextract`. Applies 20 heuristic rules covering structure, path length, suspicious domains, and intent keywords.
  * **Output**: A dictionary containing exactly 20 key-value pairs of strictly numeric data.
  * *Error Handling*: Falls back gracefully to `0` values if the URL format is catastrophically invalid.

* `get_feature_names() -> list`
  * **Role**: Ensures deterministic feature ordering, which is crucial for the ML model during both training and inference.

### 2.2 `train.py`
The model orchestration script.

**Workflow:**
1. `prepare_data()`: Loads `urldata.csv`. Detects large files (>10k rows) and executes stratified sampling to 10,000 rows. Passes URLs to `extract_features()`. Caches the output in `urldata_extracted.csv`.
2. **Training Loop**: 
   * Scales data using `StandardScaler`.
   * Fits `DecisionTreeClassifier`, `RandomForestClassifier`, `LogisticRegression`, and `SVC(probability=True)`.
3. **Evaluation**: Calls functions from `evaluate.py`.
4. **Serialization**: Dumps the model with the highest F1-Score to `models/best_model.pkl` via `joblib`.

### 2.3 `evaluate.py`
The analytics and visualization engine.

**Functions:**
* `evaluate_model(model_name, y_true, y_pred)`: Computes Scikit-learn's `accuracy_score`, `precision_score`, `recall_score`, and `f1_score`.
* `plot_confusion_matrix(...)`: Uses Seaborn's heatmap to render a binary confusion matrix matrix.
* Outputs are hardcoded to save seamlessly into the `Imgs/` directory.

### 2.4 `api.py`
The FastAPI application.

**Endpoints:**
* `POST /predict`
  * **Payload Model**: `URLRequest` (requires `url` and optional `mode`).
  * **Logic**: Validates input. Extracts features. Applies the loaded `StandardScaler`. Calls `.predict_proba()` on the loaded SVM. 
  * **Database Log**: Calls `log_to_database()` which opens `predictions_log.csv` in append mode (`a`).
  * **Response Model**: `PredictionResponse` (Returns Float probability, Suggestion message, and Feature dictionary if mode is 'detailed').

### 2.5 `predict.py`
CLI Wrapper. Uses Python's `argparse` and `requests` library to format HTTP payloads and pretty-print JSON responses into the console.
