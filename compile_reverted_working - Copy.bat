@echo off
echo ========================================
echo    COMPILING REVERTED WORKING VERSION
echo ========================================
echo.
echo Reverting to the working version...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling reverted working version...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:RevertedWorkingLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist RevertedWorkingLogin.exe (
    echo SUCCESS! Created RevertedWorkingLogin.exe!
    echo This is the reverted working version!
    echo.
    echo File size:
    dir RevertedWorkingLogin.exe
    echo.
    echo Running the reverted working login system...
    RevertedWorkingLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
