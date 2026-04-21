# Detailed Project Report (DPR): Phishing URL Detection Using ML

## 1. Introduction
Phishing remains one of the most prolific cybersecurity threats globally. Attackers use deceptive Uniform Resource Locators (URLs) to mimic legitimate services, tricking users into revealing credentials, financial details, or downloading malware. 

This project aims to build an automated, intelligent Phishing URL Detection System using Machine Learning. Unlike blacklist-based approaches which fail against newly generated URLs, this system evaluates the mathematical characteristics of the URL itself to determine its legitimacy.

## 2. Project Objectives
1. Implement a robust feature extraction pipeline to parse 20 specific structural, domain, path, and behavioral indicators from any given URL.
2. Train, evaluate, and compare four traditional Machine Learning classifiers to find the optimal balance of accuracy and computational speed.
3. Deploy the optimal model via a modern RESTful API capable of delivering probabilistic risk scores.
4. Establish a logging pipeline for Business Intelligence (BI) visualization using Power BI.

## 3. Methodology

### 3.1 Data Acquisition & Sampling
The base dataset consisted of roughly 450,000 labeled URLs (`urldata.csv`). To optimize training time without sacrificing statistical validity, a balanced, stratified sampling algorithm was implemented to randomly select **10,000 URLs**. 

### 3.2 Feature Engineering
The success of traditional ML algorithms relies heavily on the quality of feature engineering. We extracted exactly 20 features:
* **Structural Anomalies**: Counting hyphens, `@` symbols, character lengths, and digits.
* **Domain Obfuscation**: Checking for IP usage instead of hostnames, suspicious Top Level Domains (e.g., `.xyz`), and subdomain abuse.
* **Path Analysis**: Measuring directory depths, queries, and double extensions (e.g., `.pdf.exe`).
* **Intent Identification**: Scanning the string for social engineering keywords like "secure", "login", or "verify".

### 3.3 Model Training
The scaled feature set was split into an 80% training set and 20% testing set. Four classifiers were fitted:
1. **Decision Tree (DT)**
2. **Random Forest (RF)**
3. **Logistic Regression (LR)**
4. **Support Vector Machine (SVM)**

## 4. Results and Findings
All models were evaluated using Accuracy, Precision, Recall, and the F1-Score.

* **Decision Tree**: Fast, but slightly prone to overfitting.
* **Logistic Regression**: The baseline model; performed reasonably well but struggled with non-linear relationships in the URL structures.
* **Random Forest**: Provided excellent accuracy (~98.9%) and robust feature importance metrics.
* **SVM**: Delivered the highest overall F1-Score (98.89%) with strong generalization boundaries. 

The **SVM** model was selected as the final predictive engine due to its superior precision and ability to output normalized class probabilities.

## 5. Deployment Architecture
The system was transitioned from a legacy Jupyter Notebook environment into a production-ready software suite:
* **FastAPI Backend**: Serves inference requests in milliseconds.
* **Probability Output**: Instead of a binary "yes/no", the system returns a probability score (0-100%). This prevents false-positive lockouts and allows administrators to set custom tolerance thresholds (e.g., flagging URLs over 50%).
* **Power BI Integration**: Every API hit generates a live entry in `predictions_log.csv`, facilitating real-time dashboarding of threat intelligence.

## 6. Conclusion
The modernized Phishing URL Detection pipeline successfully demonstrates how machine learning can be effectively productionized. By standardizing feature extraction, prioritizing SVM for inference, and deploying via FastAPI, the project has evolved into a robust, BI-ready cybersecurity tool.
