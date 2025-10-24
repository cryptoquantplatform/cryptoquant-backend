@echo off
echo ========================================
echo    COMPILING NO BLACK TOP LOGIN
echo ========================================
echo.
echo Removing the black title bar area completely...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling no black top login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:NoBlackTopLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist NoBlackTopLogin.exe (
    echo SUCCESS! Created NoBlackTopLogin.exe!
    echo This has NO black top area!
    echo.
    echo File size:
    dir NoBlackTopLogin.exe
    echo.
    echo Running the no black top login system...
    NoBlackTopLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
