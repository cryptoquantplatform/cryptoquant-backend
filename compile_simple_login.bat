@echo off
echo ========================================
echo    COMPILING SIMPLE DRAGGABLE LOGIN
echo ========================================
echo.
echo Using simple drag handle approach...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling simple draggable login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:SimpleLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist SimpleLogin.exe (
    echo SUCCESS! Created SimpleLogin.exe!
    echo This has a simple drag handle at the top!
    echo.
    echo File size:
    dir SimpleLogin.exe
    echo.
    echo Running the simple login system...
    SimpleLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
