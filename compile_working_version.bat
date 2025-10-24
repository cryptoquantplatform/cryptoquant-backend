@echo off
echo ========================================
echo    COMPILING WORKING VERSION
echo ========================================
echo.
echo Back to the version that was actually working...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling working version...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:WorkingVersionLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist WorkingVersionLogin.exe (
    echo SUCCESS! Created WorkingVersionLogin.exe!
    echo This is the working version!
    echo.
    echo File size:
    dir WorkingVersionLogin.exe
    echo.
    echo Running the working login system...
    WorkingVersionLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
