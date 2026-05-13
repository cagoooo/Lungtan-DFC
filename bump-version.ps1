# 一鍵升版腳本：自動更新所有 ?v= 版本字串、sw.js VERSION、version.json
# 用法：
#   .\bump-version.ps1                 # 自動 bump patch (1.0.0 -> 1.0.1)
#   .\bump-version.ps1 -NewVersion 1.2.0
#   .\bump-version.ps1 -Notes "修了 XXX bug"

param(
  [string]$NewVersion = "",
  [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# ---------- 讀取目前版本 ----------
$verJsonPath = Join-Path $root "version.json"
$current = (Get-Content $verJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json).version

# ---------- 計算新版本 ----------
if (-not $NewVersion) {
    $parts = $current.Split('.')
    $parts[2] = ([int]$parts[2] + 1).ToString()
    $NewVersion = $parts -join '.'
}

if (-not $Notes) { $Notes = "更新到 v$NewVersion" }

Write-Host ""
Write-Host "=== 升版 ===" -ForegroundColor Cyan
Write-Host "  目前版本：v$current"
Write-Host "  新版本：  v$NewVersion"
Write-Host "  備註：    $Notes"
Write-Host ""

# ---------- 1. 更新 version.json ----------
$released = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
$escNotes = $Notes -replace '\\','\\' -replace '"','\"'
$json = "{`n  `"version`": `"$NewVersion`",`n  `"released`": `"$released`",`n  `"notes`": `"$escNotes`"`n}`n"
[System.IO.File]::WriteAllText($verJsonPath, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "✓ version.json 已更新" -ForegroundColor Green

# ---------- 2. 更新 sw.js 的 VERSION 常數 ----------
$swPath = Join-Path $root "sw.js"
$swContent = [System.IO.File]::ReadAllText($swPath, [System.Text.UTF8Encoding]::new($false))
$swContent = [regex]::Replace($swContent, "const VERSION = 'v[^']+';", "const VERSION = 'v$NewVersion';")
[System.IO.File]::WriteAllText($swPath, $swContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "✓ sw.js VERSION 已更新" -ForegroundColor Green

# ---------- 3. 更新 version-check.js 的 APP_VERSION ----------
$vcPath = Join-Path $root "version-check.js"
$vcContent = [System.IO.File]::ReadAllText($vcPath, [System.Text.UTF8Encoding]::new($false))
$vcContent = [regex]::Replace($vcContent, "const APP_VERSION = '[^']+';", "const APP_VERSION = '$NewVersion';")
[System.IO.File]::WriteAllText($vcPath, $vcContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "✓ version-check.js APP_VERSION 已更新" -ForegroundColor Green

# ---------- 4. 更新所有 HTML 的 ?v= 版本字串 ----------
$htmlFiles = @("index.html", "viewer.html", "admin.html")
foreach ($f in $htmlFiles) {
    $p = Join-Path $root $f
    if (-not (Test-Path $p)) { continue }
    $c = [System.IO.File]::ReadAllText($p, [System.Text.UTF8Encoding]::new($false))
    $c = [regex]::Replace($c, '\?v=[\d\.]+', "?v=$NewVersion")
    [System.IO.File]::WriteAllText($p, $c, [System.Text.UTF8Encoding]::new($false))
    Write-Host "✓ $f ?v= 已更新" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ 全部升版完成 v$NewVersion" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步建議：" -ForegroundColor Yellow
Write-Host "  git add -A"
Write-Host "  git commit -m `"🚀 v$NewVersion - $Notes`""
Write-Host "  git push"
Write-Host ""
