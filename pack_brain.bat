@echo off
setlocal

:: 1. Get the current folder name
for %%I in (.) do set "FolderName=%%~nxI"

:: 2. Set the output filename
set "ZipFileName=%FolderName%_Brain_Migration.zip"

echo ========================================================
echo  Packing "Brain" for: %FolderName%
echo  Target File: %ZipFileName%
echo ========================================================
echo.

:: 3. Remove old zip if it exists to avoid errors
if exist "%ZipFileName%" del "%ZipFileName%"

:: 4. Run PowerShell to zip the folder contents
::    Excludes: node_modules, .next, .git, .vscode, and the zip file itself.
echo Compressing files (this might take a moment)...

powershell -Command "Get-ChildItem -Path . -Exclude 'node_modules','.next','.git','.vscode','%ZipFileName%','*.log' | Compress-Archive -DestinationPath '%ZipFileName%'"

echo.
echo ========================================================
if exist "%ZipFileName%" (
    echo  SUCCESS! 🧠
    echo  File created: %ZipFileName%
) else (
    echo  ERROR: Failed to create zip file.
)
echo ========================================================
pause