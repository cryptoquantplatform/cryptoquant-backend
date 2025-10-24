@echo off
echo ========================================
echo    COMPILING CORRECT TRANSPARENT DESIGN
echo ========================================
echo.
echo Actually making input field and button transparent...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling correct transparent design...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:CorrectTransparentDesignLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist CorrectTransparentDesignLogin.exe (
    echo SUCCESS! Created CorrectTransparentDesignLogin.exe!
    echo This has correct transparent input field and button!
    echo.
    echo File size:
    dir CorrectTransparentDesignLogin.exe
    echo.
    echo Running the correct transparent design login system...
    CorrectTransparentDesignLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
