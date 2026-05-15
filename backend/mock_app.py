"""
Minimal Flask backend API for PlagShield when Maven/Spring is not available.
This provides mock endpoints compatible with the React frontend.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from difflib import SequenceMatcher
import re
import io
import os
import uuid
from datetime import datetime
from zipfile import ZipFile

app = Flask(__name__)
CORS(app)

# In-memory storage for demo
batches = {}
results = {}


def _is_code_file(filename):
    name = filename.lower()
    return name.endswith((
        '.java', '.py', '.js', '.jsx', '.ts', '.tsx', '.c', '.cpp', '.h',
        '.cs', '.rb', '.php', '.kt', '.go', '.rs', '.swift', '.scala', '.json', '.md'
    ))


def _safe_destination(target_dir, relative_name):
    normalized = os.path.normpath(relative_name.replace('\\', '/'))
    destination = os.path.normpath(os.path.join(target_dir, normalized))
    if not destination.startswith(os.path.normpath(target_dir)):
        raise ValueError(f'Unsafe file path: {relative_name}')
    return destination


def _write_uploaded_file(uploaded_file, target_dir):
    relative_name = uploaded_file.filename or f'file-{uuid.uuid4().hex}'
    destination = _safe_destination(target_dir, relative_name)
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    uploaded_file.save(destination)


def _extract_zip(uploaded_file, target_dir):
    with ZipFile(uploaded_file.stream) as archive:
        for member in archive.infolist():
            if member.is_dir():
                continue
            relative_name = member.filename
            if not relative_name or relative_name.endswith('/'):
                continue
            destination = _safe_destination(target_dir, relative_name)
            os.makedirs(os.path.dirname(destination), exist_ok=True)
            with archive.open(member) as source, open(destination, 'wb') as target:
                target.write(source.read())


def _collect_files(batch_id):
    batch_path = os.path.join('storage', batch_id)
    files = []
    if not os.path.exists(batch_path):
        return files

    for root, _, filenames in os.walk(batch_path):
        for filename in filenames:
            if not _is_code_file(filename):
                continue
            file_path = os.path.join(root, filename)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as handle:
                    code = handle.read()
                relative_id = os.path.relpath(file_path, batch_path).replace('\\', '/')
                files.append({'id': relative_id, 'code': code})
            except OSError:
                continue
    return files


def _pair_similarity(text_a, text_b):
    if not text_a and not text_b:
        return 100.0

    normalized_a = _normalize_code(text_a)
    normalized_b = _normalize_code(text_b)

    if not normalized_a and not normalized_b:
        return 100.0

    token_a = _token_set(normalized_a)
    token_b = _token_set(normalized_b)
    structural_a = _structural_fingerprint(normalized_a)
    structural_b = _structural_fingerprint(normalized_b)

    token_score = _jaccard_score(token_a, token_b)
    structural_score = _jaccard_score(structural_a, structural_b)
    sequence_score = SequenceMatcher(None, normalized_a, normalized_b).ratio() * 100.0

    length_penalty = _length_penalty(normalized_a, normalized_b)

    raw_score = (
        token_score * 0.45
        + structural_score * 0.35
        + sequence_score * 0.20
    ) * length_penalty

    return round(max(0.0, min(raw_score, 100.0)), 2)


def _normalize_code(code):
    if not code:
        return ''

    text = re.sub(r'//.*?$', ' ', code, flags=re.MULTILINE)
    text = re.sub(r'/\*.*?\*/', ' ', text, flags=re.DOTALL)
    text = re.sub(r'"(?:\\.|[^"\\])*"', ' STR ', text)
    text = re.sub(r"'(?:\\.|[^'\\])*'", ' CHR ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()


def _token_set(code):
    return set(token for token in re.split(r'[^a-zA-Z0-9_]+', code) if token and not token.isdigit())


def _structural_fingerprint(code):
    keywords = {
        'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'try', 'catch', 'finally',
        'class', 'interface', 'enum', 'function', 'def', 'return', 'public', 'private',
        'protected', 'static', 'async', 'await', 'import', 'from', 'extends', 'implements'
    }
    return [token for token in re.split(r'[^a-zA-Z0-9_]+', code) if token in keywords]


def _jaccard_score(values_a, values_b):
    if not values_a and not values_b:
        return 100.0
    if not values_a or not values_b:
        return 0.0
    intersection = len(values_a.intersection(values_b))
    union = len(values_a.union(values_b)) or 1
    return (intersection / union) * 100.0


def _length_penalty(text_a, text_b):
    length_a = len(text_a)
    length_b = len(text_b)
    if length_a == 0 or length_b == 0:
        return 0.5
    max_length = max(length_a, length_b)
    diff_ratio = abs(length_a - length_b) / max_length
    return max(0.55, 1.0 - (diff_ratio * 0.25))


def _detect_rings(students, matrix, threshold=70.0):
    adjacency = {student: set() for student in students}
    for i, student_a in enumerate(students):
        for j, student_b in enumerate(students):
            if i >= j:
                continue
            if matrix[i][j] >= threshold:
                adjacency[student_a].add(student_b)
                adjacency[student_b].add(student_a)

    visited = set()
    rings = []
    for student in students:
        if student in visited or not adjacency[student]:
            continue
        stack = [student]
        group = []
        visited.add(student)
        while stack:
            node = stack.pop()
            group.append(node)
            for neighbor in adjacency[node]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    stack.append(neighbor)
        if len(group) > 1:
            rings.append(sorted(group))
    return rings

@app.route('/api/submissions/upload', methods=['POST'])
def upload():
    """Handle file uploads and create analysis batch."""
    batch_id = str(uuid.uuid4())
    target_dir = os.path.join('storage', batch_id)
    os.makedirs(target_dir, exist_ok=True)

    uploaded_files = request.files.getlist('file')
    for uploaded_file in uploaded_files:
        if not uploaded_file or not uploaded_file.filename:
            continue

        filename = uploaded_file.filename.lower()
        if filename.endswith('.zip'):
            _extract_zip(uploaded_file, target_dir)
        else:
            _write_uploaded_file(uploaded_file, target_dir)

    batches[batch_id] = {
        'id': batch_id,
        'status': 'UPLOADED',
        'createdAt': datetime.now().isoformat(),
        'storagePath': target_dir
    }
    return jsonify({'batchId': batch_id, 'status': 'success', 'message': 'Submissions uploaded successfully.'})

@app.route('/api/analysis/<batch_id>/start', methods=['POST'])
def start_analysis(batch_id):
    """Start plagiarism analysis for a batch."""
    if batch_id in batches:
        batches[batch_id]['status'] = 'PROCESSING'

        files = _collect_files(batch_id)
        students = [item['id'] for item in files]
        matrix = [[100.0 for _ in students] for _ in students]

        for i, file_a in enumerate(files):
            for j in range(i + 1, len(files)):
                file_b = files[j]
                score = _pair_similarity(file_a['code'], file_b['code'])
                matrix[i][j] = score
                matrix[j][i] = score

        results[batch_id] = {
            'students': students,
            'matrix': matrix,
            'rings': _detect_rings(students, matrix),
            'status': 'COMPLETED'
        }
        batches[batch_id]['status'] = 'COMPLETED'
    return jsonify({'message': 'Analysis started'})

@app.route('/api/analysis/<batch_id>/status', methods=['GET'])
def get_status(batch_id):
    """Get analysis status."""
    if batch_id in batches:
        batches[batch_id]['status'] = 'COMPLETED'  # Auto-complete for demo
        return jsonify(batches[batch_id])
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/analysis/<batch_id>/results', methods=['GET'])
def get_results(batch_id):
    """Get analysis results."""
    if batch_id in results:
        return jsonify(results[batch_id])
    return jsonify({'error': 'Not found'}), 404

@app.route('/api/analysis/<batch_id>/files', methods=['GET'])
def get_files(batch_id):
    """Get uploaded files for semantic analysis."""
    return jsonify({'files': _collect_files(batch_id)})

@app.route('/api/analysis/history', methods=['GET'])
def get_history():
    """Get analysis history."""
    return jsonify(list(batches.values()))

@app.route('/api/analysis/history', methods=['DELETE'])
def clear_history():
    """Clear analysis history."""
    batches.clear()
    results.clear()
    return jsonify({'message': 'History cleared'})

@app.route('/api/preferences', methods=['GET', 'PUT'])
def preferences():
    """Handle user preferences."""
    if request.method == 'PUT':
        return jsonify({'message': 'Preferences saved'})
    return jsonify({
        'highRiskThreshold': 75,
        'suspiciousThreshold': 40,
        'autoRefreshHistory': True,
        'compactMode': False,
        'animateHeatmap': True,
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'service': 'flask-backend-mock'})

if __name__ == '__main__':
    print('Starting PlagShield Flask Backend Mock on port 8082...')
    app.run(host='0.0.0.0', port=8082, debug=False)
