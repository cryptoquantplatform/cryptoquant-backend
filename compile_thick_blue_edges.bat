@echo off
echo ========================================
echo    COMPILING THICKER BLUE EDGES
echo ========================================
echo.
echo Making the blue rounded edges much thicker...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with thicker blue edges...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:ThickBlueEdgesLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist ThickBlueEdgesLogin.exe (
    echo SUCCESS! Created ThickBlueEdgesLogin.exe!
    echo This has much thicker blue rounded edges!
    echo.
    echo File size:
    dir ThickBlueEdgesLogin.exe
    echo.
    echo Running the thick blue edges login system...
    ThickBlueEdgesLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
