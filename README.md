# Phishing URL Detection Using Machine Learning

![Phishing Detection](https://img.shields.io/badge/Machine%20Learning-Phishing%20Detection-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-API-teal.svg)

## Overview

This project implements an ML-based system for detecting phishing URLs. It extracts 20 structural, domain, and behavioral features from URLs and uses machine learning models to classify them as phishing or legitimate. The system includes a training pipeline, REST API for inference, browser extension for real-time detection, and web interface.

## Problem Statement

Phishing attacks pose a significant cybersecurity threat. This project provides an automated method to classify URLs and detect potential phishing attempts by analyzing structural and behavioral characteristics.

---

## Features Extracted

The system extracts 20 features across the following categories:

### Structural Features

1. url_length - Total character length of the URL
2. hostname_length - Length of the domain name
3. count. - Number of dots in the URL
4. count-digits - Total number of numeric digits
5. count- - Number of hyphens (commonly used in phishing URLs)
6. count@ - Number of @ symbols (often used to obscure the actual domain)
7. count% - Number of percent symbols (indicates URL encoding)

### Domain Features

8. subdomain_count - Number of subdomains
9. suspicious_tld - Binary indicator for suspicious top-level domains
10. use_of_ip - Binary indicator if domain is an IP address
11. has_https - Binary indicator for HTTPS protocol

### Path and Behavior Features

12. path_length - Length of URL path
13. fd_length - Length of the first directory
14. path_depth - Number of directories in the path
15. query_param_count - Number of URL parameters
16. tld_in_path - Binary indicator for domain extension in path

### Security Indicators

17. double_extension - Binary indicator for suspicious double file extensions
18. has_fragment - Binary indicator for URL fragment identifiers
19. short_url - Binary indicator for link shortener services
20. phish_keyword - Binary indicator for common phishing keywords

---

## Machine Learning Models

The system evaluates and compares four machine learning algorithms:

- Decision Tree (DT) - Baseline
- Random Forest (RF) - Selected model
- Logistic Regression (LR) - Linear baseline
- XGBoost - Gradient boosting approach

### Model Selection

Random Forest is used as the primary model based on the following characteristics:

- Ensemble approach - Multiple decision trees reduce overfitting
- Feature robustness - Handles independent URL features effectively
- Recall performance - Achieves high sensitivity for phishing detection
- Computational efficiency - Parallel tree building at scale
- Feature interpretability - Provides feature importance rankings

### Evaluation Metrics

Models are evaluated using:

- Accuracy - Overall correctness
- Precision - Positive prediction accuracy
- Recall - Detection rate of actual positives
- F1-Score - Harmonic mean of precision and recall

Results and visualizations are generated in the Jupyter Notebook.

---

## Installation and Usage

### 1. Install Requirements

```bash
python -m pip install -r requirements.txt
```

### 2. Train Models (Optional)

To retrain models, ensure `urldata.csv` is in the project directory and run:

```bash
jupyter notebook Training_Pipeline.ipynb
```

This extracts 20 features, trains all models on the dataset, performs hyperparameter tuning, and saves the best model to `models/best_model.pkl`.

### 3. Start API Server

```bash
python -m uvicorn API:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 4. Access Interfaces

#### Web Interface

```bash
cd frontend
npm install
npm run dev
```

Access at `http://localhost:5173`.

#### Browser Extension

1. Open `phishing-extension/` directory
2. In Chrome/Firefox, go to extensions page
3. Enable "Developer Mode"
4. Click "Load unpacked" and select the `phishing-extension/` folder

#### Command Line

```bash
python predict.py "http://example.com"
```

For detailed feature output:

```bash
python predict.py "http://example.com" --mode detailed
```

---

## API Reference

### Prediction Endpoint

POST `/predict`

#### Fast Mode Request

```json
{
  "url": "http://example.com",
  "mode": "fast"
}
```

#### Fast Mode Response

```json
{
  "probability": 98.4,
  "message": "The URL has a phishing probability of 98.4%.",
  "timestamp": "2026-04-21T21:00:00.000000"
}
```

#### Detailed Mode Request

```json
{
  "url": "http://example.com",
  "mode": "detailed"
}
```

#### Detailed Mode Response

```json
{
  "probability": 98.4,
  "message": "The URL has a phishing probability of 98.4%.",
  "features": {
    "url_length": 31,
    "hostname_length": 25,
    "count.": 1,
    "count-digits": 0,
    "count-": 2,
    "count@": 0,
    "count%": 0,
    "subdomain_count": 0,
    "suspicious_tld": 1,
    "use_of_ip": 0,
    "has_https": 0,
    "path_length": 0,
    "fd_length": 0,
    "path_depth": 0,
    "query_param_count": 0,
    "tld_in_path": 0,
    "double_extension": 0,
    "has_fragment": 0,
    "short_url": 0,
    "phish_keyword": 1
  },
  "timestamp": "2026-04-21T21:00:00.000000"
}
```

---

## Logging and Analytics

All API predictions are logged to `predictions_log.csv` with the following fields:

- timestamp - Prediction timestamp
- url - Analyzed URL
- probability - Phishing probability (0-100)
- All 20 extracted features

### Power BI Integration

To integrate with Power BI:

1. Open Power BI Desktop
2. Select Get Data > Text/CSV and import `predictions_log.csv`
3. Create visualizations for detection trends and feature analysis

---

## Project Structure

```
API.py                          # FastAPI inference server
evaluate.py                     # Model evaluation functions
feature_extraction.py           # Feature engineering module
predict.py                      # Command-line prediction tool
Training_Pipeline.ipynb         # Model training notebook
requirements.txt                # Python dependencies

models/
  best_model.pkl                # Trained model

frontend/                       # React web application
  index.html
  package.json
  vite.config.js
  public/
  src/
    App.jsx
    App.css
    main.jsx
    index.css
    api.js
    telemetry.css
    assets/
    components/
      ModeSelector.jsx
      ResultCard.jsx
      SearchBar.jsx
      ThemeToggle.jsx

phishing-extension/             # Browser extension
  background.js
  manifest.json
  popup.html
  popup.js
  style.css

firefox-extension/              # Firefox extension
  background.js
  manifest.json
  popup.html
  popup.js
  style.css

Docs/
  Architecture.md               # System architecture
  DPR.md                        # Detailed project report
  HLD.md                        # High-level design
  LLD.md                        # Low-level design
  PROJECT_ANALYSIS.md           # Project analysis
```

---

## System Requirements

### Backend Requirements

- Python 3.8 or higher (3.11+ recommended)
- RAM: Minimum 4GB (8GB+ for training)
- Multi-core processor (for parallel operations)
- 500MB free disk space

### Frontend Requirements

- Node.js 16+
- npm/yarn (latest version)
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Browser Extension Requirements

- Chrome 88+
- Firefox 89+

---

## Dependencies

### Backend Stack

- fastapi - REST API framework
- uvicorn - ASGI server
- scikit-learn - ML models
- xgboost - Gradient boosting
- pandas - Data manipulation
- numpy - Numerical computing
- tldextract - TLD extraction
- joblib - Model serialization
- tqdm - Progress bars
- requests - HTTP client
- matplotlib, seaborn - Visualization

### Frontend Stack

- react - UI framework
- vite - Build tool
- framer-motion - Animations
- lucide-react - Icons
- recharts - Charts

---

## Performance Benchmarks

| Operation | Time | Hardware |
|-----------|------|----------|
| Single URL prediction | 10-30ms | Intel i7, 16GB RAM |
| 450k URL batch extraction | 5-10 min | 8-core CPU, 16GB RAM |
| Model training | 15-30 min | 8-core CPU, 16GB RAM |
| API throughput | 100+ req/s | Single instance |

---

## Security Considerations

1. CORS Policy - Currently set to wildcard; restrict to specific domains in production
2. Input Validation - All URLs validated before processing
3. Model Safety - Load models only from trusted sources
4. Privacy - URLs are logged to CSV; implement data retention policies
5. Rate Limiting - Consider adding rate limiting for production deployment

---

## Documentation

For detailed information, see:

- Architecture.md - System design and components
- HLD.md - High-level design and workflows
- LLD.md - Low-level module specifications
- DPR.md - Detailed project report
- PROJECT_ANALYSIS.md - Project overview

---

## Contributing

To contribute improvements:

1. Test changes thoroughly with multiple URL samples
2. Update documentation if architecture changes
3. Maintain consistent code style
4. Add unit tests for new features

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## References

- Dataset - Public phishing URL datasets from Kaggle and research sources
- XGBoost - https://xgboost.readthedocs.io
- FastAPI - https://fastapi.tiangolo.com
- React - https://react.dev
- Power BI - https://powerbi.microsoft.com

---

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review API logs in predictions_log.csv

---

Last Updated: June 1, 2026
Version: 1.0.0
Status: Production Ready
