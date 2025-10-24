@echo off
echo ========================================
echo    COMPILING WITH TRANSPARENT CONTROLS
echo ========================================
echo.
echo Adding transparent minimize and close buttons...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with transparent controls...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:TransparentControlsLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist TransparentControlsLogin.exe (
    echo SUCCESS! Created TransparentControlsLogin.exe!
    echo This has transparent minimize and close buttons!
    echo.
    echo File size:
    dir TransparentControlsLogin.exe
    echo.
    echo Running the transparent controls login system...
    TransparentControlsLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
