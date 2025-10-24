@echo off
echo ========================================
echo    COMPILING BEAUTIFUL BLUE-PURPLE GLOW
echo ========================================
echo.
echo Creating beautiful blue-purple glow like the reference...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with beautiful blue-purple glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:BeautifulBluePurpleGlowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist BeautifulBluePurpleGlowLogin.exe (
    echo SUCCESS! Created BeautifulBluePurpleGlowLogin.exe!
    echo This has the beautiful blue-purple glow like your reference!
    echo.
    echo File size:
    dir BeautifulBluePurpleGlowLogin.exe
    echo.
    echo Running the beautiful blue-purple glow login system...
    BeautifulBluePurpleGlowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
