@echo off
echo ========================================
echo    COMPILING ONLY WHITE TEXT
echo ========================================
echo.
echo Only strong white text - no glow at all...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling only white text with no glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:OnlyWhiteTextLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist OnlyWhiteTextLogin.exe (
    echo SUCCESS! Created OnlyWhiteTextLogin.exe!
    echo This has only strong white text with no glow!
    echo.
    echo File size:
    dir OnlyWhiteTextLogin.exe
    echo.
    echo Running the only white text login system...
    OnlyWhiteTextLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
