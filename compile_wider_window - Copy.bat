@echo off
echo ========================================
echo    COMPILING WIDER WINDOW
echo ========================================
echo.
echo Making window wider and reducing height...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling wider window version...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:WiderWindowLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist WiderWindowLogin.exe (
    echo SUCCESS! Created WiderWindowLogin.exe!
    echo This has a wider window with reduced height!
    echo.
    echo File size:
    dir WiderWindowLogin.exe
    echo.
    echo Running the wider window login system...
    WiderWindowLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
