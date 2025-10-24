@echo off
echo ========================================
echo    COMPILING TRULY ROUNDED WINDOW
echo ========================================
echo.
echo Adding actual Windows API rounded corners to the window...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling truly rounded window login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:TrulyRoundedLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist TrulyRoundedLogin.exe (
    echo SUCCESS! Created TrulyRoundedLogin.exe!
    echo This has ACTUAL rounded window edges!
    echo.
    echo File size:
    dir TrulyRoundedLogin.exe
    echo.
    echo Running the truly rounded login system...
    TrulyRoundedLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
