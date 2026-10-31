$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

Write-Host "=== PREPARING CLEAN EXPO WEB PRODUCTION BUNDLE ==="
$envLocal = Join-Path $root ".env.local"
$envLocalBak = Join-Path $root ".env.local.bak"
$hasEnvLocal = Test-Path $envLocal

try {
    if ($hasEnvLocal) {
        Write-Host "Temporarily stashing .env.local to avoid baking secrets into public branch..."
        Move-Item -Path $envLocal -Destination $envLocalBak -Force
    }

    Write-Host "Exporting Expo Web static bundle (http://localhost:8081 production build)..."
    $env:EXPO_NO_TELEMETRY = "1"
    node node_modules/expo/bin/cli export --platform web -c

    Write-Host "Preparing 404.html and .nojekyll for GitHub Pages..."
    Copy-Item -Path "dist/index.html" -Destination "dist/404.html" -Force
    New-Item -ItemType File -Path "dist/.nojekyll" -Force | Out-Null
}
finally {
    if ($hasEnvLocal -and (Test-Path $envLocalBak)) {
        Write-Host "Restoring .env.local..."
        Move-Item -Path $envLocalBak -Destination $envLocal -Force
    }
}

$tempIndex = Join-Path $root ".git\temp-ghpages-index"
if (Test-Path $tempIndex) { Remove-Item $tempIndex -Force }

$env:GIT_INDEX_FILE = $tempIndex
Write-Host "Adding dist/ files to temporary git index..."
git --work-tree=dist add -A

Write-Host "Writing tree..."
$tree = (git write-tree).Trim()
Write-Host "Tree: $tree"

$parent = (git rev-parse origin/gh-pages).Trim()
Write-Host "Parent: $parent"

$msg = "Deploy Expo Web production bundle (http://localhost:8081) to GitHub Pages"
$commit = (git commit-tree $tree -p $parent -m $msg).Trim()
Write-Host "Commit: $commit"

Write-Host "Pushing commit to origin/gh-pages..."
git push origin "${commit}:refs/heads/gh-pages"

Remove-Item $tempIndex -Force -ErrorAction SilentlyContinue
Write-Host "=== EXPO WEB DEPLOYMENT TO GITHUB PAGES COMPLETE ==="
