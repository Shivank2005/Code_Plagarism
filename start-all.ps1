# ============================================================
# PlagShield - Start All Services
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "           Starting PlagShield Application" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# Paths
# ============================================================

$projectRoot = $PSScriptRoot

$backendPath  = Join-Path $projectRoot "backend"
$codebertPath = Join-Path $projectRoot "codebert-service"
$frontendPath = Join-Path $projectRoot "frontend"

# ============================================================
# Configuration
# ============================================================

$backendPort  = 8080
$codebertPort = 8090
$frontendPort = 5173

$javaHome = "C:\Program Files\Java\jdk-23"

$maven = "C:\Users\prasa\Desktop\Apache\maven\apache-maven-3.9.16\bin\mvn.cmd"

# ============================================================
# Validate folders
# ============================================================

Write-Host "[1/4] Checking project folders..." -ForegroundColor Cyan

if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] Backend folder not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $codebertPath)) {
    Write-Host "[ERROR] CodeBERT folder not found." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "[ERROR] Frontend folder not found." -ForegroundColor Red
    exit 1
}

Write-Host "Project folders OK." -ForegroundColor Green

# ============================================================
# Validate Java
# ============================================================

Write-Host ""
Write-Host "[2/4] Checking Java..." -ForegroundColor Cyan

if (-not (Test-Path "$javaHome\bin\java.exe")) {

    Write-Host "[ERROR] Java not found at:" -ForegroundColor Red
    Write-Host "$javaHome" -ForegroundColor Yellow

    exit 1
}

Write-Host "Java found:" -ForegroundColor Green
Write-Host "$javaHome" -ForegroundColor Yellow

# ============================================================
# Validate Maven
# ============================================================

if (-not (Test-Path $maven)) {

    Write-Host "[ERROR] Maven not found at:" -ForegroundColor Red
    Write-Host "$maven" -ForegroundColor Yellow

    exit 1
}

Write-Host "Maven found." -ForegroundColor Green

# ============================================================
# Check MongoDB
# ============================================================

Write-Host ""
Write-Host "Checking MongoDB..." -ForegroundColor Cyan

$mongo = Get-NetTCPConnection `
    -LocalPort 27017 `
    -State Listen `
    -ErrorAction SilentlyContinue

if ($mongo) {

    Write-Host "MongoDB is running on port 27017." -ForegroundColor Green

}
else {

    Write-Host "[WARNING] MongoDB is NOT running." -ForegroundColor Red
    Write-Host "The backend may not work correctly." -ForegroundColor Yellow
}

# ============================================================
# Clean stale processes
# ============================================================

Write-Host ""
Write-Host "Cleaning stale application processes..." -ForegroundColor Cyan

foreach ($port in @(
    $backendPort,
    $codebertPort,
    $frontendPort
)) {

    $connections = Get-NetTCPConnection `
        -LocalPort $port `
        -State Listen `
        -ErrorAction SilentlyContinue

    foreach ($connection in $connections) {

        $process = Get-Process `
            -Id $connection.OwningProcess `
            -ErrorAction SilentlyContinue

        if ($process) {

            Write-Host `
                "Stopping $($process.ProcessName) on port $port..." `
                -ForegroundColor DarkYellow

            Stop-Process `
                -Id $process.Id `
                -Force `
                -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 2

# ============================================================
# Start CodeBERT
# ============================================================

Write-Host ""
Write-Host "[1/3] Starting CodeBERT Service..." -ForegroundColor Green
Write-Host "      Port: $codebertPort" -ForegroundColor DarkGray

$codebertCommand = @"
Set-Location '$codebertPath'

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '        CodeBERT Service - Port 8090' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

python app.py
"@

Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        $codebertCommand
    ) `
    -WindowStyle Normal

Start-Sleep -Seconds 4

# ============================================================
# Start Backend
# ============================================================

Write-Host ""
Write-Host "[2/3] Starting Spring Backend..." -ForegroundColor Green
Write-Host "      Port: $backendPort" -ForegroundColor DarkGray

$backendCommand = @"
Set-Location '$backendPath'

`$env:JAVA_HOME = 'C:\Program Files\Java\jdk-23'
`$env:Path = 'C:\Program Files\Java\jdk-23\bin;' + `$env:Path

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '       Spring Backend - Port 8080' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'JAVA_HOME = ' `$env:JAVA_HOME -ForegroundColor Yellow
Write-Host ''

& '$maven' -q -DskipTests spring-boot:run
"@

Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        $backendCommand
    ) `
    -WindowStyle Normal

Start-Sleep -Seconds 6

# ============================================================
# Clean Vite cache
# ============================================================

Write-Host ""
Write-Host "Cleaning Vite cache..." -ForegroundColor DarkGray

$viteCache = Join-Path $frontendPath "node_modules\.vite"

if (Test-Path $viteCache) {

    Remove-Item `
        -Recurse `
        -Force `
        $viteCache `
        -ErrorAction SilentlyContinue
}

# ============================================================
# Start Frontend
# ============================================================

Write-Host ""
Write-Host "[3/3] Starting React Frontend..." -ForegroundColor Green
Write-Host "      Port: $frontendPort" -ForegroundColor DarkGray

$frontendCommand = @"
Set-Location '$frontendPath'

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host '        React Frontend - Port 5173' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing frontend dependencies...' -ForegroundColor Yellow
    npm install
}

npm run dev
"@

Start-Process powershell.exe `
    -ArgumentList @(
        "-NoExit",
        "-Command",
        $frontendCommand
    ) `
    -WindowStyle Normal

# ============================================================
# Finished
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "              ALL SERVICES STARTED" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "CodeBERT : http://localhost:8090" -ForegroundColor Yellow
Write-Host "Backend  : http://localhost:8080" -ForegroundColor Yellow
Write-Host "Frontend : http://localhost:5173" -ForegroundColor Yellow

Write-Host ""
Write-Host "Open: http://localhost:5173" -ForegroundColor Green
Write-Host ""