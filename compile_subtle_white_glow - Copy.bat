@echo off
echo ========================================
echo    COMPILING SUBTLE WHITE GLOW
echo ========================================
echo.
echo Subtle white text with gentle glow...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling subtle white text with gentle glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:SubtleWhiteGlowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist SubtleWhiteGlowLogin.exe (
    echo SUCCESS! Created SubtleWhiteGlowLogin.exe!
    echo This has subtle white text with gentle glow!
    echo.
    echo File size:
    dir SubtleWhiteGlowLogin.exe
    echo.
    echo Running the subtle white glow login system...
    SubtleWhiteGlowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
