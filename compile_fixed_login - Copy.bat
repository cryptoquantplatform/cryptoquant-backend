@echo off
echo ========================================
echo    COMPILING FIXED LOGIN SYSTEM
echo ========================================
echo.
echo Fixing the dragging issue - making entire window draggable...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling fixed login system...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:FixedLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist FixedLogin.exe (
    echo SUCCESS! Created FixedLogin.exe!
    echo This has proper dragging across the entire window!
    echo.
    echo File size:
    dir FixedLogin.exe
    echo.
    echo Running the fixed login system...
    FixedLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
