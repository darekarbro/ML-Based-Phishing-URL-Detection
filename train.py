import os
import multiprocessing
import pandas as pd
import numpy as np
import joblib
from concurrent.futures import ProcessPoolExecutor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from tqdm import tqdm

# Import our custom modules
from feature_extraction import extract_features, get_feature_names
from evaluate import (
    evaluate_model,
    plot_confusion_matrix,
    plot_model_comparison,
    plot_feature_importance,
    plot_class_distribution,
)

# ─────────────────────────────────────────────
# Worker function (must be top-level for Windows multiprocessing)
# ─────────────────────────────────────────────
def _extract_single(url):
    """Top-level worker: extracts features from a single URL."""
    try:
        return extract_features(str(url))
    except Exception:
        return {k: 0 for k in get_feature_names()}


# ─────────────────────────────────────────────
# Parallel feature extraction
# ─────────────────────────────────────────────
def extract_features_parallel(urls, n_workers=None):
    """
    Extract features for all URLs in parallel using ProcessPoolExecutor.
    Uses chunked map for memory efficiency on 450k+ rows.
    """
    if n_workers is None:
        n_workers = max(1, multiprocessing.cpu_count() - 1)

    print(f"  → Using {n_workers} CPU cores for parallel extraction...")

    chunk_size = max(500, len(urls) // (n_workers * 4))
    # Use context manager to ensure executor is properly shut down
    with ProcessPoolExecutor(max_workers=n_workers) as executor:
        results = list(
            tqdm(
                executor.map(_extract_single, urls, chunksize=chunk_size),
                total=len(urls),
                desc="Extracting Features",
                unit="url",
            )
        )
    return results


# ─────────────────────────────────────────────
# Data preparation
# ─────────────────────────────────────────────
def prepare_data(raw_csv_path="urldata.csv", extracted_csv_path="urldata_extracted.csv"):
    """
    Loads raw data, extracts features if not already done, and returns X, y.
    Auto-detects stale cache by comparing row counts.
    """
    needs_extraction = True

    if os.path.exists(extracted_csv_path):
        try:
            # Fast row-count check using a single lightweight column
            extracted_count = pd.read_csv(extracted_csv_path, usecols=["target"]).shape[0]
            raw_count = pd.read_csv(raw_csv_path, usecols=["url"]).shape[0]
        except Exception as e:
            print(f"Invalid cached feature file '{extracted_csv_path}' ({e}). Re-extracting all features...")
            os.remove(extracted_csv_path)
        else:
            if extracted_count >= int(raw_count * 0.99):
                print(f"Loading pre-extracted features from '{extracted_csv_path}' ({extracted_count} rows)...")
                df = pd.read_csv(extracted_csv_path)
                needs_extraction = False
            else:
                print(
                    f"Stale cache detected ({extracted_count} rows cached vs {raw_count} in raw data). "
                    "Re-extracting all features..."
                )
                os.remove(extracted_csv_path)

    if needs_extraction:
        print(f"Reading raw data from '{raw_csv_path}'...")
        df_raw = pd.read_csv(raw_csv_path)
        print(f"  → {len(df_raw):,} rows loaded.")

        if "url" not in df_raw.columns:
            raise ValueError("Input dataset must contain a 'url' column.")

        # Determine target column
        if "result" in df_raw.columns:
            target_col = "result"
        elif "label" in df_raw.columns:
            target_col = "label"
        else:
            raise ValueError("Input dataset must contain either 'result' or 'label' target column.")

        # Convert string labels → 0 / 1
        if df_raw[target_col].dtype == object:
            targets = np.where(df_raw[target_col].str.lower() == "benign", 0, 1)
        else:
            targets = df_raw[target_col].values

        urls = df_raw["url"].values

        # Parallel feature extraction
        print(f"\nExtracting features for {len(urls):,} URLs...")
        features_list = extract_features_parallel(urls)

        df = pd.DataFrame(features_list)
        df["target"] = targets
        df["url"] = urls

        print(f"\nSaving extracted features to '{extracted_csv_path}'...")
        df.to_csv(extracted_csv_path, index=False)
        print("  → Saved successfully.\n")

    # Return feature matrix and labels
    X = df[get_feature_names()]
    y = df["target"]
    return X, y


# ─────────────────────────────────────────────
# Hyperparameter tuning
# ─────────────────────────────────────────────
def tune_best_model(model, model_name, X_train, y_train):
    """
    Runs RandomizedSearchCV on the best model to squeeze out extra accuracy.
    Returns the best estimator found.
    """
    param_grid = {}

    if model_name == "XGBoost":
        param_grid = {
            "n_estimators": [200, 300, 500],
            "max_depth": [4, 6, 8],
            "learning_rate": [0.05, 0.1, 0.2],
            "subsample": [0.7, 0.8, 1.0],
            "colsample_bytree": [0.7, 0.8, 1.0],
            "min_child_weight": [1, 3, 5],
        }
    elif model_name == "Random Forest":
        param_grid = {
            "n_estimators": [300, 500, 700],
            "max_depth": [None, 20, 30],
            "min_samples_split": [2, 5, 10],
            "min_samples_leaf": [1, 2, 4],
        }
    else:
        print(f"  (No tuning defined for {model_name}, skipping.)")
        return model

    print(f"\nRunning RandomizedSearchCV on '{model_name}' (n_iter=10, cv=3)...")
    search = RandomizedSearchCV(
        model,
        param_grid,
        n_iter=5,
        cv=3,
        scoring="f1",
        n_jobs=-1,
        random_state=42,
        verbose=1,
    )
    search.fit(X_train, y_train)
    print(f"  → Best params : {search.best_params_}")
    print(f"  → Best CV F1  : {search.best_score_:.4f}")
    return search.best_estimator_


# ─────────────────────────────────────────────
# Main pipeline
# ─────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  Phishing URL Detection — Full Dataset Training Pipeline")
    print("=" * 60 + "\n")

    # ── 1. Data preparation ──────────────────────────────────────
    X, y = prepare_data()
    feature_names = X.columns.tolist()
    print(f"Total usable samples : {len(X):,}")

    plot_class_distribution(y)

    # ── 2. Train / Test split (80 / 20) ──────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Train samples : {len(X_train):,}  |  Test samples : {len(X_test):,}\n")

    # ── 3. Feature scaling ───────────────────────────────────────
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ── 4. Model definitions (no SVM) ────────────────────────────
    models = {
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, n_jobs=-1, random_state=42
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000, random_state=42, n_jobs=-1
        ),
        "XGBoost": XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            eval_metric="logloss",
            tree_method="hist",   # fastest method for large datasets
            random_state=42,
            n_jobs=-1,
        ),
    }

    results = {}
    best_model_name = None
    best_f1 = 0.0
    best_model = None

    # ── 5. Train & evaluate each model ───────────────────────────
    for name, model in models.items():
        print(f"─── Training : {name} ───")
        model.fit(X_train_scaled, y_train)

        y_pred = model.predict(X_test_scaled)
        metrics = evaluate_model(name, y_test, y_pred)
        results[name] = metrics

        plot_confusion_matrix(name, y_test, y_pred)

        if metrics["F1"] > best_f1:
            best_f1 = metrics["F1"]
            best_model_name = name
            best_model = model

        if name in ("Random Forest", "XGBoost"):
            print(f"Generating Feature Importance Plot for {name}...")
            plot_feature_importance(model, feature_names, model_name=name)

    # ── 6. Model comparison chart ────────────────────────────────
    print("Generating Model Comparison Plot...")
    plot_model_comparison(results)

    # ── 7. Hyperparameter tuning on the best model ───────────────
    print(f"\nBest initial model : {best_model_name}  |  F1 = {best_f1:.4f}")
    tuned_model = tune_best_model(best_model, best_model_name, X_train_scaled, y_train)

    y_pred_tuned = tuned_model.predict(X_test_scaled)
    tuned_metrics = evaluate_model(f"{best_model_name} (Tuned)", y_test, y_pred_tuned)

    if tuned_metrics["F1"] >= best_f1:
        print(f"  → Tuned model F1 : {tuned_metrics['F1']:.4f}  (was {best_f1:.4f})")
        best_model = tuned_model
        best_f1 = tuned_metrics["F1"]

    # ── 8. Save best model + scaler ──────────────────────────────
    os.makedirs("models", exist_ok=True)

    joblib.dump(best_model, "models/best_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")

    print("\n" + "=" * 60)
    print(f"  DONE — Best model : {best_model_name}  |  F1 = {best_f1:.4f}")
    print("  Saved → models/best_model.pkl  &  models/scaler.pkl")
    print("=" * 60)


# ─────────────────────────────────────────────
# Windows multiprocessing guard (required!)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    main()
