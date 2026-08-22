"""
PlagShield ML Model Trainer
============================
Trains the plagiarism risk classifier and saves it as a persistent model file.

Usage:
    python train_model.py                 # Train on built-in synthetic dataset
    python train_model.py dataset.csv     # Train on a CSV file (columns: tokenScore, structuralScore, semanticScore, isCrossLanguage, languagePair, label)

The trained model is saved to `model.joblib` in the same directory.
"""

from __future__ import annotations

import os
import random
import sys
from pathlib import Path

import numpy as np
from joblib import dump
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


def build_synthetic_dataset() -> tuple[np.ndarray, np.ndarray]:
    """
    Build a comprehensive labeled dataset of plagiarism scenarios.

    Each row: [tokenScore, structuralScore, semanticScore, isCrossLanguage, languagePair, label]
    Label: 0 = safe, 1 = plagiarism
    """

    base_data = [
        # ===== PLAGIARISM (Label = 1) =====

        # Exact Copies: all three scores very high
        [100, 100, 100, 0, "java-java", 1],
        [95, 98, 99, 0, "java-java", 1],
        [97, 95, 98, 0, "python-python", 1],

        # Variable-renamed copies (Obfuscation): token drops, struct/semantic stay high
        [0, 65, 98, 0, "java-java", 1],
        [5, 70, 97, 0, "java-java", 1],
        [0, 60, 96, 0, "python-python", 1],
        [10, 75, 95, 0, "java-java", 1],

        # Reformatted copies: token stays high, struct changes slightly
        [85, 75, 97, 0, "java-java", 1],
        [90, 80, 98, 0, "python-python", 1],

        # Logic-preserving rewrites (same algorithm, different style)
        [30, 50, 95, 0, "java-java", 1],
        [20, 45, 93, 0, "python-python", 1],

        # Cross-language translations (Token/Struct low, Semantic high)
        [0, 30, 85, 1, "java-python", 1],
        [5, 40, 88, 1, "java-python", 1],
        [0, 35, 82, 1, "java-python", 1],
        [10, 50, 90, 1, "java-python", 1],

        # ===== SAFE (Label = 0) =====

        # Completely unrelated programs (all scores low)
        [0, 10, 20, 0, "java-java", 0],
        [0, 15, 30, 0, "java-java", 0],
        [5, 5, 15, 0, "python-python", 0],
        [0, 20, 25, 1, "java-python", 0],

        # Structural false positive trap: same-language, different purpose
        # With [0.95, 1.0] cosine mapping, unrelated Java files produce
        # semantic scores in the 65-80% range, NOT 85-95%.
        [0, 40, 78, 0, "java-java", 0],
        [0, 50, 75, 0, "java-java", 0],
        [0, 70, 80, 0, "java-java", 0],
        [0, 45, 72, 0, "python-python", 0],
        [5, 60, 77, 0, "java-java", 0],
        [0, 35, 68, 0, "java-java", 0],

        # High semantic false positives (e.g. QuickSort vs MergeSort)
        [0, 75, 92, 0, "java-java", 0],
        [0, 80, 94, 0, "java-java", 0],
        [5, 75, 90, 0, "java-java", 0],
        [0, 65, 88, 0, "java-java", 0],
        [0, 75, 91, 0, "python-python", 0],
        [5, 80, 93, 0, "cpp-cpp", 0],
        
        # High semantic CROSS-LANGUAGE false positives 
        # (e.g. JS MergeSort vs Java QuickSort)
        [0, 68, 86, 1, "java-js", 0],
        [5, 70, 88, 1, "java-python", 0],
        [0, 65, 85, 1, "cpp-java", 0],
        [0, 75, 89, 1, "java-php", 0],

        # Template/boilerplate-heavy submissions
        [40, 60, 50, 0, "java-java", 0],
        [35, 55, 55, 0, "java-java", 0],
        [30, 50, 45, 0, "python-python", 0],

        # Different implementations of the same problem (not plagiarism)
        # Moderate struct (same problem = similar flow), moderate semantic, low token
        [0, 50, 70, 0, "java-java", 0],
        [10, 55, 75, 0, "java-java", 0],
        [5, 45, 65, 0, "python-python", 0],
        [0, 50, 72, 0, "js-js", 0],
        [5, 55, 68, 0, "cpp-cpp", 0],

        # Unrelated cross-language pairs
        [0, 10, 30, 1, "java-python", 0],
        [0, 20, 40, 1, "java-python", 0],
        [5, 15, 35, 1, "java-python", 0],
        [0, 15, 25, 1, "cpp-python", 0],
        [0, 10, 30, 1, "java-js", 0],

        # Additional language-diverse plagiarism cases
        [95, 97, 99, 0, "js-js", 1],
        [90, 95, 98, 0, "cpp-cpp", 1],
        [0, 60, 96, 0, "js-js", 1],       # Obfuscated JS
        [0, 55, 94, 0, "cpp-cpp", 1],      # Obfuscated C++
        [0, 35, 83, 1, "java-js", 1],      # Cross-lang Java->JS
        [0, 30, 80, 1, "cpp-python", 1],   # Cross-lang C++->Python
        [5, 40, 85, 1, "go-python", 1],    # Cross-lang Go->Python
    ]

    # Supplement with synthetic jitter to expand into a continuous model
    expanded_data = []
    groups = []
    random.seed(42)
    for group_id, row in enumerate(base_data):
        t_base, s_base, c_base, is_cross, pair, label = row
        for _ in range(150):  # ~6,000+ total points
            t = np.clip(random.gauss(t_base, 8.0), 0, 100)
            s = np.clip(random.gauss(s_base, 8.0), 0, 100)
            # Tight semantic jitter to prevent false-positive/plagiarism overlap
            c = np.clip(random.gauss(c_base, 3.0), 0, 100)
            expanded_data.append([t, s, c, is_cross, pair, label])
            groups.append(group_id)

    dataset = np.array(expanded_data, dtype=object)
    X = dataset[:, :-1]
    y = dataset[:, -1].astype(int)
    groups = np.array(groups)
    return X, y, groups

def load_csv_dataset(csv_path: str) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Load a custom dataset from CSV.

    Expected columns (no header row, or header: tokenScore, structuralScore, semanticScore, isCrossLanguage, languagePair, label):
        tokenScore, structuralScore, semanticScore, isCrossLanguage, languagePair, label
    """
    import csv

    rows = []
    with open(csv_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            # Skip header if present
            if i == 0 and row[0].strip().lower().startswith("token"):
                continue
            if len(row) < 6:
                print(f"  Warning: skipping malformed row {i + 1}: {row}")
                continue
            rows.append([
                float(row[0]),    # tokenScore
                float(row[1]),    # structuralScore
                float(row[2]),    # semanticScore
                int(row[3]),      # isCrossLanguage
                row[4].strip(),   # languagePair
                int(row[5]),      # label
            ])

    dataset = np.array(rows, dtype=object)
    X = dataset[:, :-1]
    y = dataset[:, -1].astype(int)
    groups = np.arange(len(y))
    return X, y, groups

def train_and_save(X: np.ndarray, y: np.ndarray, groups: np.ndarray, output_path: str) -> None:
    """Train the RandomForest pipeline and save it to disk."""

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", [0, 1, 2, 3]),
        ]
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", RandomForestClassifier(
            n_estimators=200,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
        )),
    ])

    # Cross-validation evaluation
    print("Running 5-fold Grouped cross-validation...")
    from sklearn.model_selection import GroupKFold, cross_validate
    gkf = GroupKFold(n_splits=5)
    scoring = ['accuracy', 'precision', 'recall', 'f1']
    cv_results = cross_validate(pipeline, X, y, groups=groups, cv=gkf, scoring=scoring)
    print(f"  Grouped CV Accuracy:  {cv_results['test_accuracy'].mean():.4f} (+/- {cv_results['test_accuracy'].std() * 2:.4f})")
    print(f"  Grouped CV Precision: {cv_results['test_precision'].mean():.4f} (+/- {cv_results['test_precision'].std() * 2:.4f})")
    print(f"  Grouped CV Recall:    {cv_results['test_recall'].mean():.4f} (+/- {cv_results['test_recall'].std() * 2:.4f})")
    print(f"  Grouped CV F1-Score:  {cv_results['test_f1'].mean():.4f} (+/- {cv_results['test_f1'].std() * 2:.4f})")

    # Final training on train split (leave one group out entirely for testing)
    from sklearn.model_selection import GroupShuffleSplit
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups))
    
    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    print("\nTraining intermediate model on 80% train split...")
    pipeline.fit(X_train, y_train)

    print("\nEvaluation on Untouched Test Set (20% of groups):")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["Safe", "Plagiarism"]))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    print("\nRetraining final model on FULL dataset...")
    pipeline.fit(X, y)

    # Save the trained model
    dump(pipeline, output_path)
    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"\nModel saved to: {output_path} ({file_size_kb:.1f} KB)")

    # ---------------------------------------------------------
    # Train Isolation Forest for Anomaly Detection (Feature #4)
    # ---------------------------------------------------------
    print("\nTraining Isolation Forest (Anomaly Detection)...")
    from sklearn.ensemble import IsolationForest
    
    iso_pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("anomaly_detector", IsolationForest(
            n_estimators=100,
            contamination=0.05,  # Flag top 5% most unusual pairs as anomalies
            random_state=42
        ))
    ])
    iso_pipeline.fit(X)
    
    iso_output_path = output_path.replace("model.joblib", "isolation_model.joblib")
    dump(iso_pipeline, iso_output_path)
    file_size_kb_iso = os.path.getsize(iso_output_path) / 1024
    print(f"Isolation model saved to: {iso_output_path} ({file_size_kb_iso:.1f} KB)")


def main() -> None:
    script_dir = Path(__file__).parent
    output_path = str(script_dir / "model.joblib")

    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
        print(f"Loading dataset from: {csv_path}")
        X, y, groups = load_csv_dataset(csv_path)
        print(f"  Loaded {len(y)} samples ({sum(y)} plagiarism, {len(y) - sum(y)} safe)")
    else:
        print("Using built-in synthetic dataset...")
        X, y, groups = build_synthetic_dataset()
        print(f"  Generated {len(y)} samples ({sum(y)} plagiarism, {len(y) - sum(y)} safe)")

    train_and_save(X, y, groups, output_path)


if __name__ == "__main__":
    main()
