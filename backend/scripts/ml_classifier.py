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
        # 15 exact/near-exact copies [95-100, 90-100, 85-100]
        [100, 100, 100], [99, 99, 99], [98, 98, 98], [97, 95, 96], [96, 94, 95],
        [95, 96, 97], [99, 90, 85], [100, 92, 88], [98, 95, 87], [96, 98, 90],
        [95, 100, 85], [97, 99, 86], [99, 94, 92], [100, 97, 95], [95, 93, 89],
        
        # 15 obfuscated copies [40-70, 70-90, 60-85]
        [40, 70, 60], [45, 75, 65], [50, 80, 70], [55, 85, 75], [60, 90, 80],
        [65, 72, 85], [70, 78, 62], [42, 88, 68], [48, 82, 72], [52, 76, 78],
        [58, 84, 82], [62, 86, 64], [68, 80, 66], [44, 74, 84], [56, 71, 81],
        
        # 15 cross-language copies [30-50, 55-75, 0-10]
        [30, 55, 0], [35, 60, 2], [40, 65, 4], [45, 70, 6], [50, 75, 8],
        [32, 58, 10], [38, 62, 5], [42, 68, 1], [48, 72, 3], [34, 74, 7],
        [46, 56, 9], [44, 64, 4], [36, 66, 6], [41, 71, 2], [39, 69, 8],
        
        # 15 same-algorithm different implementation [20-40, 40-65, 10-30]
        [20, 40, 10], [25, 45, 15], [30, 50, 20], [35, 55, 25], [40, 60, 30],
        [22, 65, 12], [28, 42, 18], [32, 48, 22], [38, 52, 28], [24, 62, 14],
        [36, 44, 26], [34, 58, 24], [26, 46, 16], [31, 54, 21], [39, 56, 29],
        
        # 20 completely unrelated [0-25, 0-40, 0-15]
        [0, 0, 0], [5, 10, 5], [10, 20, 10], [15, 30, 15], [20, 40, 12],
        [25, 35, 8], [2, 15, 2], [8, 25, 6], [12, 5, 14], [18, 22, 4],
        [22, 38, 7], [4, 8, 9], [14, 18, 11], [16, 28, 3], [6, 12, 1],
        [24, 32, 13], [1, 24, 8], [9, 36, 5], [11, 4, 10], [19, 16, 6],
        
        # 20 boilerplate-similar but different [30-55, 35-60, 5-25]
        [30, 35, 5], [35, 40, 10], [40, 45, 15], [45, 50, 20], [50, 55, 25],
        [55, 60, 22], [32, 38, 8], [38, 42, 12], [42, 48, 18], [48, 52, 6],
        [52, 58, 24], [34, 56, 14], [46, 36, 16], [44, 54, 7], [36, 46, 19],
        [54, 44, 21], [31, 49, 11], [49, 39, 9], [39, 51, 17], [51, 41, 13]
    ])
    
    y = np.array(
        [1] * 15 + # exact
        [1] * 15 + # obfuscated
        [1] * 15 + # cross-language
        [0] * 15 + # same-algo
        [0] * 20 + # unrelated
        [0] * 20   # boilerplate
    )
    
    model = RandomForestClassifier(n_estimators=200, random_state=42)
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
        
        if prob > 0.99:
            prob = 1.0
        elif prob < 0.05:
            prob = 0.0
            
        # Convert to a 0-100 percentage
        ml_score = round(prob * 100, 2)
        
        print(json.dumps({"ml_risk_score": ml_score}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
