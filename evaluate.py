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
    plt.title(f'Confusion Matrix - {model_name}', fontsize=14)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(f'Imgs/confusion_matrix_{model_name.replace(" ", "_")}.png')
    plt.show() # Ensure it shows in the notebook

def plot_model_comparison(results_dict):
    """
    Plots a multi-metric bar chart comparing models across different metrics.
    """
    # Reshape the data for seaborn: Model | Metric | Value
    data = []
    for model, metrics in results_dict.items():
        for metric, value in metrics.items():
            data.append({'Model': model, 'Metric': metric, 'Score': value})
    
    df = pd.DataFrame(data)
    
    plt.figure(figsize=(12, 7))
    sns.set_palette("muted")
    ax = sns.barplot(data=df, x='Model', y='Score', hue='Metric')
    
    plt.title('Performance Comparison Across All Models', fontsize=16)
    plt.ylabel('Score (0.0 to 1.0)')
    plt.ylim(0, 1.15)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    
    # Add labels on top of bars
    for p in ax.patches:
        ax.annotate(format(p.get_height(), '.2f'), 
                       (p.get_x() + p.get_width() / 2., p.get_height()), 
                       ha = 'center', va = 'center', 
                       xytext = (0, 9), 
                       textcoords = 'offset points',
                       fontsize=9)
    
    plt.tight_layout()
    plt.savefig('Imgs/model_comparison.png')
    plt.show()

def plot_feature_importance(model, feature_names, top_n=10, model_name="model"):
    """
    Plots feature importance for Tree-based models.
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        indices = np.argsort(importances)[::-1][:top_n]
        
        plt.figure(figsize=(10, 6))
        sns.barplot(x=importances[indices], y=[feature_names[i] for i in indices], palette="viridis")
        plt.title(f"Top {top_n} Feature Importances — {model_name}", fontsize=14)
        plt.xlabel("Importance Score")
        plt.ylabel("Feature")
        plt.tight_layout()
        
        safe_name = model_name.replace(" ", "_")
        plt.savefig(f'Imgs/feature_importance_{safe_name}.png')
        plt.show()

def plot_class_distribution(y):
    """
    Plots class distribution of the dataset.
    """
    df_plot = pd.DataFrame({'Class': pd.Series(y).map({0: 'Legitimate (0)', 1: 'Phishing (1)'})})
    plt.figure(figsize=(7, 5))
    ax = sns.countplot(data=df_plot, x='Class', order=['Legitimate (0)', 'Phishing (1)'], palette="pastel")
    
    # Add counts on top of bars
    for p in ax.patches:
        ax.annotate(f'{int(p.get_height()):,}', (p.get_x() + p.get_width() / 2., p.get_height()),
                    ha='center', va='center', xytext=(0, 10), textcoords='offset points', fontsize=11)

    plt.title('Class Distribution: Dataset Balance', fontsize=14)
    plt.xlabel('Category')
    plt.ylabel('Count (Number of URLs)')
    plt.tight_layout()
    plt.savefig('Imgs/class_distribution.png')
    plt.show()
