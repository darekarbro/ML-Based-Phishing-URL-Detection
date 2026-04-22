# High-Level Design (HLD): Phishing URL Detection

## 1. Design Overview
The Phishing URL Detection system is a modular application designed for high-performance URL classification. It separates the concerns of model training (research phase) and real-time inference (production phase).

## 2. Main Components

### 2.1 Training Pipeline (Jupyter Notebook)
* **Goal**: Analyze 450,000 URLs and produce a highly accurate classifier.
* **Logic**:
  1. Data Loading.
  2. Parallel Feature Extraction.
  3. Model Comparison.
  4. Hyperparameter Tuning (XGBoost).
  5. Artifact Export (`best_model.pkl`).

### 2.2 Inference Engine (FastAPI)
* **Goal**: Provide a sub-50ms response for single URL classification.
* **Workflow**:
  1. Receive URL via POST request.
  2. Call the shared `feature_extraction` module.
  3. Load `best_model.pkl` from disk (cached).
  4. Return probability score.

### 2.3 Data Integration (Power BI)
* **Goal**: Business Intelligence and live monitoring.
* **Mechanism**: Continuous logging to CSV.

## 3. Data Flow
1. **Input**: Raw URL string.
2. **Process**: Heuristic features extracted -> Scaling applied -> XGBoost Prediction.
3. **Output**: Percentage probability of phishing.
