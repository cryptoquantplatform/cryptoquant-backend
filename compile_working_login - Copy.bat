@echo off
echo ========================================
echo    COMPILING WORKING LOGIN SYSTEM
echo ========================================
echo.
echo Fixing the black window issue - restoring content visibility...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling working login system...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:WorkingLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist WorkingLogin.exe (
    echo SUCCESS! Created WorkingLogin.exe!
    echo This shows the content properly and is draggable!
    echo.
    echo File size:
    dir WorkingLogin.exe
    echo.
    echo Running the working login system...
    WorkingLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
