# Phishing URL Detection Using Machine Learning

![Phishing Detection](https://img.shields.io/badge/Machine%20Learning-Phishing%20Detection-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-API-teal.svg)

## 📌 Project Overview
This project detects malicious and phishing URLs using Machine Learning. It extracts key structural, domain, and behavioral features from a URL and passes them to trained ML models to determine the probability of the URL being a phishing attempt. The project includes a robust training pipeline, a fast API for inference, and integrated logging for Power BI dashboards.

## 🎯 Problem Statement
Phishing attacks are one of the most common cyber threats, tricking users into revealing sensitive information through deceptive URLs. A reliable, real-time ML-based URL classifier can significantly mitigate these risks by predicting the probability that a given link is malicious.

---

## 🔍 Features Extracted (20 Features)

We extract 20 specific features to ensure strong performance without unnecessary complexity.

### 🔹 Structure Features
1. **url_length**: The total character length of the URL.
2. **hostname_length**: Length of the domain name.
3. **count.**: Number of dots (`.`) in the URL.
4. **count-digits**: Total number of numeric digits in the URL.
5. **count-**: Number of hyphens (`-`). Phishing sites often use hyphens to mimic legitimate domains.
6. **count@**: Number of `@` symbols. Often used to hide the actual domain.
7. **count%**: Number of `%` symbols. Indicates URL encoding, often used to obfuscate.

### 🔹 Domain Features
8. **subdomain_count**: The number of subdomains. Phishers use long subdomains to trick users.
9. **suspicious_tld**: Checks if the Top-Level Domain (TLD) is commonly associated with spam (e.g., `.xyz`, `.top`).
10. **use_of_ip**: Checks if the domain is directly an IP address instead of a standard hostname.
11. **has_https**: `1` if the URL uses secure HTTPS, `0` otherwise.

### 🔹 Path / Behavior Features
12. **path_length**: Length of the URL path (everything after the domain).
13. **fd_length**: Length of the first directory in the path.
14. **path_depth**: The number of directories in the path (slashes `/`).
15. **query_param_count**: The number of parameters passed in the URL (separated by `&`).
16. **tld_in_path**: Checks if a domain extension (like `.com`) is hiding in the path (e.g., `google.com/login.com`).

### 🔹 Security Trick Features
17. **double_extension**: Detects suspicious files with double extensions (e.g., `.pdf.exe`).
18. **has_fragment**: Checks for `#` fragment identifiers in the URL.
19. **short_url**: Detects if the URL uses a link shortener service like `bit.ly` or `tinyurl.com`.

### 🔹 Intent Feature
20. **phish_keyword**: Checks if common phishing words (like `login`, `verify`, `secure`, `bank`) are present in the URL.

---

## 🤖 Machine Learning Models

We test and compare four machine learning algorithms on the dataset:
* **Decision Tree (DT)** - Baseline
* **Random Forest (RF)** — *Our best performer*
* **Logistic Regression (LR)** - Linear baseline
* **XGBoost (Extreme Gradient Boosting)** - Gradient boosting approach

### Why Random Forest Wins for Phishing Detection

Random Forest outperforms XGBoost on this specific task because:

1. **Feature Independence**: The 20 URL features (TLD, hostname length, keywords, etc.) are structurally independent. They don't have complex interactions that require XGBoost's sequential refinement.

2. **Clean Classification Boundary**: Phishing URLs follow predictable patterns. Ensemble voting naturally captures these patterns without needing iterative refinement.

3. **High Recall**: Catching phishing attempts is critical. RF's ensemble voting achieves superior recall - multiple trees must agree, ensuring fewer missed threats.

4. **Scale Efficiency**: With 450k training samples, RF's parallel tree building is more efficient and robust than XGBoost's sequential approach.

5. **Interpretability**: Feature importance directly shows which URL characteristics are most suspicious, helping understand model decisions.

6. **Production Simplicity**: Fewer hyperparameters to tune; robust across different URL distributions without constant retraining.

### Evaluation Metrics
We compare models using:
* **Accuracy:** Overall correctness of the model.
* **Precision:** Accuracy of positive predictions.
* **Recall:** Ability to find all actual positive cases.
* **F1-Score:** The balance between Precision and Recall.

*The results and feature importances are automatically displayed as graphs inside the Jupyter Notebook.*

---

## 🛠️ How to Run the Project

### 1. Install Python Requirements
```bash
python -m pip install -r requirements.txt
```

### 2. Train the Models (Optional)
If you want to retrain the models, ensure `urldata.csv` is in the project directory, then open and run the Jupyter Notebook:
```bash
jupyter notebook Training_Pipeline.ipynb
```
*This will extract 20 features in parallel, train all 4 models on the full 450k+ dataset, perform Hyperparameter Tuning, and save the best model (Random Forest) inside `models/best_model.pkl`.*

### 3. Start the FastAPI Server
```bash
python -m uvicorn API:app --reload
```
*The API will be available at `http://127.0.0.1:8000`.*

### 4. Use One of the Three Interfaces

#### Option A: React Web UI
```bash
cd frontend
npm install
npm run dev
```
*Opens interactive web interface at `http://localhost:5173` with real-time URL analysis, dark/light theme, and detailed feature visualization.*

#### Option B: Browser Extension
1. Navigate to `phishing-extension/` directory
2. Open Chrome/Firefox and go to extensions page
3. Enable "Developer Mode"
4. Click "Load unpacked" and select the `phishing-extension/` folder
5. The extension will appear in your toolbar for real-time URL checking

#### Option C: Command Line
```bash
python predict.py "http://suspicious-login-update.com"
```
**Detailed Mode (Shows extracted features):**
```bash
python predict.py "http://suspicious-login-update.com" --mode detailed
```

---

## 🌐 API Usage

**Endpoint:** `POST /predict`

### Example Request (Fast Mode)
```json
{
  "url": "http://secure-update-login.xyz",
  "mode": "fast"
}
```

### Example Response (Fast Mode)
```json
{
  "probability": 98.4,
  "message": "The URL has a phishing probability of 98.4%. You may consider a threshold like 50% to classify.",
  "timestamp": "2026-04-21T21:00:00.000000"
}
```

### Example Request (Detailed Mode)
```json
{
  "url": "http://secure-update-login.xyz",
  "mode": "detailed"
}
```

### Example Response (Detailed Mode)
```json
{
  "probability": 98.4,
  "message": "The URL has a phishing probability of 98.4%. You may consider a threshold like 50% to classify.",
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

## 📊 Power BI Integration
Every prediction made by the API is automatically logged into `predictions_log.csv` for business intelligence.

**Logged fields include:**
* `timestamp` - When the prediction was made
* `url` - The analyzed URL
* `probability` - Phishing probability (0-100)
* All 20 extracted features

**How to integrate with Power BI:**
1. Open Power BI Desktop
2. Select **Get Data > Text/CSV** and choose `predictions_log.csv`
3. Build dashboards to:
   - Track daily phishing detection counts
   - Monitor average phishing probability trends
   - Analyze feature patterns across detected phishing attempts
   - Create alerts for anomalies in detection rates

---

## 📁 Project Structure

```
├── API.py                      # FastAPI inference server
├── feature_extraction.py        # 20-feature engineering engine
├── predict.py                   # CLI tool for URL testing
├── evaluate.py                  # Model evaluation functions
├── Training_Pipeline.ipynb      # Model training notebook
├── requirements.txt             # Python dependencies
│
├── models/
│   └── best_model.pkl          # Trained XGBoost model
│
├── frontend/                    # React Web UI
│   ├── src/
│   │   ├── App.jsx             # Main application
│   │   ├── api.js              # API integration
│   │   └── components/         # UI components
│   │       ├── SearchBar.jsx
│   │       ├── ResultCard.jsx
│   │       ├── ThemeToggle.jsx
│   │       └── ModeSelector.jsx
│   ├── package.json
│   └── vite.config.js
│
├── phishing-extension/         # Browser Extension (Manifest V3)
│   ├── manifest.json
│   ├── background.js           # Service worker
│   ├── popup.html
│   └── popup.js
│
├── Docs/                        # Documentation
│   ├── Architecture.md          # System architecture
│   ├── HLD.md                   # High-level design
│   ├── LLD.md                   # Low-level design
│   ├── DPR.md                   # Detailed project report
│   └── PROJECT_ANALYSIS.md      # Project overview
│
└── README.md                    # This file
```

---

## � System Requirements

### Backend Requirements
- **Python**: 3.8 or higher (3.11+ recommended)
- **RAM**: Minimum 4GB (8GB+ recommended for training)
- **CPU**: Multi-core processor (for parallel feature extraction)
- **Disk**: At least 500MB free space

### Frontend Requirements
- **Node.js**: 16+ 
- **npm/yarn**: Latest version
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Browser Extension Requirements
- **Chrome**: Version 88+
- **Firefox**: Version 89+

---

## 📦 Dependencies

### Backend Stack
- **fastapi** - REST API framework
- **uvicorn** - ASGI application server
- **scikit-learn** - ML models (DT, RF, LR)
- **xgboost** - Gradient boosting model
- **pandas** - Data manipulation
- **numpy** - Numerical computations
- **tldextract** - URL TLD extraction
- **joblib** - Model serialization
- **tqdm** - Progress bars
- **requests** - HTTP client
- **matplotlib, seaborn** - Visualization

### Frontend Stack
- **react** - UI framework
- **vite** - Build tool
- **framer-motion** - Animations
- **lucide-react** - Icons
- **recharts** - Charts and visualization

---

## 🚀 Performance Benchmarks

| Operation | Time | Hardware |
|-----------|------|----------|
| Single URL prediction | 10-30ms | Intel i7, 16GB RAM |
| 450k URL batch extraction | 5-10 min | 8-core CPU, 16GB RAM |
| Model training (XGBoost) | 15-30 min | 8-core CPU, 16GB RAM |
| API throughput | 100+ req/s | Single instance |

---

## 🔒 Security Considerations

1. **CORS Policy**: Currently set to `"*"`. In production, restrict to specific domains.
2. **Input Validation**: All URLs validated before processing.
3. **Model Safety**: Models stored as pickle files - only load from trusted sources.
4. **Privacy**: URLs are logged to CSV - implement data retention policies as needed.
5. **Rate Limiting**: Consider adding rate limiting for production deployment.

---

## 📚 Documentation

For detailed information, see:
- **[Architecture.md](Docs/Architecture.md)** - System design and components
- **[HLD.md](Docs/HLD.md)** - High-level design and workflows
- **[LLD.md](Docs/LLD.md)** - Low-level module specifications
- **[DPR.md](Docs/DPR.md)** - Detailed project report with technical deep-dive
- **[PROJECT_ANALYSIS.md](Docs/PROJECT_ANALYSIS.md)** - Project overview and feature analysis

---

## 🤝 Contributing

To contribute improvements:
1. Test changes thoroughly with multiple URL samples
2. Update documentation if architecture changes
3. Maintain consistent code style
4. Add unit tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎓 References & Resources

- **Dataset**: Public phishing URL datasets from Kaggle and research sources
- **XGBoost**: https://xgboost.readthedocs.io
- **FastAPI**: https://fastapi.tiangolo.com
- **React**: https://react.dev
- **Power BI**: https://powerbi.microsoft.com

---

## 📧 Support & Questions

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review the API logs in `predictions_log.csv`

---

**Last Updated**: May 15, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
