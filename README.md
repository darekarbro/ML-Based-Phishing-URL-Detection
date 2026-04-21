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

We tested four machine learning algorithms on the dataset:
* **Decision Tree (DT)**
* **Random Forest (RF)**
* **Logistic Regression (LR)**
* **Support Vector Machine (SVM)**

### Evaluation Metrics
We compare models using:
* **Accuracy:** Overall correctness of the model.
* **Precision:** Accuracy of positive predictions.
* **Recall:** Ability to find all actual positive cases.
* **F1-Score:** The balance between Precision and Recall.

*The results and feature importances are automatically saved as graphs in the `Imgs/` directory after running `train.py`.*

---

## 🛠️ How to Run the Project

### 1. Install Requirements
```bash
pip install -r requirements.txt
```

### 2. Train the Models
Ensure `urldata.csv` is in the project directory, then run:
```bash
python train.py
```
*This will extract features, train all models, generate comparison charts in `Imgs/`, and save the best model inside `models/`.*

### 3. Run the API Server
Start the FastAPI server:
```bash
uvicorn api:app --reload
```
*The API will be available at `http://127.0.0.1:8000`.*

### 4. Test Inference (Command Line)
You can test the trained model on a URL directly from the command line using `predict.py`.

**Fast Mode:**
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
### Example Response
```json
{
  "probability": 85.4,
  "message": "The URL has a phishing probability of 85.4%. You may consider a threshold like 50% to classify.",
  "features": null,
  "timestamp": "2026-04-21T21:00:00.000000"
}
```

---

## 📊 Power BI Integration
This project is built to seamlessly integrate with **Power BI** for dashboard visualization.
Every prediction made by the API is automatically logged into `predictions_log.csv`. 

**Logged fields include:**
* `timestamp`
* `url`
* `probability`
* All `20 extracted features`

**How to use:**
1. Open Power BI Desktop.
2. Select **Get Data > Text/CSV** and choose `predictions_log.csv`.
3. You can now build live dashboards tracking detected phishing attempts, plotting real-time average probabilities, and analyzing feature trends (e.g., how often `phish_keyword` appears).
