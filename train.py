import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from tqdm import tqdm

# Import our custom modules
from feature_extraction import extract_features, get_feature_names
from evaluate import evaluate_model, plot_confusion_matrix, plot_model_comparison, plot_feature_importance, plot_class_distribution

def prepare_data(raw_csv_path='urldata.csv', extracted_csv_path='urldata_extracted.csv'):
    """
    Loads raw data, extracts features if not already done, and returns X, y.
    """
    if os.path.exists(extracted_csv_path):
        print(f"Loading pre-extracted features from {extracted_csv_path}...")
        df = pd.read_csv(extracted_csv_path)
    else:
        print(f"Extracting features from {raw_csv_path}. This might take a while...")
        df_raw = pd.read_csv(raw_csv_path)
        
        # Determine the correct target column
        # In urldata.csv the target is usually 'result' or 'label'
        target_col = 'result' if 'result' in df_raw.columns else 'label'
        
        # Sample data if it's too large to save time (e.g., 450k rows takes hours to parse)
        if len(df_raw) > 10000:
            print(f"Dataset is very large ({len(df_raw)} rows). Sampling 10,000 rows for faster processing...")
            df_raw = df_raw.groupby(target_col, group_keys=False).apply(lambda x: x.sample(min(len(x), 5000), random_state=42))
        
        # We need the URLs and targets
        urls = df_raw['url'].values
        targets = df_raw[target_col].values
        
        # If target is string like 'benign'/'malicious', convert to 0/1
        if df_raw[target_col].dtype == object:
            targets = np.where(df_raw[target_col].str.lower() == 'benign', 0, 1)
        
        # Extract features for each URL
        features_list = []
        for url in tqdm(urls, desc="Extracting Features"):
            try:
                features = extract_features(str(url))
                features_list.append(features)
            except Exception as e:
                # Fallback to zero features if URL is extremely malformed
                features_list.append({k: 0 for k in get_feature_names()})
                
        df = pd.DataFrame(features_list)
        df['target'] = targets
        df['url'] = urls
        
        # Save for future use
        print(f"Saving extracted features to {extracted_csv_path}...")
        df.to_csv(extracted_csv_path, index=False)
        
    # Separate features and target
    X = df[get_feature_names()]
    y = df['target']
    
    return X, y

def main():
    print("=== Phishing URL Detection: Training Pipeline ===\n")
    
    # 1. Prepare Data
    X, y = prepare_data()
    feature_names = X.columns.tolist()
    
    # Plot Class Distribution
    print("Generating Class Distribution Plot...")
    plot_class_distribution(y)
    
    # 2. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Data Split: {len(X_train)} train samples, {len(X_test)} test samples.\n")
    
    # 3. Scale Data
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 4. Initialize Models
    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "SVM": SVC(probability=True, random_state=42)  # Probability=True needed for API
    }
    
    results = {}
    best_model_name = None
    best_f1 = 0
    best_model = None
    
    # 5. Train and Evaluate
    for name, model in models.items():
        print(f"Training {name}...")
        
        # Some models don't strictly need scaling, but LR and SVM do. 
        # Using scaled data for all for consistency.
        model.fit(X_train_scaled, y_train)
        
        print(f"Evaluating {name}...")
        y_pred = model.predict(X_test_scaled)
        
        # Get metrics
        metrics = evaluate_model(name, y_test, y_pred)
        results[name] = metrics
        
        # Generate Confusion Matrix
        plot_confusion_matrix(name, y_test, y_pred)
        
        # Check if this is the best model based on F1-score
        if metrics['F1'] > best_f1:
            best_f1 = metrics['F1']
            best_model_name = name
            best_model = model
            
        # If Random Forest, plot feature importance
        if name == "Random Forest":
            print("Generating Feature Importance Plot for Random Forest...")
            plot_feature_importance(model, feature_names)
            
    # 6. Compare Models
    print("Generating Model Comparison Plot...")
    plot_model_comparison(results)
    
    # 7. Save Best Model and Scaler
    if not os.path.exists('models'):
        os.makedirs('models')
        
    print(f"\nBest Model: {best_model_name} with F1-Score: {best_f1:.4f}")
    print("Saving Best Model and Scaler...")
    
    joblib.dump(best_model, 'models/best_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("Pipeline Complete! All models trained, evaluated, and saved.")

if __name__ == "__main__":
    main()
