@echo off
echo ========================================
echo    COMPILING FIXED WINDOW DIMENSIONS
echo ========================================
echo.
echo Fixed window dimensions - removed black bottom...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling fixed window dimensions...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:FixedWindowDimensionsLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist FixedWindowDimensionsLogin.exe (
    echo SUCCESS! Created FixedWindowDimensionsLogin.exe!
    echo This has fixed window dimensions - no black bottom!
    echo.
    echo File size:
    dir FixedWindowDimensionsLogin.exe
    echo.
    echo Running the fixed window dimensions login system...
    FixedWindowDimensionsLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
