@echo off
echo ========================================
echo    COMPILING REAL DESKTOP MOVABLE LOGIN
echo ========================================
echo.
echo Making the window actually move on your desktop...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling real desktop movable login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:DesktopMovableLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist DesktopMovableLogin.exe (
    echo SUCCESS! Created DesktopMovableLogin.exe!
    echo This window will actually move on your desktop!
    echo.
    echo File size:
    dir DesktopMovableLogin.exe
    echo.
    echo Running the desktop movable login system...
    DesktopMovableLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
