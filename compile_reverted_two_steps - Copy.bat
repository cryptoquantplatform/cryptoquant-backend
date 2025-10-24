@echo off
echo ========================================
echo    COMPILING REVERTED TWO STEPS
echo ========================================
echo.
echo Reverted two steps back to working version...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling reverted two steps version...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:RevertedTwoStepsLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist RevertedTwoStepsLogin.exe (
    echo SUCCESS! Created RevertedTwoStepsLogin.exe!
    echo This is the version reverted two steps back!
    echo.
    echo File size:
    dir RevertedTwoStepsLogin.exe
    echo.
    echo Running the reverted two steps login system...
    RevertedTwoStepsLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
