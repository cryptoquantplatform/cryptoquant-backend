@echo off
echo ========================================
echo    COMPILING BEFORE KEY CHANGES
echo ========================================
echo.
echo Back to the version BEFORE I changed the key insertion...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling version before key changes...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:BeforeKeyChangesLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist BeforeKeyChangesLogin.exe (
    echo SUCCESS! Created BeforeKeyChangesLogin.exe!
    echo This is the version before key changes!
    echo.
    echo File size:
    dir BeforeKeyChangesLogin.exe
    echo.
    echo Running the before key changes login system...
    BeforeKeyChangesLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
