# PlagShield — Multi-Language Code Plagiarism Detection System

An AI-powered multi-language code plagiarism detection and visualization platform that combines token-based similarity analysis, AST structural comparison, semantic embeddings, and interactive visual analytics to identify copied, modified, or obfuscated source code submissions.

---

## About The Project

**PlagShield** is an intelligent plagiarism detection platform designed to detect source code similarity across multiple programming languages using both traditional and AI-powered approaches.

Traditional plagiarism detection systems primarily rely on token matching techniques and often fail against advanced obfuscation strategies such as:

- Variable renaming
- Code restructuring
- Loop and control-flow transformations
- Cross-language translation
- Semantic modifications

PlagShield addresses these limitations by integrating:

- **JPlag** token-based similarity analysis
- **AST (Abstract Syntax Tree)** structural comparison
- Cross-language normalization
- **CodeBERT** semantic embeddings
- Machine learning-based plagiarism risk scoring
- Interactive visualization dashboards

The platform supports multiple programming languages including:

- Java
- Python
- C/C++
- JavaScript

PlagShield is designed for:

- Academic institutions
- Competitive programming platforms
- Technical assessment systems
- Software quality analysis
- Research environments

---

# Features

- Multi-language plagiarism detection
- Token-based similarity analysis
- AST-based structural comparison
- Cross-language code normalization
- AI semantic similarity detection using CodeBERT
- Machine learning-based risk scoring
- Anomaly and collusion detection
- Interactive visualization dashboard
- Similarity heatmaps and network graphs
- Side-by-side code diff viewer
- Exportable PDF and CSV reports
- Batch processing support
- Modular multi-service architecture

---
---

# System Architecture

```text
Input Code Files
        ↓
Preprocessing Module
        ↓
Token-Based Analysis (JPlag)
        ↓
AST Structural Analysis
        ↓
Cross-Language Normalization
        ↓
AI Semantic Embeddings (CodeBERT)
        ↓
ML Risk Classification
        ↓
Clustering & Anomaly Detection
        ↓
Visualization Dashboard & Reports
```

---

# Modules

## 1. Input Module
Handles batch upload and language identification of source code submissions.

## 2. Preprocessing Module
Performs:
- Comment removal
- Whitespace normalization
- Identifier anonymization
- Constant normalization

## 3. Token Similarity Module
Uses JPlag’s Greedy String Tiling (GST) algorithm for token-based similarity detection.

## 4. AST Structural Analysis Module
Analyzes Abstract Syntax Trees to detect structural similarities and obfuscation techniques.

## 5. Cross-Language Normalization Module
Maps language-specific constructs into a unified intermediate representation.

## 6. AI Embedding Module
Uses CodeBERT embeddings for semantic similarity analysis between code fragments.

## 7. ML Classifier & Risk Scoring Module
Combines all similarity features into a unified plagiarism risk score.

## 8. Clustering Module
Detects collusion groups and suspicious submission clusters.

## 9. Visualization Dashboard
Provides:
- Similarity heatmaps
- Network graphs
- Risk-ranked tables
- Code diff viewers

## 10. Report Generation Module
Generates:
- PDF reports
- CSV exports
- Statistical summaries

---

# Tech Stack

## Frontend
- React.js
- D3.js
- HTML
- CSS
- JavaScript

## Backend
- Python
- Flask / FastAPI

## AI & Machine Learning
- CodeBERT
- Transformers
- Scikit-learn

## Database
- MongoDB / MySQL

## Tools & Frameworks
- JPlag
- Git & GitHub

---
# Installation

## Prerequisites

Make sure the following tools are installed on your system:

- Git
- Python 3.10 or newer
- Node.js 20 or newer (npm included)
- Windows PowerShell

### Optional (Only for Spring Backend)

- Java 17
- Maven 3.9+

---

## 1. Clone the Repository

```bash
git clone https://github.com/Shivank2005/Code_Plagarism.git
cd Code_Plagarism
```

---

## 2. Create and Activate a Python Virtual Environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### If PowerShell Blocks Activation

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## 3. Install Python Dependencies

```bash
pip install -r requirements.txt
pip install flask flask-cors
```

---

## 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 5. Start the Full Application Stack

```powershell
.\start-all.ps1
```

This starts:

- CodeBERT Service → Port `8090`
- Backend API → Port `8082`
- Frontend → Port `5173`

Open in browser:

```text
http://localhost:5173/
```

---

# Manual Start (Alternative)

If you prefer running services separately:

## Terminal 1 — CodeBERT Service

```bash
cd codebert-service
python app.py
```

---

## Terminal 2 — Backend API

```bash
cd backend
python mock_app.py
```

---

## Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

---

# Quick Health Checks

## Frontend

```text
http://localhost:5173/
```

## Backend Health

```text
http://localhost:8082/health
```

## CodeBERT Service

```text
http://localhost:8090/
```
---

# Usage

1. Upload source code submissions
2. Select supported programming languages
3. Run plagiarism analysis
4. View similarity scores and visual reports
5. Export plagiarism reports

---

# Visualization Features

The dashboard includes:

- Similarity Heatmaps
- Submission Network Graphs
- Risk-Ranked Submission Lists
- Cluster Visualization
- Side-by-Side Code Diff Viewer

---

---

# Contributors

- Shivank

---

# License

This project is developed for academic and research purposes.

---

# References

- JPlag
- CodeBERT
- GraphCodeBERT
- CodeXGLUE
- AST-based clone detection research papers

---
