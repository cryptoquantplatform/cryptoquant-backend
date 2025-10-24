@echo off
echo ========================================
echo    COMPILING FIXED NO-DELAY LOGIN
echo ========================================
echo.
echo Removing all ImGui dragging and fixing delayed movement...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling fixed no-delay login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:NoDelayLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist NoDelayLogin.exe (
    echo SUCCESS! Created NoDelayLogin.exe!
    echo This has NO ImGui dragging and NO delayed movement!
    echo.
    echo File size:
    dir NoDelayLogin.exe
    echo.
    echo Running the no-delay login system...
    NoDelayLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
