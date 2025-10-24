@echo off
echo ========================================
echo    COMPILING STRONG WHITE + BLUE GLOW
echo ========================================
echo.
echo Stronger white text + pure blue glow (no purple)...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling strong white text with pure blue glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:StrongWhiteBlueGlowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist StrongWhiteBlueGlowLogin.exe (
    echo SUCCESS! Created StrongWhiteBlueGlowLogin.exe!
    echo This has stronger white text and pure blue glow!
    echo.
    echo File size:
    dir StrongWhiteBlueGlowLogin.exe
    echo.
    echo Running the strong white + blue glow login system...
    StrongWhiteBlueGlowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
