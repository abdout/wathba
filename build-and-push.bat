@echo off
setlocal enabledelayedexpansion

set MAX_RETRIES=10
set retry_count=0

echo [%date% %time%] Starting automated build and push workflow...
echo Maximum retries: %MAX_RETRIES%

:retry_loop
set /a retry_count+=1
echo.
echo --- Attempt %retry_count%/%MAX_RETRIES% ---

echo [%date% %time%] Running build...
call npm run build
if %errorlevel% equ 0 (
    echo [%date% %time%] Build successful!
    goto git_operations
) else (
    echo [%date% %time%] Build failed with exit code %errorlevel%
    if %retry_count% lss %MAX_RETRIES% (
        echo Retrying in 5 seconds...
        timeout /t 5 /nobreak > nul
        goto retry_loop
    ) else (
        echo Maximum retries reached. Build still failing.
        exit /b 1
    )
)

:git_operations
echo [%date% %time%] Build passed! Proceeding with git operations...

echo [%date% %time%] Checking git status...
git diff --exit-code >nul 2>&1
set diff_unstaged=%errorlevel%

git diff --cached --exit-code >nul 2>&1
set diff_staged=%errorlevel%

if %diff_unstaged% equ 0 if %diff_staged% equ 0 (
    echo No changes to commit.
    echo Workflow completed successfully!
    exit /b 0
)

echo [%date% %time%] Adding changes to git...
git add .
if %errorlevel% neq 0 (
    echo Git add failed
    exit /b 1
)

echo [%date% %time%] Creating commit...
git commit -m "Auto-commit: Build successful at %date% %time%"
if %errorlevel% neq 0 (
    echo Git commit failed
    exit /b 1
)

echo [%date% %time%] Pushing to GitHub...
git push
if %errorlevel% neq 0 (
    echo Git push failed
    exit /b 1
)

echo [%date% %time%] Successfully pushed to GitHub!
echo Workflow completed successfully!
exit /b 0