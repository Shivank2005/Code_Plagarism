import sys
import json
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.exceptions import NotFittedError
import pickle

MODEL_FILE = os.path.join(os.path.dirname(__file__), 'classifier_model.pkl')

def train_and_save_model():
    """Trains a Random Forest Classifier on synthetic historical plagiarism data and saves it."""
    # Synthetic data generation: 
    # [Token Score, Structural Score, Semantic Score]
    # Features (X) and Labels (y: 1 = Plagiarized, 0 = Safe)
    
    X = np.array([
        [95, 90, 85], [80, 85, 75], [99, 99, 95], [85, 80, 90],  # Clear plagiarism
        [60, 70, 80], [75, 60, 65], [65, 50, 70], [70, 75, 60],  # Suspicious / edge cases
        [20, 10, 15], [5, 0, 10], [30, 25, 20], [15, 30, 10],    # Completely safe
        [40, 35, 45], [50, 45, 40], [35, 55, 30], [45, 40, 50]   # Safe
    ])
    
    y = np.array([1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    with open(MODEL_FILE, 'wb') as f:
        pickle.dump(model, f)
        
    return model

def load_model():
    """Loads the model if it exists, otherwise trains a new one."""
    if os.path.exists(MODEL_FILE):
        try:
            with open(MODEL_FILE, 'rb') as f:
                return pickle.load(f)
        except Exception:
            return train_and_save_model()
    else:
        return train_and_save_model()

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Missing input scores: token_score structural_score semantic_score"}))
        sys.exit(1)
        
    try:
        token_score = float(sys.argv[1])
        structural_score = float(sys.argv[2])
        semantic_score = float(sys.argv[3])
        
        # Load or train the model
        clf = load_model()
        
        # Predict probability of class 1 (Plagiarized)
        features = np.array([[token_score, structural_score, semantic_score]])
        prob = clf.predict_proba(features)[0][1] # Probability of being Plagiarized (1)
        
        # Convert to a 0-100 percentage
        ml_score = round(prob * 100, 2)
        
        print(json.dumps({"ml_risk_score": ml_score}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
