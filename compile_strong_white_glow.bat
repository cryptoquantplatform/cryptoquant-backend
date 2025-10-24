@echo off
echo ========================================
echo    COMPILING STRONG WHITE GLOW
echo ========================================
echo.
echo Strong white text with white glow effect...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling strong white text with white glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:StrongWhiteGlowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist StrongWhiteGlowLogin.exe (
    echo SUCCESS! Created StrongWhiteGlowLogin.exe!
    echo This has strong white text with white glow!
    echo.
    echo File size:
    dir StrongWhiteGlowLogin.exe
    echo.
    echo Running the strong white glow login system...
    StrongWhiteGlowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
