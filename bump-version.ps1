# Auto-bump version: updates ?v= strings, sw.js VERSION, version-check.js APP_VERSION, version.json
# Usage:
#   .\bump-version.ps1                       # auto bump patch (1.0.0 -> 1.0.1)
#   .\bump-version.ps1 -NewVersion 1.2.0
#   .\bump-version.ps1 -Notes "fix XX bug"
# (ASCII-only so PS 5.1 doesn't misread UTF-8 without BOM)

param(
  [string]$NewVersion = "",
  [string]$Notes = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$verJsonPath = Join-Path $root "version.json"
$current = (Get-Content $verJsonPath -Raw -Encoding UTF8 | ConvertFrom-Json).version

if (-not $NewVersion) {
    $parts = $current.Split('.')
    $parts[2] = ([int]$parts[2] + 1).ToString()
    $NewVersion = $parts -join '.'
}

if (-not $Notes) { $Notes = "Update to v$NewVersion" }

Write-Host ""
Write-Host "=== Bump version ===" -ForegroundColor Cyan
Write-Host "  Current: v$current"
Write-Host "  New:     v$NewVersion"
Write-Host "  Notes:   $Notes"
Write-Host ""

# 1. version.json
$released = Get-Date -Format "yyyy-MM-ddTHH:mm:sszzz"
$escNotes = $Notes -replace '\\','\\' -replace '"','\"'
$json = "{`n  `"version`": `"$NewVersion`",`n  `"released`": `"$released`",`n  `"notes`": `"$escNotes`"`n}`n"
[System.IO.File]::WriteAllText($verJsonPath, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "[ok] version.json updated" -ForegroundColor Green

# 2. sw.js
$swPath = Join-Path $root "sw.js"
$swContent = [System.IO.File]::ReadAllText($swPath, [System.Text.UTF8Encoding]::new($false))
$pattern1 = "const VERSION = 'v[^']+';"
$replacement1 = "const VERSION = 'v$NewVersion';"
$swContent = [regex]::Replace($swContent, $pattern1, $replacement1)
[System.IO.File]::WriteAllText($swPath, $swContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "[ok] sw.js VERSION updated" -ForegroundColor Green

# 3. version-check.js
$vcPath = Join-Path $root "version-check.js"
$vcContent = [System.IO.File]::ReadAllText($vcPath, [System.Text.UTF8Encoding]::new($false))
$pattern2 = "const APP_VERSION = '[^']+';"
$replacement2 = "const APP_VERSION = '$NewVersion';"
$vcContent = [regex]::Replace($vcContent, $pattern2, $replacement2)
[System.IO.File]::WriteAllText($vcPath, $vcContent, [System.Text.UTF8Encoding]::new($false))
Write-Host "[ok] version-check.js APP_VERSION updated" -ForegroundColor Green

# 4. all HTML files
$htmlFiles = @("index.html", "viewer.html", "admin.html", "report.html")
foreach ($f in $htmlFiles) {
    $p = Join-Path $root $f
    if (-not (Test-Path $p)) { continue }
    $c = [System.IO.File]::ReadAllText($p, [System.Text.UTF8Encoding]::new($false))
    $c = [regex]::Replace($c, '\?v=[\d\.]+', "?v=$NewVersion")
    [System.IO.File]::WriteAllText($p, $c, [System.Text.UTF8Encoding]::new($false))
    Write-Host "[ok] $f ?v= updated" -ForegroundColor Green
}

Write-Host ""
Write-Host "[done] Bumped to v$NewVersion" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  git add -A"
Write-Host "  git commit -m 'bump v$NewVersion - $Notes'"
Write-Host "  git push"
Write-Host ""
