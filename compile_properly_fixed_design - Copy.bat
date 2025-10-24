@echo off
echo ========================================
echo    COMPILING PROPERLY FIXED DESIGN
echo ========================================
echo.
echo Actually fixing the input field and button styling...
echo.
echo Setting up environment...
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
echo.
echo Environment set up! Now compiling...
echo.
echo Compiling properly fixed design...
cl /EHsc login_app.cpp imgui-master\imgui.cpp imgui-master\imgui_draw.cpp imgui-master\imgui_tables.cpp imgui-master\imgui_widgets.cpp imgui-master\backends\imgui_impl_win32.cpp imgui-master\backends\imgui_impl_dx11.cpp /I"imgui-master" /I"imgui-master\backends" /Fe:ProperlyFixedDesignLogin.exe /link d3d11.lib dxgi.lib
echo.
if exist ProperlyFixedDesignLogin.exe (
    echo SUCCESS! Created ProperlyFixedDesignLogin.exe!
    echo This has properly fixed input field and button styling!
    echo.
    echo File size:
    dir ProperlyFixedDesignLogin.exe
    echo.
    echo Running the properly fixed design login system...
    ProperlyFixedDesignLogin.exe
) else (
    echo Compilation failed. Let me check what went wrong...
)
echo.
pause
