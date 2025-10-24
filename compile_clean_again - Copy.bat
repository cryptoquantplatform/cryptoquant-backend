@echo off
echo ========================================
echo    COMPILING CLEAN VERSION AGAIN
echo ========================================
echo.
echo Undoing integrated controls - back to clean version...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling clean version again...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:CleanAgainLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist CleanAgainLogin.exe (
    echo SUCCESS! Created CleanAgainLogin.exe!
    echo This is the clean version without controls!
    echo.
    echo File size:
    dir CleanAgainLogin.exe
    echo.
    echo Running the clean login system again...
    CleanAgainLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
