@echo off
echo ========================================
echo    COMPILING HIGH-QUALITY SINGLE TEXT
echo ========================================
echo.
echo Creating single high-quality text with proper glow...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling high-quality single text with glow...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:HighQualitySingleTextLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist HighQualitySingleTextLogin.exe (
    echo SUCCESS! Created HighQualitySingleTextLogin.exe!
    echo This has a single high-quality text with proper glow!
    echo.
    echo File size:
    dir HighQualitySingleTextLogin.exe
    echo.
    echo Running the high-quality single text login system...
    HighQualitySingleTextLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
