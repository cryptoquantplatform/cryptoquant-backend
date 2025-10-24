@echo off
echo ========================================
echo    COMPILING ROUNDED WINDOW LOGIN
echo ========================================
echo.
echo Removing maximize button and adding rounded window edges...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling rounded window login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:RoundedWindowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist RoundedWindowLogin.exe (
    echo SUCCESS! Created RoundedWindowLogin.exe!
    echo This has rounded window edges and no maximize button!
    echo.
    echo File size:
    dir RoundedWindowLogin.exe
    echo.
    echo Running the rounded window login system...
    RoundedWindowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
