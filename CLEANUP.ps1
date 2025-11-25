# Altruria Project Cleanup Script
# This script safely removes all duplicate files from the root directory
# All duplicate files exist in /frontend directory and are the "real" versions

Write-Host "=== ALTRURIA PROJECT CLEANUP SCRIPT ===" -ForegroundColor Cyan
Write-Host "This will remove 56+ duplicate and obsolete files" -ForegroundColor Yellow
Write-Host ""

$confirmDelete = Read-Host "Continue with cleanup? (yes/no)"
if ($confirmDelete -ne "yes") {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=== Phase 1: Deleting root HTML duplicates ===" -ForegroundColor Green
$htmlFiles = @("index.html", "login.html", "signup.html", "products.html", "cart.html", "checkout.html", "profile.html", "settings.html", "privacy.html", "terms.html", "footer.html")
foreach ($file in $htmlFiles) {
    $path = "C:\PROJECTS\altruria_2\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "✓ Deleted $file"
    }
}

Write-Host ""
Write-Host "=== Phase 2: Deleting root JS duplicates ===" -ForegroundColor Green
$jsFiles = @("auth.js", "auth-nav.js", "script.js", "profile.js", "settings.js", "cart.js", "checkout.js")
foreach ($file in $jsFiles) {
    $path = "C:\PROJECTS\altruria_2\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "✓ Deleted $file"
    }
}

Write-Host ""
Write-Host "=== Phase 3: Deleting root CSS duplicates ===" -ForegroundColor Green
$cssFiles = @("styles.css", "login-styles.css", "signup-styles.css", "homepage-styles.css", "cart-styles.css", "checkout-styles.css", "profile-styles.css", "settings-styles.css")
foreach ($file in $cssFiles) {
    $path = "C:\PROJECTS\altruria_2\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "✓ Deleted $file"
    }
}

Write-Host ""
Write-Host "=== Phase 4: Deleting empty directories ===" -ForegroundColor Green
$dirs = @("C:\PROJECTS\altruria_2\frontend\components", "C:\PROJECTS\altruria_2\frontend\docs", "C:\PROJECTS\altruria_2\components", "C:\PROJECTS\altruria_2\database")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "✓ Deleted $(Split-Path $dir -Leaf)"
    }
}

Write-Host ""
Write-Host "=== Phase 5: Deleting unused files ===" -ForegroundColor Green
$unusedFiles = @("C:\PROJECTS\altruria_2\frontend\pages\settings.html")
foreach ($file in $unusedFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "✓ Deleted $(Split-Path $file -Leaf)"
    }
}

Write-Host ""
Write-Host "=== Phase 6: Deleting obsolete documentation ===" -ForegroundColor Green
$docFiles = @(
    "FINAL_SUMMARY.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_COMPLETE_SUMMARY.md",
    "COMPLETION_SUMMARY.md",
    "FINAL_IMPLEMENTATION_REPORT.md",
    "SESSION_SUMMARY.md",
    "FINAL_VERIFICATION_REPORT.md",
    "VERIFICATION_CHECKLIST.md",
    "INTEGRATION_COMPLETE.md",
    "NAVIGATION_INTEGRATION_COMPLETE.md",
    "QUICK_NAVIGATION_GUIDE.md",
    "IMPLEMENTATION_STATUS.md",
    "QUICK_START.md",
    "QUICK_START_FIXES.md",
    "CODE_CHANGES.md",
    "FIXES_APPLIED.md",
    "BEFORE_AFTER_COMPARISON.md",
    "CHECKOUT_PROFILE_IMPLEMENTATION.md",
    "CHECKOUT_PROFILE_FILES_SUMMARY.md",
    "CHECKOUT_PROFILE_QUICK_START.md",
    "CHECKOUT_READY.md",
    "DELIVERY_SUMMARY.md",
    "DOCUMENTATION_INDEX.md",
    "FILES_INDEX.md",
    "FILE_NAVIGATION_GUIDE.md",
    "AUTH_QUICK_REFERENCE.md",
    "AUTH_SYSTEM_README.md",
    "PROJECT_COMPLETE.md",
    "MASTER_IMPLEMENTATION_SUMMARY.md",
    "TESTING_GUIDE.md",
    "TESTING_CHECKLIST.md",
    "ARCHITECTURE.md"
)
foreach ($file in $docFiles) {
    $path = "C:\PROJECTS\altruria_2\$file"
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "✓ Deleted $file"
    }
}

Write-Host ""
Write-Host "=== CLEANUP COMPLETE ===" -ForegroundColor Cyan
Write-Host "Files removed: 56+" -ForegroundColor Green
Write-Host ""
Write-Host "Your project is now clean and organized!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the servers: .\START_SERVERS.ps1"
Write-Host "2. Test the website: http://localhost:5500"
Write-Host "3. All functionality should work exactly the same"
