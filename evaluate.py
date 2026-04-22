import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import pandas as pd
import numpy as np

# Ensure Imgs directory exists
if not os.path.exists('Imgs'):
    os.makedirs('Imgs')

def evaluate_model(model_name, y_true, y_pred):
    """
    Calculates and returns Accuracy, Precision, Recall, and F1-score.
    """
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    
    print(f"--- {model_name} Performance ---")
    print(f"Accuracy : {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall   : {rec:.4f}")
    print(f"F1-Score : {f1:.4f}\n")
    
    return {'Accuracy': acc, 'Precision': prec, 'Recall': rec, 'F1': f1}

def plot_confusion_matrix(model_name, y_true, y_pred):
    """
    Plots and saves the confusion matrix for a given model.
    """
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6,5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Legitimate', 'Phishing'], yticklabels=['Legitimate', 'Phishing'])
    plt.title(f'Confusion Matrix - {model_name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(f'Imgs/confusion_matrix_{model_name.replace(" ", "_")}.png')
    plt.close()

def plot_model_comparison(results_dict):
    """
    Plots a bar chart comparing models across different metrics.
    results_dict: { 'ModelName': {'Accuracy': 0.9, ...}, ... }
    """
    df = pd.DataFrame(results_dict).T
    df.plot(kind='bar', figsize=(10, 6))
    plt.title('Model Comparison')
    plt.ylabel('Score')
    plt.ylim(0, 1.1)
    plt.xticks(rotation=0)
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.savefig('Imgs/model_comparison.png')
    plt.close()

def plot_feature_importance(model, feature_names, top_n=10, model_name="model"):
    """
    Plots feature importance for Tree-based models (like Random Forest, XGBoost).
    Saves a separate file per model so plots don't overwrite each other.
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:top_n]
        
        plt.figure(figsize=(10, 6))
        plt.title(f"Top {top_n} Feature Importances — {model_name}")
        plt.bar(range(top_n), importances[indices], align="center")
        plt.xticks(range(top_n), [feature_names[i] for i in indices], rotation=45, ha='right')
        plt.tight_layout()
        safe_name = model_name.replace(" ", "_")
        plt.savefig(f'Imgs/feature_importance_{safe_name}.png')
        plt.close()

def plot_class_distribution(y):
    """
    Plots class distribution of the dataset.
    Uses DataFrame+column pattern for seaborn 0.13+ compatibility.
    """
    df_plot = pd.DataFrame({'Class': pd.Series(y).map({0: 'Legitimate (0)', 1: 'Phishing (1)'})})
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df_plot, x='Class', order=['Legitimate (0)', 'Phishing (1)'])
    plt.title('Class Distribution')
    plt.xlabel('Class')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('Imgs/class_distribution.png')
    plt.close()
