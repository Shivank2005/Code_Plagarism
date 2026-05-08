import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_semantic_similarity(code1, code2):
    try:
        vectorizer = TfidfVectorizer()
        tfidf = vectorizer.fit_transform([code1, code2])
        sim = cosine_similarity(tfidf[0:1], tfidf[1:2])
        return float(sim[0][0]) * 100
    except Exception as e:
        return 0.0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing input files"}))
        sys.exit(1)
        
    with open(sys.argv[1], 'r') as f1, open(sys.argv[2], 'r') as f2:
        code1 = f1.read()
        code2 = f2.read()
        
    score = calculate_semantic_similarity(code1, code2)
    print(json.dumps({"semantic_score": score}))
