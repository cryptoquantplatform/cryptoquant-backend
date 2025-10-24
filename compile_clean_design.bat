@echo off
echo ========================================
echo    COMPILING CLEAN DESIGN
echo ========================================
echo.
echo Clean input field and button design like reference...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling clean design with rounded elements...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:CleanDesignLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist CleanDesignLogin.exe (
    echo SUCCESS! Created CleanDesignLogin.exe!
    echo This has clean design with rounded elements!
    echo.
    echo File size:
    dir CleanDesignLogin.exe
    echo.
    echo Running the clean design login system...
    CleanDesignLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
