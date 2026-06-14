# อัปโหลดค่าจาก .env ไป Vercel (รันจากโฟลเดอร์โปรเจกต)
# ต้องติดตั้ง Vercel CLI ก่อน: npm i -g vercel
# แล้ว login: vercel login
# link โปรเจกต: vercel link

$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot ".." ".env" | Resolve-Path -ErrorAction SilentlyContinue

if (-not $envFile) {
  Write-Host "ไม่พบไฟล์ .env — สร้างจาก .env.example ก่อน" -ForegroundColor Red
  exit 1
}

Write-Host "จะอ่านค่าจาก: $envFile"
Write-Host "แล้วเพิ่มทีละตัวไป Vercel Production (ต้อง confirm เอง)"
Write-Host ""

$lines = Get-Content $envFile | Where-Object {
  $_ -match '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' -and $_ -notmatch '^\s*#'
}

foreach ($line in $lines) {
  $name, $value = $line -split '=', 2
  $name = $name.Trim()
  $value = $value.Trim().Trim('"').Trim("'")

  if ([string]::IsNullOrWhiteSpace($name)) { continue }

  Write-Host "→ vercel env add $name production" -ForegroundColor Cyan
  $value | vercel env add $name production
}

Write-Host ""
Write-Host "เสร็จแล้ว — ไป Vercel → Deployments → Redeploy" -ForegroundColor Green
