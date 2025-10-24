@echo off
echo ========================================
echo    COMPILING LOGIN SYSTEM
echo ========================================
echo.
echo Creating the login system that matches your image...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling login system...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:LoginSystem.exe /link d3d11.lib dxgi.lib
echo.
if exist LoginSystem.exe (
    echo SUCCESS! Created LoginSystem.exe!
    echo This matches your login interface design!
    echo.
    echo File size:
    dir LoginSystem.exe
    echo.
    echo Running the login system...
    LoginSystem.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
