# High-Level Design (HLD): Phishing URL Detection

## 1. Design Overview
The Phishing URL Detection system is a comprehensive, multi-interface platform designed for real-time URL classification. It separates the concerns of model training (research phase), inference (API service), and user-facing applications (Web UI and Browser Extension).

## 2. System Components & Responsibilities

### 2.1 Training Pipeline (Jupyter Notebook)
* **Goal**: Build and optimize a highly accurate phishing classifier on 450,000+ URLs
* **Selected Model**: Random Forest (optimal for independent URL features and clean classification boundary)
* **Logic Flow**:
  1. Data Loading - Import raw URL dataset from CSV
  2. Parallel Feature Extraction - Generate 20 features per URL using all CPU cores
  3. Model Comparison - Train DT, RF, LR, and XGBoost models
  4. Evaluation - Compare performance across Accuracy, Precision, Recall, F1-Score
  5. Hyperparameter Tuning - Optimize Random Forest using RandomizedSearchCV
  6. Model Export - Serialize best model to `models/best_model.pkl`
* **Outcome**: Production-ready Random Forest model with superior F1-score and interpretability

### 2.2 Inference Engine (FastAPI)
* **Goal**: Provide sub-50ms predictions for single URLs via REST API
* **Key Responsibilities**:
  1. Accept POST requests with URL payload
  2. Invoke feature extraction module
  3. Load pre-trained model from disk (cached in memory)
  4. Return probability scores with metadata
  5. Log predictions to CSV for analytics
* **Workflow**:
  ```
  POST /predict
  ├─ Extract 20 features from URL
  ├─ Apply StandardScaler normalization
  ├─ Query XGBoost model
  ├─ Format response (probability + optional features)
  ├─ Append to predictions_log.csv
  └─ Return JSON
  ```
* **Performance**: <50ms per request, CORS-enabled for frontend access

### 2.3 Feature Engineering Module
* **Goal**: Compute exactly 20 heuristic features from any URL
* **Processing Modes**:
  - **Synchronous**: `extract_features(url)` - Single URL processing
  - **Parallel Batch**: `extract_features_parallel(urls)` - Multi-core processing for large datasets
* **Capabilities**:
  - Structural analysis (length, character counts)
  - Domain analysis (subdomains, TLDs, IP detection)
  - Path analysis (depth, query parameters)
  - Security trick detection (double extensions, shorteners)
  - Intent detection (phishing keywords)

### 2.4 React Web UI (Modern Frontend)
* **Goal**: Provide an enterprise-grade web interface for URL analysis
* **Technology Stack**:
  - React 19 with Vite build system
  - Framer Motion for smooth animations
  - Recharts for data visualization
  - Lucide React for icons
* **Key Features**:
  - Real-time URL input and analysis
  - Dark/Light theme toggle
  - Mode selector (Fast/Detailed detection)
  - Interactive result cards
  - Feature extraction visualization
  - Loading animations and error handling
  - Responsive design for desktop/mobile
* **Integration**: REST API calls to FastAPI backend

### 2.5 Browser Extension (Manifest V3)
* **Goal**: Enable in-browser phishing detection directly on websites
* **Capabilities**:
  - Real-time analysis of current page URLs
  - Service worker background processing
  - Popup interface for quick checks
  - Visual threat indicators and badges
  - Chrome and Firefox compatibility
* **Integration**: Direct API communication with FastAPI backend

### 2.6 Data Logging & Analytics
* **CSV Logging**: Every prediction logged with:
  - Timestamp (ISO format)
  - Analyzed URL
  - Phishing probability
  - All 20 extracted features
* **Power BI Integration**: Continuous data ingestion for:
  - Real-time trend monitoring
  - Historical analysis
  - Detection accuracy tracking
  - Geographic/temporal pattern detection

## 3. Multi-Interface Architecture

```
┌─────────────────────────────────────────┐
│         User Interfaces                 │
├─────────────┬─────────────┬─────────────┤
│ Web UI      │ Browser     │    CLI      │
│ (React)     │ Extension   │ (predict.py)│
└──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │
       └─────────────┼─────────────┘
                     │
            ┌────────▼────────┐
            │  FastAPI Server │
            │    (API.py)     │
            └────────┬────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼───────┐   │   ┌────────▼───────┐
   │ Feature    │   │   │ XGBoost Model  │
   │ Extraction │   │   │ (best_model.pk)│
   └────────────┘   │   └────────────────┘
                    │
            ┌───────▼────────┐
            │ CSV Logging    │
            │ (predictions)  │
            └────────────────┘
                    │
            ┌───────▼────────┐
            │  Power BI BI   │
            │ (Dashboards)   │
            └────────────────┘
```

## 4. Request Flow Scenarios

### Scenario 1: Web UI Analysis
```
User → React UI (browser)
      → POST /predict (API)
      → Feature Extraction
      → XGBoost Prediction
      → CSV Log + Response
      → Display Results in UI
```

### Scenario 2: Browser Extension Analysis
```
User clicks link
      → Extension detects URL
      → POST /predict (API)
      → Feature Extraction
      → XGBoost Prediction
      → CSV Log + Response
      → Visual Alert in Extension
```

### Scenario 3: CLI Prediction
```
python predict.py "URL" --mode detailed
      → HTTP Request to API
      → Feature Extraction
      → XGBoost Prediction
      → CSV Log + Response
      → Display in Terminal
```

## 5. Key Design Decisions

1. **Model Selection**: XGBoost chosen for superior performance on tabular data
2. **Feature Count**: 20 features provide optimal balance between expressiveness and speed
3. **Parallel Processing**: CPU-parallelized feature extraction for 450k URLs
4. **API-First Architecture**: Single source of truth for predictions, multiple client options
5. **CSV Logging**: Direct Power BI compatibility without additional infrastructure
6. **Stateless API**: Can be easily scaled horizontally or containerized
7. **CORS-Enabled**: Supports cross-origin requests from any frontend domain

## 6. Scalability Considerations

- **Vertical Scaling**: Increase CPU cores for faster parallel feature extraction
- **Horizontal Scaling**: Deploy multiple API instances behind load balancer
- **Batch Processing**: Process bulk URLs asynchronously for high-volume scenarios
- **Model Caching**: Pre-loaded model stays in memory across requests
- **CSV Streaming**: Log appending doesn't block prediction response
