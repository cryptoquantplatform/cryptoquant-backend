# Download and install Visual Studio Build Tools
Write-Host "Installing Visual Studio Build Tools..." -ForegroundColor Green

# Download the Visual Studio Build Tools installer
$vsInstallerUrl = "https://aka.ms/vs/17/release/vs_buildtools.exe"
$vsInstallerPath = "vs_buildtools.exe"

Write-Host "Downloading Visual Studio Build Tools installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $vsInstallerUrl -OutFile $vsInstallerPath -ErrorAction Stop
    Write-Host "Download completed!" -ForegroundColor Green
    
    Write-Host "Installing Visual Studio Build Tools..." -ForegroundColor Yellow
    Write-Host "This will install the C++ compiler needed to create .exe files" -ForegroundColor Cyan
    
    # Install with C++ build tools
    Start-Process -FilePath $vsInstallerPath -ArgumentList "--quiet", "--wait", "--add", "Microsoft.VisualStudio.Workload.VCTools", "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64" -Wait
    
    Write-Host "Visual Studio Build Tools installed successfully!" -ForegroundColor Green
    Write-Host "Now I can compile the C++ code into a true .exe file!" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to download Visual Studio Build Tools automatically." -ForegroundColor Red
    Write-Host "Please download manually from: https://visualstudio.microsoft.com/downloads/" -ForegroundColor Yellow
    Write-Host "Select 'Build Tools for Visual Studio 2022' and install with C++ workload" -ForegroundColor Yellow
}
