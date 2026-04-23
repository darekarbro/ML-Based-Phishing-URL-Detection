# Machine Learning Models

This directory contains the trained models and scalers used for phishing URL detection.

## Large File Storage Notice

Due to size constraints on GitHub, the primary model file (`best_model.pkl`) is excluded from the repository.

### 📥 Download Pre-trained Model

You can download the pre-trained `best_model.pkl` from the link below:

- **Download Link:** [https://drive.google.com/file/d/1SFoteHsEA5yNWRbazb5W0_FwzzO2Ijy_/view?usp=sharing]
- **File Name:** `best_model.pkl`
- **Size:** ~157 MB

### 🛠️ Setup Instructions

1. Download the `best_model.pkl` file from the link above.
2. Move the downloaded file into this `models/` directory.
3. Ensure the folder structure looks like this:
   ```text
   models/
   ├── best_model.pkl
   ├── scaler.pkl
   └── README.md
   ```
4. You are now ready to run the API or prediction scripts!

---
*Note: If you wish to train your own model, please refer to the `Training_Pipeline.ipynb` notebook in the project root.*
