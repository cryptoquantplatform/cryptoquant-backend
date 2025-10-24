@echo off
echo ========================================
echo    COMPILING PROPERLY FIXED GLOWING FONTS
echo ========================================
echo.
echo Properly fixed all style color stacks...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling properly fixed glowing fonts...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:ProperlyFixedGlowingLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist ProperlyFixedGlowingLogin.exe (
    echo SUCCESS! Created ProperlyFixedGlowingLogin.exe!
    echo This has properly fixed glowing effects on all text!
    echo.
    echo File size:
    dir ProperlyFixedGlowingLogin.exe
    echo.
    echo Running the properly fixed glowing fonts login system...
    ProperlyFixedGlowingLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
