# Start all services: CodeBERT, Spring Backend, React Frontend

Write-Host "Starting PlagShield Application Stack..." -ForegroundColor Cyan

# Start CodeBERT Service (Port 8090)
Write-Host "`n[1/3] Starting CodeBERT Embedding Service on port 8090..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\codebert-service'; python app.py" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend API (Port 8082)
Write-Host "[2/3] Starting Backend API on port 8082..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python mock_app.py" -WindowStyle Normal

Start-Sleep -Seconds 5

# Start React Frontend (Port 5173)
Write-Host "[3/3] Starting React Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm install -q; npm run dev" -WindowStyle Normal

Write-Host ''
Write-Host '✓ All services launched!' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Access Dashboard: http://localhost:5173/' -ForegroundColor Yellow
