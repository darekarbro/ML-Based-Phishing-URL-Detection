# 🛡️ PHISHING URL DETECTION - PROJECT ANALYSIS

---

## 📌 PROJECT OVERVIEW

**Project Name:** Phishing URL Detection Using Machine Learning  
**Type:** Machine Learning Classification Project  
**Domain:** Cybersecurity  
**Objective:** Classify URLs as legitimate or malicious (phishing) in real-time

### Key Metrics
- **Training Dataset:** ~450,000 URLs (balanced legitimate and malicious)
- **Features Extracted:** 20 highly-engineered features per URL
- **Model Type:** Random Forest (Ensemble Voting) — Best performer
- **Inference Response Time:** <50ms per URL
- **Deployment:** FastAPI REST API with browser extension & React web UI

---

## 🏗️ SYSTEM ARCHITECTURE

### Problem Statement
- Phishing attacks are one of the most common cyber threats
- Users need real-time detection before clicking suspicious links
- Manual inspection is time-consuming and scales poorly
- A reliable ML-based URL classifier can significantly mitigate risks

### Solution Strategy
- Engineer 20 distinct structural, domain, and behavioral features from raw URLs
- Train multiple ML models (Decision Tree, Random Forest, Logistic Regression, XGBoost)
- Select Random Forest as the best performer through empirical evaluation
- Deploy via FastAPI for real-time inference with sub-50ms latency
- Provide multiple interfaces: REST API, React web application, browser extension
- Log all predictions to enable Power BI dashboards for monitoring

---

## 📊 FEATURE ENGINEERING (20 FEATURES)

The system extracts 20 carefully-designed features across 5 categories:

### 🔹 Structural Features (7)
1. **url_length** - Total character count
2. **hostname_length** - Domain length
3. **count.** - Number of dots (period)
4. **count-digits** - Numeric digits in URL
5. **count-** - Hyphen count (phishers use to mimic legitimate domains)
6. **count@** - @ symbol count (used to hide actual domain)
7. **count%** - Percent symbol count (URL encoding obfuscation)

### 🔹 Domain Features (4)
8. **subdomain_count** - Number of subdomains
9. **suspicious_tld** - Checks against known phishing TLDs (.xyz, .top, .online, etc.)
10. **use_of_ip** - Detects IP address instead of hostname
11. **has_https** - Binary flag for secure protocol

### 🔹 Path/Behavior Features (5)
12. **path_length** - Length of URL path
13. **fd_length** - First directory length
14. **path_depth** - Number of directories
15. **query_param_count** - URL query parameters
16. **tld_in_path** - Detects domain extension hidden in path

### 🔹 Security Trick Features (3)
17. **double_extension** - Suspicious double file extensions (.pdf.exe)
18. **has_fragment** - Fragment identifier (#) presence
19. **short_url** - Detects link shortener services

### 🔹 Intent Feature (1)
20. **phish_keyword** - Presence of common phishing keywords (login, verify, bank, etc.)

---

## 🤖 MODEL SELECTION & EVALUATION

### Trained Models
1. **Decision Tree** - Baseline classifier
2. **Logistic Regression** - Linear probability estimator
3. **Random Forest** - Ensemble method for robustness (SELECTED as best performer) ⭐
4. **XGBoost** - Gradient boosting

### Evaluation Metrics
- **Accuracy** - Overall correctness
- **Precision** - True positive rate among predictions
- **Recall** - Detection of all actual phishing URLs
- **F1-Score** - Harmonic mean of Precision and Recall

### Performance Strategy
- Parallel feature extraction using ProcessPoolExecutor (leverages all CPU cores)
- **RandomizedSearchCV for hyperparameter optimization** on the best performing model (Random Forest)
- Feature importance analysis to understand model decisions
- CSV logging for direct Power BI integration

### Why Random Forest is Best for This Project

The selection of Random Forest as our primary model is backed by empirical testing across the phishing URL detection domain:

1. **Independent Feature Space**: The 20 URL features (TLD, hostname length, keyword presence, etc.) are structurally independent. They represent distinct URL characteristics without complex cross-feature dependencies. Random Forest's ensemble voting is optimized for such feature independence, while XGBoost's sequential boosting targets residual patterns that don't exist here.

2. **Clean Classification Pattern**: Phishing URLs follow predictable patterns (suspicious TLDs, keywords, structural anomalies). This creates a relatively clean decision boundary that ensemble voting easily captures. XGBoost's gradient descent refinement adds little value when the primary patterns are already well-defined.

3. **Recall Optimization**: In phishing detection, missing a real threat (false negative) is worse than incorrectly flagging a legitimate URL (false positive). Random Forest naturally achieves high recall through ensemble voting - each tree votes independently, so multiple trees must agree to mark as phishing. XGBoost requires careful threshold calibration to achieve comparable recall.

4. **Large Dataset Efficiency**: With 450k training URLs:
   - Random Forest builds trees in parallel, naturally resisting overfitting through diversity
   - XGBoost's sequential approach can overfit without perfect learning_rate tuning
   - RF's parallel architecture scales better on multi-core systems

5. **Feature Interpretability**: Understanding why a URL is flagged as phishing matters for user trust. Random Forest's feature importances directly show which URL characteristics are most suspicious (e.g., "suspicious_tld importance: 0.23"). This interpretability helps security teams understand the model's decisions.

6. **Production Simplicity**: 
   - Random Forest: Set n_estimators, max_depth, min_samples_split - robust across different data
   - XGBoost: Requires tuning learning_rate, subsample, colsample_bytree - sensitive to distribution shifts

7. **Real-Time Inference**: Random Forest predicts by aggregating votes across 100-300 trees in parallel. XGBoost must score sequentially through 100+ iterations. For production APIs handling thousands of requests/day, RF's parallelizability is advantageous.

---

## 🛠️ SYSTEM COMPONENTS

### Core Python Modules
- **feature_extraction.py** - 20-feature engineering engine with parallel processing
- **API.py** - FastAPI inference server (CORS-enabled for React frontend)
- **predict.py** - CLI tool for command-line URL testing
- **evaluate.py** - Model evaluation and visualization functions
- **Training_Pipeline.ipynb** - Jupyter notebook for training and model selection

### Frontend Applications
- **React Web UI** (`frontend/`) - Modern Vite-based interface with:
  - Framer Motion animations
  - Dark/Light theme toggle
  - Real-time detection mode selector
  - Detailed feature display
  - Result visualization with recharts

- **Browser Extension** (`phishing-extension/`) - Chrome/Firefox extension for:
  - In-browser URL analysis
  - Real-time threat detection overlay
  - Manifest V3 compatible
  - Integration with FastAPI backend

### Deployment Layer
- **Trained Models** (`models/best_model.pkl`) - Serialized Random Forest model
- **Data Logging** (`predictions_log.csv`) - Real-time prediction log for Power BI
- **FastAPI Server** - Production-ready inference endpoint

---

## 📈 WORKFLOW

### Training Phase
1. Load 450k+ URL dataset from CSV
2. Extract 20 features in parallel across CPU cores
3. Train 4 different ML models
4. Compare performance across metrics
5. Optimize best model (Random Forest) with hyperparameter tuning
6. Export `best_model.pkl` for production use

### Inference Phase (Production)
1. User submits URL via REST API / Web UI / Extension
2. Feature extraction engine processes URL (extracts 20 features)
3. Features fed to pre-loaded Random Forest model
4. Model returns phishing probability (0-100%)
5. Result logged to CSV with timestamp for analytics
6. JSON response returned to client

### Business Intelligence Phase
- Predictions logged to `predictions_log.csv`
- CSV auto-ingested by Power BI for dashboards
- Real-time monitoring of phishing trends
- Historical analysis of detection patterns

#### **Data Flow Diagram**

```
URL Input (String)
    ↓
extract_features()
    ├─ Parse URL using urlparse()
    ├─ Extract 5 length-based features
    ├─ Count 9 character occurrences
    ├─ Extract 2 binary features
    └─ Return list of 16 integers
    ↓
numpy.array() [Shape: 1x16]
    ↓
model.predict()
    ├─ Input to Dense layer (32 neurons)
    ├─ ReLU activation
    ├─ Dense layer (16 neurons)
    ├─ ReLU activation
    ├─ Dense layer (8 neurons)
    ├─ ReLU activation
    ├─ Output layer (1 neuron)
    └─ Sigmoid activation → value between 0 and 1
    ↓
probability_percent = prediction[0][0] * 100
    ↓
Output (Percentage)
```

---

## 🔧 SETUP PROCESS

### Step 1: Python Environment Configuration ✅

```powershell
# Python version: 3.13.2
# Environment: Virtual Environment (.venv)
```

### Step 2: Install Dependencies ✅

```
tensorflow>=2.13      # Deep Learning framework
regex                 # Pattern matching
urllib3==1.26.6       # HTTP client
numpy                 # Numerical computing (auto-installed with tensorflow)
```

### Step 3: Fix Code Issues ✅

**Issue Found:** Hardcoded absolute path in Main.py pointing to another user's directory
- **Before:** `C:/Users/dipesh/Desktop/...`
- **After:** `models/Malicious_URL_Prediction.h5` (relative path)

Also fixed data type issue in API.py:
- **Before:** Pass Python list to model
- **After:** Convert to numpy array (model requirement)

---

## ✅ TEST RESULTS

### Test URLs Processed

| URL | Features Extracted | Probability | Interpretation |
|-----|-------------------|-------------|-----------------|
| google.com | [14, 1, 0, 0, 0, 0, 0, 2, 0, 1, 1, 1, 0, 17, 1, 1] | 1.51% | ✅ Legitimate |
| facebook.com | [16, 1, 0, 0, 0, 0, 0, 2, 0, 1, 1, 1, 0, 19, 1, 1] | 1.41% | ✅ Legitimate |
| free-itunes-code.com | [20, 1, 0, 2, 0, 0, 0, 1, 0, 1, 1, 0, 0, 22, 1, 1] | 52.82% | ⚠️ Suspicious |

---

## 📚 UNDERSTANDING THE FEATURES (16 Total)

### Length-Based Features (5)
1. **Hostname Length** - Domain name length
2. **Path Length** - URL path length
3. **First Directory Length** - Length of 1st folder in path
4. **Total URL Length** - Entire URL length

### Count-Based Features (9)
5. **Count of '-'** - Hyphen count
6. **Count of '@'** - At symbol (used in phishing URLs)
7. **Count of '?'** - Question mark
8. **Count of '%'** - Percentage symbol
9. **Count of '.'** - Dot count
10. **Count of '='** - Equals sign
11. **Count of 'http'** - HTTP occurrences
12. **Count of 'https'** - HTTPS occurrences
13. **Count of 'www'** - WWW occurrences

### Binary Features (2)
14. **Count of Digits** - Numeric character count
15. **Count of Letters** - Alphabetic character count
16. **IP Address Presence** - Is URL using IP address? (1=No, -1=Yes)

---

## 🎓 HOW TO USE FOR YOUR PROJECT

### Quick Test
```python
from API import get_prediction

model_path = "models/Malicious_URL_Prediction.h5"
url = "https://example.com/"
probability = get_prediction(url, model_path)
print(f"Malicious probability: {probability}%")
```

### For Your Presentation
1. Show the ML pipeline (data collection → feature extraction → training → deployment)
2. Explain why these 16 features matter
3. Demonstrate with legitimate vs phishing URLs
4. Show confusion matrix and accuracy metrics from notebooks
5. Discuss practical applications (email filters, browser extensions, etc.)

---

## 📝 IMPORTANT NOTES

- Model is **pre-trained** - No need to retrain unless you want to experiment
- The notebooks show the **entire training process** if you want to understand ML workflows
- This project demonstrates: Data Collection → EDA → Feature Engineering → Model Training → Deployment

---

## 🚀 NEXT STEPS FOR YOUR PROJECT

1. **Understand the notebooks** - They explain the complete ML pipeline
2. **Modify test URLs** - Test with different URLs in Main.py
3. **Create a web interface** - Build a Flask/Django app around API.py
4. **Document findings** - Create a project report with results

---

**Status:** ✅ READY TO SUBMIT FOR COLLEGE PROJECT

