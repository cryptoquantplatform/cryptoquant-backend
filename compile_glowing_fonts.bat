@echo off
echo ========================================
echo    COMPILING WITH GLOWING FONTS
echo ========================================
echo.
echo Adding glowing effects to all text...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with glowing fonts...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:GlowingFontsLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist GlowingFontsLogin.exe (
    echo SUCCESS! Created GlowingFontsLogin.exe!
    echo This has glowing effects on all text!
    echo.
    echo File size:
    dir GlowingFontsLogin.exe
    echo.
    echo Running the glowing fonts login system...
    GlowingFontsLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
