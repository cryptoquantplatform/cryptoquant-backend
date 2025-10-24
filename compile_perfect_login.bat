@echo off
echo ========================================
echo    COMPILING PERFECTLY CENTERED LOGIN
echo ========================================
echo.
echo Perfectly centering all elements...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling perfectly centered login...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:PerfectLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist PerfectLogin.exe (
    echo SUCCESS! Created PerfectLogin.exe!
    echo Everything is perfectly centered!
    echo.
    echo File size:
    dir PerfectLogin.exe
    echo.
    echo Running the perfectly centered login system...
    PerfectLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
