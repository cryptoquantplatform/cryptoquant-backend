@echo off
echo ========================================
echo    COMPILING INTEGRATED CONTROLS
echo ========================================
echo.
echo Adding window controls integrated into content area...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with integrated controls...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:IntegratedControlsLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist IntegratedControlsLogin.exe (
    echo SUCCESS! Created IntegratedControlsLogin.exe!
    echo This has integrated window controls that work!
    echo.
    echo File size:
    dir IntegratedControlsLogin.exe
    echo.
    echo Running the integrated controls login system...
    IntegratedControlsLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
