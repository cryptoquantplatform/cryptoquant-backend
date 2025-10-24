@echo off
echo ========================================
echo    COMPILING TRANSPARENT LOGIN SYSTEM
echo ========================================
echo.
echo Creating transparent, draggable login window...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling transparent login system...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:TransparentLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist TransparentLogin.exe (
    echo SUCCESS! Created TransparentLogin.exe!
    echo This is a transparent, draggable login window!
    echo.
    echo File size:
    dir TransparentLogin.exe
    echo.
    echo Running the transparent login system...
    TransparentLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
