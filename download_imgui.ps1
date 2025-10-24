# Download ImGui source code
Write-Host "Downloading ImGui source code..." -ForegroundColor Green

$imguiUrl = "https://github.com/ocornut/imgui/archive/refs/heads/master.zip"
$imguiZip = "imgui-master.zip"
$imguiDir = "imgui-master"

try {
    Write-Host "Downloading ImGui..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $imguiUrl -OutFile $imguiZip -ErrorAction Stop
    Write-Host "Download completed!" -ForegroundColor Green
    
    Write-Host "Extracting ImGui..." -ForegroundColor Yellow
    Expand-Archive -Path $imguiZip -DestinationPath "." -Force
    Write-Host "Extraction completed!" -ForegroundColor Green
    
    Write-Host "ImGui source code ready!" -ForegroundColor Green
    Write-Host "Now I can compile the C++ code into a true .exe file!" -ForegroundColor Green
    
} catch {
    Write-Host "Failed to download ImGui automatically." -ForegroundColor Red
    Write-Host "Please download manually from: https://github.com/ocornut/imgui" -ForegroundColor Yellow
}
