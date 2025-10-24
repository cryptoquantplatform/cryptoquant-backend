@echo off
echo ========================================
echo    COMPILING MORE TRANSPARENT LOGIN
echo ========================================
echo.
echo Making the window much more transparent...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling more transparent login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:MoreTransparentLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist MoreTransparentLogin.exe (
    echo SUCCESS! Created MoreTransparentLogin.exe!
    echo This is much more transparent!
    echo.
    echo File size:
    dir MoreTransparentLogin.exe
    echo.
    echo Running the more transparent login system...
    MoreTransparentLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
