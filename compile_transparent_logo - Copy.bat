@echo off
echo ========================================
echo    COMPILING WITH TRANSPARENT LOGO
echo ========================================
echo.
echo Adding transparent logo to top-left corner...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling with transparent logo...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:TransparentLogoLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist TransparentLogoLogin.exe (
    echo SUCCESS! Created TransparentLogoLogin.exe!
    echo This has a transparent logo in the top-left!
    echo.
    echo File size:
    dir TransparentLogoLogin.exe
    echo.
    echo Running the transparent logo login system...
    TransparentLogoLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
