param([switch]$SkipBuild)
$ErrorActionPreference = "Continue"
$wd = "C:\Users\CynetAdmin\Desktop\New folder\shop"
Set-Location $wd

Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

if (-not $SkipBuild) {
  npm run build
  if ($LASTEXITCODE -ne 0) { Write-Host "BUILD FAILED"; exit 1 }
  Copy-Item -Recurse -Force .next/static .next/standalone/.next/static
  Copy-Item -Recurse -Force public/. .next/standalone/public/
}

$env:DATABASE_URL = "postgresql://postgres:shop_dev_password@localhost:5432/shop"
$p = Start-Process node -ArgumentList ".next/standalone/server.js" -RedirectStandardOutput "server.log" -RedirectStandardError "server.err.log" -NoNewWindow -PassThru -WorkingDirectory $wd
Start-Sleep -Seconds 5
try {
  $r = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 20
  Write-Host "SERVER UP: HTTP $($r.StatusCode)"
} catch {
  Write-Host "SERVER DOWN: $($_.Exception.Message)"
  Get-Content server.err.log -Tail 10
}