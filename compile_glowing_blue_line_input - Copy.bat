@echo off
echo ========================================
echo    COMPILING GLOWING BLUE LINE INPUT
echo ========================================
echo.
echo Input field with glowing blue line like reference...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling input field with glowing blue line...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:GlowingBlueLineInputLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist GlowingBlueLineInputLogin.exe (
    echo SUCCESS! Created GlowingBlueLineInputLogin.exe!
    echo This has input field with glowing blue line!
    echo.
    echo File size:
    dir GlowingBlueLineInputLogin.exe
    echo.
    echo Running the glowing blue line input login system...
    GlowingBlueLineInputLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
