# Start all services: CodeBERT, Spring Backend, React Frontend

Write-Host "Starting PlagShield Application Stack..." -ForegroundColor Cyan

$javaCommand = Get-Command java -ErrorAction SilentlyContinue
if ($javaCommand) {
	$javaHome = Split-Path (Split-Path $javaCommand.Source -Parent) -Parent
	$env:JAVA_HOME = $javaHome
	Write-Host "Detected JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
} elseif (Test-Path 'C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot') {
	$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot'
	Write-Host "Using fallback JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Yellow
} else {
	Write-Host 'JAVA_HOME not detected. Backend build tools may require manual Java configuration.' -ForegroundColor Yellow
}

# ── Cleanup: kill stale processes on our ports ──
Write-Host "`nCleaning up stale processes..." -ForegroundColor DarkGray
foreach ($port in @(8082, 8090, 5173)) {
	$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
	foreach ($c in $conns) {
		$proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
		# Don't kill the IDE's Java Language Server
		if ($proc -and $proc.ProcessName -ne 'Code' -and $proc.Id -ne $PID) {
			Write-Host "  Killing stale process on port ${port}: $($proc.ProcessName) (PID $($proc.Id))" -ForegroundColor DarkYellow
			Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
		}
	}
}
Start-Sleep -Seconds 2

# Remove H2 lock file if it exists
$lockFile = Join-Path $PSScriptRoot 'backend\data\plagdb.mv.db'
$lockFileLock = Join-Path $PSScriptRoot 'backend\data\plagdb.lock.db'
if (Test-Path $lockFileLock) {
	Remove-Item $lockFileLock -Force -ErrorAction SilentlyContinue
	Write-Host "  Removed stale H2 lock file" -ForegroundColor DarkYellow
}

# Start CodeBERT Service (Port 8090)
Write-Host "`n[1/3] Starting CodeBERT Embedding Service on port 8090..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\codebert-service'; python app.py" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend API (Port 8082)
Write-Host "[2/3] Starting Spring Backend API on port 8082..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME='$env:JAVA_HOME'; `$env:Path='`$env:JAVA_HOME\bin;' + `$env:Path; cd '$PSScriptRoot\backend'; & 'C:\Users\shiva\maven\maven-3.9.15\bin\mvn.cmd' -q -DskipTests spring-boot:run" -WindowStyle Normal

Start-Sleep -Seconds 5

# Clean Vite cache to prevent EPERM lock errors
Remove-Item -Recurse -Force "$PSScriptRoot\frontend\node_modules\.vite" -ErrorAction SilentlyContinue

# Start React Frontend (Port 5173)
Write-Host "[3/3] Starting React Frontend on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm install -q; npm run dev" -WindowStyle Normal

Write-Host ''
Write-Host '✓ All services launched!' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Access Dashboard: http://localhost:5173/' -ForegroundColor Yellow
