@echo off
setlocal

:: --- CONFIGURATION ---
for %%I in (.) do set "FolderName=%%~nxI"
set "ZipFileName=%FolderName%_Brain_Lite.zip"
set "TreeFile=_PROJECT_STRUCTURE.txt"
set "TempScript=temp_zipper.ps1"

echo ========================================================
echo  Creating Surgical Context Pack (10 Files)
echo  Target: %ZipFileName%
echo ========================================================

:: 1. Create the PowerShell script line-by-line (Safest method)
echo $TreeFile = "%TreeFile%" > %TempScript%
echo $ZipFile = "%ZipFileName%" >> %TempScript%

:: Write Structure Map Logic
echo Write-Host "[1/3] Generating project structure map..." >> %TempScript%
echo Get-ChildItem -Recurse -Exclude 'node_modules','.next','.git','.vscode','dist','build','*.zip' ^| Select-Object -ExpandProperty FullName ^| ForEach-Object { $_.Substring((Get-Location).Path.Length + 1) } ^> $TreeFile >> %TempScript%

:: Write File List Logic
echo $criticalFiles = @( >> %TempScript%
echo     $TreeFile, >> %TempScript%
echo     "PROJECT_CONTEXT.md", >> %TempScript%
echo     "package.json", >> %TempScript%
echo     "middleware.ts", >> %TempScript%
echo     "prisma\schema.prisma", >> %TempScript%
echo     "app\globals.css", >> %TempScript%
echo     "app\api\auth\[...nextauth]\route.ts", >> %TempScript%
echo     "app\admin\page.tsx", >> %TempScript%
echo     "components\LogoutButton.tsx", >> %TempScript%
echo     "app\login\page.tsx" >> %TempScript%
echo ) >> %TempScript%

:: Write Zip Logic
echo Write-Host "[2/3] Compressing files..." >> %TempScript%
echo $filesToZip = $criticalFiles ^| Where-Object { Test-Path $_ } >> %TempScript%
echo if ($filesToZip.Count -eq 0) { Write-Error "No files found!"; exit 1 } >> %TempScript%
echo Compress-Archive -Path $filesToZip -DestinationPath $ZipFile -Force >> %TempScript%

:: 2. Execute the script
powershell -ExecutionPolicy Bypass -File %TempScript%

:: 3. Cleanup
if exist "%TreeFile%" del "%TreeFile%"
if exist "%TempScript%" del "%TempScript%"

echo.
if exist "%ZipFileName%" (
    echo  SUCCESS! 🧠
    echo  Archive Ready: %ZipFileName%
) else (
    echo  ERROR: Zip file was not created.
)
echo ========================================================
pause