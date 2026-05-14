# Low-Level Design (LLD): Phishing URL Detection

## 1. Module Specifications

### 1.1 `feature_extraction.py` — Feature Engineering Engine
This module contains the mathematical and heuristic logic for extracting 20 features from URLs.

#### Core Functions
- **`extract_features(url: str) → dict`**:
  - Input: Raw URL string (with or without protocol)
  - Processing: 
    * Parses URL components (scheme, netloc, path, query, fragment)
    * Extracts TLD using tldextract library
    * Calculates 20 features across 5 categories
    * Returns dictionary with feature names as keys
  - Output: Dictionary with 20 key-value pairs
  - Example: `{'url_length': 45, 'hostname_length': 12, ..., 'phish_keyword': 1}`

- **`extract_features_parallel(urls: list, n_workers: int = None) → list`**:
  - Input: List of URLs, optional worker count (defaults to CPU count - 1)
  - Processing:
    * Creates ProcessPoolExecutor for multi-core processing
    * Uses tqdm for progress tracking
    * Implements chunked mapping for memory efficiency
    * Processes batches of ~500+ URLs per chunk
  - Output: List of dictionaries (one per URL)
  - Performance: ~450k URLs processed in 5-10 minutes depending on hardware

- **`get_feature_names() → list`**:
  - Returns the ordered list of 20 feature names
  - Maintains consistent column ordering across transformations

#### Constants
- **`SUSPICIOUS_TLDS`**: Set of 20+ TLDs commonly used for phishing (.xyz, .top, .online, etc.)
- **`SHORTENERS`**: Set of 40+ known URL shortener domains (bit.ly, tinyurl.com, etc.)
- **`PHISH_KEYWORDS`**: List of 19 keywords commonly found in phishing URLs (login, verify, update, etc.)

#### Feature Categories (20 Total)
1. **Structural (7)**: url_length, hostname_length, count., count-digits, count-, count@, count%
2. **Domain (4)**: subdomain_count, suspicious_tld, use_of_ip, has_https
3. **Path/Behavior (5)**: path_length, fd_length, path_depth, query_param_count, tld_in_path
4. **Security Tricks (3)**: double_extension, has_fragment, short_url
5. **Intent (1)**: phish_keyword

---

### 1.2 `API.py` — Production Inference Server

#### Framework & Configuration
- **Framework**: FastAPI with Uvicorn ASGI server
- **Version**: FastAPI 0.100+
- **CORS**: Enabled for all origins (`allow_origins=["*"]`) - update for production

#### Models & Classes
- **`URLRequest`** (Pydantic BaseModel):
  ```python
  class URLRequest(BaseModel):
      url: str
      mode: str = "fast"  # 'fast' or 'detailed'
  ```
  - `url`: The URL to analyze (required)
  - `mode`: Response detail level (default: "fast")

- **`PredictionResponse`** (Pydantic BaseModel):
  ```python
  class PredictionResponse(BaseModel):
      probability: float
      message: str
      features: dict = None
      timestamp: str
  ```
  - `probability`: Phishing probability (0-100)
  - `message`: Human-readable interpretation
  - `features`: Optional feature dictionary (included in detailed mode)
  - `timestamp`: ISO-format timestamp of prediction

#### Core Functions
- **`predict_url(request: URLRequest) → PredictionResponse`** [POST /predict]:
  - **Validation**:
    * Checks if model/scaler are loaded
    * Validates URL is not empty
    * Validates mode is either "fast" or "detailed"
  - **Processing**:
    1. Extract 20 features from URL using `feature_extraction.extract_features()`
    2. Convert features to DataFrame maintaining column order
    3. Scale features using loaded StandardScaler
    4. Get probability using `model.predict_proba()[0][1]`
    5. Convert to percentage (multiply by 100)
    6. Log prediction to CSV with all metadata
  - **Response**: PredictionResponse JSON object
  - **Error Handling**: Returns 400/500 HTTP errors with detail messages

- **`log_to_database(url, features, probability, timestamp) → None`**:
  - **Purpose**: Append prediction to CSV log
  - **Logic**:
    * Creates log_data dictionary with timestamp, url, probability, and all 20 features
    * Creates pandas DataFrame from log_data
    * If CSV doesn't exist: create with headers
    * If CSV exists: append row without headers
  - **File**: `predictions_log.csv`

#### Model Loading
- **`MODEL_PATH`**: `"models/best_model.pkl"`
- **`SCALER_PATH`**: `"models/scaler.pkl"` (loaded but note: feature scaling happens inline with StandardScaler)
- **Loading Strategy**: Loads on app initialization with try-except error handling
- **Caching**: Model remains in memory for sub-50ms inference

#### API Endpoints
- **POST /predict**
  - Request: `{"url": "https://example.com", "mode": "fast|detailed"}`
  - Response: `{"probability": 85.5, "message": "...", "features": {...}, "timestamp": "2024-05-15T..."}`
  - Status Codes:
    * 200: Success
    * 400: Bad request (empty URL, invalid mode)
    * 500: Server error (model not loaded, prediction failure)

#### CORS Configuration
```python
CORSMiddleware(
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### 1.3 `Training_Pipeline.ipynb` — Model Training & Optimization

#### Workflow
1. **Data Loading**: 
   - Load CSV with URL and label columns
   - Verify dataset size (~450,000 URLs)

2. **Feature Extraction**:
   - Call `extract_features_parallel()` with all URLs
   - Cache results to `urldata_extracted.csv` to skip on re-runs
   - Merge features with labels

3. **Model Training**:
   - Train 4 classifiers:
     * Decision Tree (baseline)
     * Logistic Regression (linear)
     * Random Forest (ensemble) — SELECTED AS BEST
     * XGBoost (gradient boosting)

4. **Model Comparison**:
   - Evaluate each model on test set
   - Compare: Accuracy, Precision, Recall, F1-Score
   - Plot confusion matrices and feature importances
   - Visualize model comparison chart

5. **Hyperparameter Tuning**:
   - Use `RandomizedSearchCV` for Random Forest
   - Tune parameters: `n_estimators`, `max_depth`, `min_samples_split`
   - 5-fold cross-validation
   - Select best parameters

6. **Model Export**:
   - Serialize best model (Random Forest) to `models/best_model.pkl`
   - Export feature names for consistency

#### Key Libraries
- pandas, numpy: Data manipulation
- scikit-learn: ML models and utilities
- xgboost: Gradient boosting model
- matplotlib, seaborn: Visualization
- tqdm: Progress bars
- joblib: Model serialization

---

### 1.4 `predict.py` — Command-Line Interface

#### Purpose
Standalone CLI tool for testing predictions without the web interface.

#### Arguments
```bash
python predict.py <url> [--mode {fast,detailed}]
```
- **url**: Positional argument, the URL to analyze
- **--mode**: Optional, defaults to "fast"

#### Workflow
1. Parse command-line arguments
2. Create payload dictionary: `{"url": args.url, "mode": args.mode}`
3. POST request to `http://127.0.0.1:8000/predict`
4. Handle response:
   - Success: Display probability, message, and optional features
   - Error: Display error message
5. Pretty-print results with formatting

#### Error Handling
- Connection error: Check if API is running
- HTTP error: Display API error details
- JSON error: Generic error message

---

### 1.5 `evaluate.py` — Model Evaluation & Visualization

#### Functions

- **`evaluate_model(model_name, y_true, y_pred) → dict`**:
  - Calculates Accuracy, Precision, Recall, F1-Score
  - Prints formatted results
  - Returns dictionary of metrics

- **`plot_confusion_matrix(model_name, y_true, y_pred) → None`**:
  - Creates confusion matrix heatmap
  - Saves to `Imgs/confusion_matrix_{model_name}.png`

- **`plot_model_comparison(results_dict) → None`**:
  - Multi-metric bar chart comparing all models
  - Saves to `Imgs/model_comparison.png`

- **`plot_feature_importance(model, feature_names, top_n=10, model_name) → None`**:
  - Top N feature importances for tree-based models
  - Saves to `Imgs/feature_importance_{model_name}.png`

- **`plot_class_distribution(y) → None`**:
  - Class distribution histogram
  - Saves visualization

---

## 2. Frontend Modules (React)

### 2.1 `frontend/src/App.jsx` — Main Application
- State management for results, loading, errors, theme
- Theme persistence using localStorage
- Integration with all child components

### 2.2 `frontend/src/components/`
- **SearchBar.jsx**: URL input with loading state
- **ResultCard.jsx**: Display prediction results with visual indicators
- **ThemeToggle.jsx**: Dark/Light theme switcher
- **ModeSelector.jsx**: Fast/Detailed detection mode selector

### 2.3 `frontend/src/api.js`
- HTTP client for API communication
- `analyzeUrl(url, mode)` function
- Error handling and response formatting

---

## 3. Browser Extension (`phishing-extension/`)

### 3.1 `manifest.json`
- Manifest V3 configuration
- Permissions: activeTab, tabs, storage, scripting
- Host permissions: API backend and all URLs
- Service worker: background.js

### 3.2 `background.js`
- Service worker for background processing
- URL detection and API integration

### 3.3 `popup.html` & `popup.js`
- User interface for extension popup
- Real-time analysis requests
- Visual threat indicators

---

## 4. Data Formats

### URL Request JSON
```json
{
  "url": "https://example.com/login",
  "mode": "fast"
}
```

### Prediction Response JSON
```json
{
  "probability": 85.5,
  "message": "The URL has a phishing probability of 85.5%. You may consider a threshold like 50% to classify.",
  "features": {
    "url_length": 30,
    "hostname_length": 11,
    "count.": 1,
    ...
  },
  "timestamp": "2024-05-15T10:30:45.123456"
}
```

### CSV Log Format
```csv
timestamp,url,probability,url_length,hostname_length,count.,...
2024-05-15T10:30:45.123456,https://example.com,85.5,30,11,1,...
```

---

## 5. Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single URL prediction | <50ms | Cached model, synchronous |
| Feature extraction (single) | 2-5ms | URL parsing + calculations |
| Feature extraction (450k) | 5-10 min | Parallel across CPU cores |
| Model training | 10-30 min | Depends on dataset size |
| API response (fast mode) | <100ms | Network + API overhead |
| API response (detailed mode) | <150ms | Network + feature dict JSON |

---

## 6. Error Handling Strategy

### API Errors
- 400: Invalid input (empty URL, invalid mode)
- 500: Server error (model not loaded, prediction failed)

### Connection Errors
- Timeout: Retry with exponential backoff
- Connection refused: Check API is running

### Data Validation
- URL format: Prepend http:// if missing protocol
- Feature dict: Validate 20 features present before scaling
