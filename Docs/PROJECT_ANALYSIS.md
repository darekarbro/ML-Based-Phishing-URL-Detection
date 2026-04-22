# 🛡️ PHISHING URL DETECTION - PROJECT ANALYSIS

---

## 📌 PROJECT OVERVIEW

**Project Name:** Phishing Attack Domain Detection System  
**Type:** Machine Learning Classification Project  
**Domain:** Cybersecurity  
**Objective:** Classify URLs as legitimate or malicious (phishing)

### Key Metrics
- **Model Accuracy:** 99%
- **Training Samples:** 10,000 URLs (5,000 legitimate + 5,000 malicious)
- **Features Extracted:** 16 numerical features per URL
- **Model Type:** Deep Neural Network (Multilayer Perceptron)

---

## 🏗️ ARCHITECTURE DESIGN

### DPR (Design Phase Review)

**Problem Statement:**
- Phishing attacks cost companies billions annually
- Need automated system to detect malicious URLs before users click them
- Manual inspection is time-consuming and error-prone

**Solution Strategy:**
- Use Machine Learning to learn patterns from legitimate vs. phishing URLs
- Extract numerical features from URLs (length, character counts, structure)
- Train a neural network classifier
- Deploy as REST API for real-time predictions

---

### HLD (High-Level Design)

```
INPUT LAYER
    ↓
┌─────────────────────────────────┐
│   1. Feature Extraction         │
│   ├─ URL length features (5)    │
│   ├─ Character count features   │
│   └─ Binary features (IP, etc)  │
├─ Output: 16 numerical features  │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│   2. Pre-trained ML Model       │
│   ├─ Input Layer: 16 neurons    │
│   ├─ Hidden Layer 1: 32 neurons │
│   ├─ Hidden Layer 2: 16 neurons │
│   ├─ Hidden Layer 3: 8 neurons  │
│   └─ Output Layer: 1 neuron     │
│        (Sigmoid - gives 0-1)    │
└─────────────────────────────────┘
    ↓
OUTPUT: Probability (0-100%)
- 0-50% = Likely LEGITIMATE
- 50-100% = Likely MALICIOUS
```

---

### LLD (Low-Level Design)

#### **File Structure & Dependencies**

```
Project Root
│
├─ Url_Features.py           ← 16 feature extraction functions
│  ├─ fd_length()            ← First directory length
│  ├─ digit_count()          ← Count of digits
│  ├─ letter_count()         ← Count of alphabets
│  ├─ no_of_dir()            ← Number of '/' 
│  ├─ having_ip_address()    ← Detects IP addresses
│  ├─ hostname_length()      ← Domain name length
│  ├─ url_length()           ← Total URL length
│  └─ get_counts()           ← Counts special chars: -@?%=.
│
├─ Feature_Extractor.py      ← Combines all 16 features into array
│  └─ extract_features()     ← Main function
│
├─ API.py                    ← Core prediction logic
│  └─ get_prediction()       ← Loads model + predicts
│
├─ Main.py                   ← User entry point (fixed path issue)
│
├─ models/
│  └─ Malicious_URL_Prediction.h5  ← Pre-trained model
│
└─ Notebooks/                ← Training & analysis
   ├─ Data_Collection_and_Feature_Extraction_(Phishing_urls).ipynb
   ├─ Training_Classification_Model.ipynb
   └─ Training_Phishing_classifier.ipynb
```

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

