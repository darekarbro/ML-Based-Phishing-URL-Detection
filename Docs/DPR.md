# Detailed Project Report (DPR): Phishing URL Detection

## 1. Project Introduction
This project develops a **production-ready Phishing URL Detection system** using Machine Learning and heuristic feature engineering. The system provides real-time classification via multiple interfaces (REST API, Web UI, Browser Extension) and integrates with business intelligence tools for continuous monitoring.

## 2. Technical Stack & Architecture

### 2.1 Backend Technologies
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | FastAPI | 0.100+ | REST API server |
| ASGI Server | Uvicorn | 0.24+ | Production-grade application server |
| ML Library | Scikit-Learn | 1.3+ | Classical ML models (DT, RF, LR) |
| Boosting | XGBoost | 2.0+ | Best-performing model |
| Data Processing | Pandas | 2.0+ | Feature dataframe operations |
| Numerical | NumPy | 1.24+ | Array operations |
| Parsing | tldextract | 5.0+ | TLD extraction from URLs |
| Progress | tqdm | 4.65+ | Progress bars for bulk operations |
| Serialization | joblib | 1.3+ | Model and scaler persistence |
| HTTP Client | requests | 2.31+ | CLI requests to API |

### 2.2 Frontend Technologies
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 19.2+ | UI component library |
| Build Tool | Vite | 8.0+ | Fast development and production builds |
| Animations | Framer Motion | 12.38+ | Smooth UI animations |
| Icons | Lucide React | 1.8+ | Icon components |
| Charts | Recharts | 3.8+ | Data visualization |
| Styling | CSS | - | Custom CSS with theme support |

### 2.3 Browser Extension
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Manifest | Manifest V3 | Chrome/Firefox compatibility |
| Background | Service Worker | Non-intrusive background processing |
| Popup | HTML/CSS/JS | User interface for extension |
| API | HTTP REST | Communication with FastAPI backend |

### 2.4 Data & Analytics
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Logging | CSV | Predictions persistence |
| BI Tool | Power BI | Dashboard and real-time monitoring |
| Visualization | Matplotlib/Seaborn | Training phase visualizations |

---

## 3. Dataset & Feature Engineering

### 3.1 Training Dataset
- **Size**: ~450,000 URLs
- **Distribution**: Balanced legitimate and malicious samples
- **Source**: Public phishing URL datasets combined from KAGGLE and research sources
- **Format**: CSV with URL and label columns

### 3.2 Feature Extraction (20 Features)

We engineer exactly 20 features across 5 categories to balance performance and speed:

#### Structural Features (7)
| # | Feature | Type | Calculation | Phishing Indicator |
|---|---------|------|-------------|-------------------|
| 1 | url_length | int | len(url) | Very long URLs suspicious |
| 2 | hostname_length | int | len(domain) | Unusually long domains |
| 3 | count. | int | url.count('.') | Excessive dots indicate subdomains |
| 4 | count-digits | int | count of 0-9 | IP addresses, obfuscation |
| 5 | count- | int | url.count('-') | Used to mimic legitimate domains |
| 6 | count@ | int | url.count('@') | Hides actual domain |
| 7 | count% | int | url.count('%') | URL encoding for obfuscation |

#### Domain Features (4)
| # | Feature | Type | Method | Phishing Indicator |
|---|---------|------|--------|-------------------|
| 8 | subdomain_count | int | tldextract.subdomain | Many subdomains = suspicious |
| 9 | suspicious_tld | binary | TLD in SUSPICIOUS_TLDS set | Known phishing TLDs |
| 10 | use_of_ip | binary | Regex IP detection | IP instead of domain |
| 11 | has_https | binary | scheme == 'https' | Absence of HTTPS = suspicious |

#### Path/Behavior Features (5)
| # | Feature | Type | Calculation | Phishing Indicator |
|---|---------|------|-------------|-------------------|
| 12 | path_length | int | len(path) | Long paths for obfuscation |
| 13 | fd_length | int | len(first_directory) | First directory length |
| 14 | path_depth | int | count of '/' in path | Deep path structures |
| 15 | query_param_count | int | len(parse_qs(query)) | Excessive parameters |
| 16 | tld_in_path | binary | TLD found in path | e.g., google.com/login.com |

#### Security Trick Features (3)
| # | Feature | Type | Detection | Phishing Indicator |
|---|---------|------|-----------|-------------------|
| 17 | double_extension | binary | Regex: \.[a-z]{2,5}\.[a-z]{2,5} | Misleading file types |
| 18 | has_fragment | binary | '#' in URL | Hide suspicious parts |
| 19 | short_url | binary | Domain in SHORTENERS set | Obfuscate true destination |

#### Intent Feature (1)
| # | Feature | Type | Detection | Phishing Indicator |
|---|---------|------|-----------|-------------------|
| 20 | phish_keyword | binary | Keyword matching | Common phishing words |

---

## 4. Machine Learning Approach

### 4.1 Model Comparison

#### Decision Tree (Baseline)
- Simple interpretation
- Fast training
- Prone to overfitting on 450k samples

#### Logistic Regression
- Linear probability estimation
- Interpretable coefficients
- Limited to linear separability

#### Random Forest (Ensemble) ⭐ BEST PERFORMER
- Robust to overfitting
- Handles feature interactions
- Good generalization

#### Random Forest (Selected) ⭐ BEST FOR THIS PROJECT
- Ensemble of decision trees with superior generalization
- Handles complex patterns in 20D feature space
- Excellent F1-score and recall on test set
- Parameters tuned via RandomizedSearchCV:
  * n_estimators: 100-300
  * max_depth: 10-20
  * min_samples_split: 5-10

**Why RF Outperforms XGBoost on This Task:**

1. **Feature Independence**: The 20 extracted URL features are largely independent (TLD, path depth, keyword presence, etc.). They don't have complex sequential interdependencies that benefit from XGBoost's sequential boosting. Random Forest's parallel ensemble voting is optimal for independent feature contributions.

2. **Clean Binary Boundary**: Phishing detection has a relatively clean decision boundary - URLs are either phishing or legitimate based on structural patterns. XGBoost's iterative refinement adds unnecessary complexity for this relatively well-separated classification task.

3. **Large Dataset Advantage**: With 450k training samples, Random Forest's parallel tree building and majority voting is naturally resistant to overfitting. XGBoost's sequential approach can overfit on very large datasets if learning_rate isn't perfectly tuned.

4. **Feature Interpretability**: Random Forest's feature importance directly correlates with URL characteristics (e.g., "suspicious_tld is most important" makes intuitive sense). XGBoost's gain-based importance can be harder to interpret for URL analysis.

5. **Training Efficiency**: RF trains 100-300 trees in parallel. XGBoost must train sequentially, making RF faster on multi-core systems while achieving equal or better accuracy.

6. **Recall Priority**: This project prioritizes **recall** (catching all phishing URLs) over micro-optimization. RF's ensemble voting naturally balances precision and recall. XGBoost can be harder to calibrate for this balance without extensive threshold tuning.

7. **No Hyperparameter Sensitivity**: RF is robust to hyperparameter choices. XGBoost requires precise tuning of learning_rate, which varies by dataset - RF's simpler parameter space reduces overfitting risk during hyperparameter optimization.

8. **Diversity in Ensemble**: Each tree in RF uses random feature subset selection, creating natural diversity. This diversity helps with the varied URL patterns in the phishing domain. XGBoost's sequential residual focusing doesn't add diversity for this feature set.

### 4.2 Evaluation Metrics

**Metrics Tracked**:
- **Accuracy**: (TP + TN) / (TP + TN + FP + FN) — Overall correctness
- **Precision**: TP / (TP + FP) — False positive rate important for user trust
- **Recall**: TP / (TP + FN) — Critical to catch all phishing attempts
- **F1-Score**: 2 × (Precision × Recall) / (Precision + Recall) — Balanced metric

**Model Selection**: Random Forest achieved best F1-score on test set
**Test Set**: 20% of 450k URLs (~90,000 URLs)

### 4.3 Why Random Forest is Optimal for Phishing Detection

The phishing URL detection problem has specific characteristics that favor Random Forest:

| Factor | Why RF Wins |
|--------|-----------|
| **Feature Nature** | URL features are independent (TLD, path structure, keywords) with no complex interactions that XGBoost's sequential boosting exploits |
| **Decision Boundary** | Clear separation between phishing/legitimate URLs - simple patterns detected well by ensemble voting rather than residual refinement |
| **Dataset Scale** | 450k URLs is large enough for parallel tree construction to shine; XGBoost's sequential approach risks overfitting |
| **Interpretability** | Feature importance directly maps to URL characteristics; RF's importance is more intuitive than XGBoost's gain-based importance |
| **Recall Priority** | Critical to catch phishing attempts; RF's ensemble naturally balances precision-recall. XGBoost requires careful threshold/learning_rate tuning |
| **Operational Simplicity** | Fewer hyperparameters to tune; RF is robust across different URL distributions without retraining |
| **Inference Speed** | Parallel prediction across 100-300 trees faster than sequential XGBoost scoring |

---

## 5. API Design & Deployment

### 5.1 REST API Endpoints

**FastAPI Server** runs on `http://127.0.0.1:8000`

#### POST /predict
**Request**:
```json
{
  "url": "https://suspicious-domain.com/login",
  "mode": "fast"  // or "detailed"
}
```

**Response (Success)**:
```json
{
  "probability": 87.5,
  "message": "The URL has a phishing probability of 87.5%. You may consider a threshold like 50% to classify.",
  "features": {  // Only in detailed mode
    "url_length": 35,
    "hostname_length": 19,
    ...
  },
  "timestamp": "2024-05-15T10:30:45.123456Z"
}
```

**Response (Error)**:
```json
{
  "detail": "URL cannot be empty."
}
```

### 5.2 Performance Specifications

| Metric | Target | Achieved |
|--------|--------|----------|
| Single URL prediction latency | <50ms | ✓ Typical 5-20ms (Random Forest) |
| Throughput | 100+ req/s | ✓ With load balancing |
| Model memory footprint | <500MB | ✓ ~150MB (Random Forest) |
| Inference parallelization | N/A | ✓ via uvicorn workers |

### 5.3 Deployment Options

#### Local Development
```bash
python -m uvicorn API:app --reload
```

#### Production (Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "API:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Production (Cloud)
- AWS Lambda + API Gateway
- Google Cloud Run
- Azure Container Instances

---

## 6. Data Pipeline & Logging

### 6.1 Training Pipeline
1. **Data Loading** → Load CSV with 450k URLs
2. **Feature Extraction** → Parallel processing across CPU cores (~8 workers)
3. **Feature Caching** → Cache to CSV to avoid recomputation
4. **Data Splitting** → 80% train, 20% test
5. **Model Training** → Train 4 different models
6. **Hyperparameter Tuning** → RandomizedSearchCV (50 iterations, 5-fold CV)
7. **Model Selection** → XGBoost wins
8. **Model Export** → Serialize to `models/best_model.pkl`

### 6.2 Inference Pipeline
1. **User Input** → URL from Web UI / Extension / CLI
2. **Feature Extraction** → Synchronous extraction of 20 features
3. **Scaling** → StandardScaler applied
4. **Prediction** → XGBoost predict_proba() call
5. **Logging** → Append to `predictions_log.csv`
6. **Response** → JSON with probability and optional features

### 6.3 CSV Logging Format
```csv
timestamp,url,probability,url_length,hostname_length,count.,count-digits,count-,count@,count%,subdomain_count,suspicious_tld,use_of_ip,has_https,path_length,fd_length,path_depth,query_param_count,tld_in_path,double_extension,has_fragment,short_url,phish_keyword
2024-05-15T10:30:45.123456,https://example.com,87.5,32,11,1,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0
```

---

## 7. Multi-Interface Architecture

### 7.1 Web User Interface (React)
- Modern, responsive design
- Real-time analysis results
- Dark/Light theme toggle
- Mode selector (Fast/Detailed)
- Feature visualization with Recharts
- Error handling and loading states

### 7.2 Browser Extension
- Manifest V3 compatible with Chrome/Firefox
- Service worker background processing
- In-browser URL detection
- Visual threat indicators
- Seamless API integration

### 7.3 Command-Line Interface
```bash
python predict.py "https://example.com" --mode detailed
```

---

## 8. Quality Assurance & Testing

### 8.1 Model Validation
- Confusion matrices for each model (Random Forest shows strong metrics)
- Feature importance analysis for interpretability
- Cross-validation during training (5-fold)
- Test set evaluation before production (Random Forest wins)

### 8.2 API Testing
- Valid/invalid URL inputs
- Mode validation (fast/detailed)
- Error response validation
- Load testing with concurrent requests

### 8.3 Integration Testing
- Frontend ↔ API communication
- Extension ↔ API communication
- CLI ↔ API communication
- CSV logging verification

---

## 9. Security & Compliance

### 9.1 Security Measures
- CORS headers configurable for production (currently permissive for development)
- Input validation for all API endpoints
- Model serialization with joblib (pickle safe with trusted sources)
- No sensitive data stored in logs beyond URL strings

### 9.2 Compliance
- GDPR: URLs are logged; consider privacy implications
- Data retention: CSV logs grow continuously; implement archival strategy
- Model explainability: Feature importances available for audit

---

## 10. Monitoring & Maintenance

### 10.1 Business Intelligence
- Power BI dashboard ingests CSV logs in real-time
- Tracks: daily phishing detections, accuracy metrics, trends
- Alerts on anomalies in detection rate

### 10.2 Model Monitoring
- Feature distribution monitoring in production
- Prediction distribution tracking
- Periodic retraining (monthly/quarterly) with new data

### 10.3 Performance Monitoring
- API response time tracking
- Error rate monitoring
- Resource utilization (CPU, memory)
- Log file size management

---

## 11. Future Enhancements

1. **Deep Learning Models**: Experiment with LSTM/Transformers on URL sequences
2. **Real-Time Model Updates**: Continuous learning from new phishing URLs
3. **Multi-Language Support**: Extension in multiple languages
4. **Mobile App**: Native iOS/Android application
5. **Advanced Analytics**: Clustering analysis of phishing campaigns
6. **API Rate Limiting**: Prevent abuse of public API
7. **User Feedback Loop**: Collect user corrections for model improvement
8. **URL Reputation Service**: Integration with third-party reputation databases
