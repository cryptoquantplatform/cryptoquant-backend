@echo off
echo ========================================
echo    COMPILING CLEAN VERSION AGAIN
echo ========================================
echo.
echo Undoing transparent logo - back to clean version...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling clean version without logo...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:CleanNoLogoLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist CleanNoLogoLogin.exe (
    echo SUCCESS! Created CleanNoLogoLogin.exe!
    echo This is the clean version without logo!
    echo.
    echo File size:
    dir CleanNoLogoLogin.exe
    echo.
    echo Running the clean login system without logo...
    CleanNoLogoLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
