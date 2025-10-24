@echo off
echo ========================================
echo    COMPILING CONFIGURATION PANEL
echo ========================================
echo.
echo Creating the configuration panel that matches your image...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling configuration panel...
cl /EHsc config_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:ConfigurationPanel.exe /link d3d11.lib dxgi.lib
echo.
if exist ConfigurationPanel.exe (
    echo SUCCESS! Created ConfigurationPanel.exe!
    echo This matches your configuration panel design!
    echo.
    echo File size:
    dir ConfigurationPanel.exe
    echo.
    echo Running the configuration panel...
    ConfigurationPanel.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
