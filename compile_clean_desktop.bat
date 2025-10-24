@echo off
echo ========================================
echo    COMPILING CLEAN DESKTOP MOVABLE LOGIN
echo ========================================
echo.
echo Removing ImGui dragging, keeping only desktop movement...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling clean desktop movable login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:CleanDesktopLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist CleanDesktopLogin.exe (
    echo SUCCESS! Created CleanDesktopLogin.exe!
    echo This only moves on your desktop, not within the window!
    echo.
    echo File size:
    dir CleanDesktopLogin.exe
    echo.
    echo Running the clean desktop movable login system...
    CleanDesktopLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
