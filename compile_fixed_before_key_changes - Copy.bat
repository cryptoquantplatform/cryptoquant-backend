@echo off
echo ========================================
echo    COMPILING FIXED BEFORE KEY CHANGES
echo ========================================
echo.
echo Fixed variable redefinition - compiling again...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling fixed version before key changes...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:FixedBeforeKeyChangesLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist FixedBeforeKeyChangesLogin.exe (
    echo SUCCESS! Created FixedBeforeKeyChangesLogin.exe!
    echo This is the fixed version before key changes!
    echo.
    echo File size:
    dir FixedBeforeKeyChangesLogin.exe
    echo.
    echo Running the fixed before key changes login system...
    FixedBeforeKeyChangesLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
