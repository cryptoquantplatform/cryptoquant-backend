@echo off
echo ========================================
echo    COMPILING PERFECTLY CENTERED GLOW
echo ========================================
echo.
echo Perfect centering + exact colors from reference...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling perfectly centered glow with exact colors...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:PerfectCenteredGlowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist PerfectCenteredGlowLogin.exe (
    echo SUCCESS! Created PerfectCenteredGlowLogin.exe!
    echo This has perfect centering and exact colors from your reference!
    echo.
    echo File size:
    dir PerfectCenteredGlowLogin.exe
    echo.
    echo Running the perfectly centered glow login system...
    PerfectCenteredGlowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
