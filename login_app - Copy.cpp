// Login System - ImGui DirectX11 Implementation
// Based on the original ImGui example, customized for the login interface

#include "imgui.h"
#include "imgui_impl_win32.h"
#include "imgui_impl_dx11.h"
#include <d3d11.h>
#include <tchar.h>
#include <string>
#include <iostream>
#include <windows.h>
#include <wininet.h>
#include <winhttp.h>
#pragma comment(lib, "wininet.lib")
#pragma comment(lib, "winhttp.lib")

// Data
static ID3D11Device*            g_pd3dDevice = nullptr;
static ID3D11DeviceContext*     g_pd3dDeviceContext = nullptr;
static IDXGISwapChain*          g_pSwapChain = nullptr;
static bool                     g_SwapChainOccluded = false;
static UINT                     g_ResizeWidth = 0, g_ResizeHeight = 0;
static ID3D11RenderTargetView*  g_mainRenderTargetView = nullptr;

// Login app state
static char key_input[256] = "";
static bool show_login_window = true;

// KeyAuth integration
class KeyAuth {
private:
    std::string name;
    std::string ownerid;
    std::string secret;
    std::string version;
    std::string url;

public:
    KeyAuth(std::string name, std::string ownerid, std::string secret, std::string version, std::string url) {
        this->name = name;
        this->ownerid = ownerid;
        this->secret = secret;
        this->version = version;
        this->url = url;
    }

    std::string license(std::string key) {
        // Real KeyAuth API implementation
        
        // Step 1: Make HTTP request to KeyAuth API
        std::string url = this->url + "license";
        
        // Step 2: Prepare POST data
        std::string postData = "key=" + key + 
                              "&ownerid=" + this->ownerid + 
                              "&secret=" + this->secret + 
                              "&name=" + this->name + 
                              "&version=" + this->version;
        
        // Step 3: Make HTTP request
        std::string response = makeHttpRequest(url, postData);
        
        // Step 4: Parse JSON response
        if (response.find("error") != std::string::npos) {
            return "network_error";
        }
        
        // Simple JSON parsing for KeyAuth response
        if (response.find("\"success\":true") != std::string::npos) {
            return "success";
        }
        else if (response.find("expired") != std::string::npos) {
            return "expired";
        }
        else if (response.find("banned") != std::string::npos) {
            return "banned";
        }
        else if (response.find("invalid") != std::string::npos) {
            return "invalid";
        }
        else {
            return "invalid";
        }
    }
    
private:
    std::string makeHttpRequest(std::string url, std::string postData) {
        // Real HTTP request implementation using WinHTTP
        HINTERNET hSession = NULL;
        HINTERNET hConnect = NULL;
        HINTERNET hRequest = NULL;
        std::string response = "";
        
        try {
            // Initialize WinHTTP
            hSession = WinHttpOpen(L"KeyAuth Client/1.0", 
                                  WINHTTP_ACCESS_TYPE_DEFAULT_PROXY,
                                  WINHTTP_NO_PROXY_NAME, 
                                  WINHTTP_NO_PROXY_BYPASS, 0);
            
            if (!hSession) {
                return "error: WinHttpOpen failed";
            }
            
            // Parse URL
            URL_COMPONENTS urlComp;
            ZeroMemory(&urlComp, sizeof(urlComp));
            urlComp.dwStructSize = sizeof(urlComp);
            urlComp.dwSchemeLength = -1;
            urlComp.dwHostNameLength = -1;
            urlComp.dwUrlPathLength = -1;
            urlComp.dwExtraInfoLength = -1;
            
            std::wstring wurl(url.begin(), url.end());
            if (!WinHttpCrackUrl(wurl.c_str(), 0, 0, &urlComp)) {
                return "error: URL parsing failed";
            }
            
            // Connect to server
            std::wstring host(urlComp.lpszHostName, urlComp.dwHostNameLength);
            hConnect = WinHttpConnect(hSession, host.c_str(), 
                                   urlComp.nPort, 0);
            
            if (!hConnect) {
                return "error: WinHttpConnect failed";
            }
            
            // Create request
            std::wstring path(urlComp.lpszUrlPath, urlComp.dwUrlPathLength);
            hRequest = WinHttpOpenRequest(hConnect, L"POST", path.c_str(),
                                        NULL, WINHTTP_NO_REFERER,
                                        WINHTTP_DEFAULT_ACCEPT_TYPES,
                                        WINHTTP_FLAG_SECURE);
            
            if (!hRequest) {
                return "error: WinHttpOpenRequest failed";
            }
            
            // Set headers
            std::string contentType = "application/x-www-form-urlencoded";
            std::wstring wContentType(contentType.begin(), contentType.end());
            WinHttpAddRequestHeaders(hRequest, L"Content-Type: application/x-www-form-urlencoded", -1, WINHTTP_ADDREQ_FLAG_ADD);
            
            // Send request
            std::wstring wPostData(postData.begin(), postData.end());
            if (!WinHttpSendRequest(hRequest, WINHTTP_NO_ADDITIONAL_HEADERS, 0,
                                  (LPVOID)wPostData.c_str(), wPostData.length(),
                                  wPostData.length(), 0)) {
                return "error: WinHttpSendRequest failed";
            }
            
            // Receive response
            if (!WinHttpReceiveResponse(hRequest, NULL)) {
                return "error: WinHttpReceiveResponse failed";
            }
            
            // Read response data
            DWORD dwSize = 0;
            DWORD dwDownloaded = 0;
            do {
                dwSize = 0;
                if (!WinHttpQueryDataAvailable(hRequest, &dwSize)) {
                    break;
                }
                
                if (dwSize == 0) break;
                
                char* pszOutBuffer = new char[dwSize + 1];
                if (pszOutBuffer != NULL) {
                    ZeroMemory(pszOutBuffer, dwSize + 1);
                    if (WinHttpReadData(hRequest, (LPVOID)pszOutBuffer, dwSize, &dwDownloaded)) {
                        response += std::string(pszOutBuffer);
                    }
                    delete[] pszOutBuffer;
                }
            } while (dwSize > 0);
            
        } catch (...) {
            response = "error: Exception occurred";
        }
        
        // Cleanup
        if (hRequest) WinHttpCloseHandle(hRequest);
        if (hConnect) WinHttpCloseHandle(hConnect);
        if (hSession) WinHttpCloseHandle(hSession);
        
        return response;
    }
};

// Initialize KeyAuth with your actual credentials
KeyAuth keyAuth("23746192374452's Application", "zabhxFbSIx", "8b90ae1f653c1c8b1a05b8d5342c0d77b5f5470dbd828db21a40debe569acc32", "1.0", "https://keyauth.com/api/1.0/");
static bool is_dragging = false;
static ImVec2 drag_offset;

// Forward declarations of helper functions
bool CreateDeviceD3D(HWND hWnd);
void CleanupDeviceD3D();
void CreateRenderTarget();
void CleanupRenderTarget();
LRESULT WINAPI WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam);

// Custom ImGui styling to match the login interface
void SetupCustomStyle()
{
    ImGuiStyle& style = ImGui::GetStyle();
    
    // Dark theme with blue accents matching the image
    style.Colors[ImGuiCol_WindowBg] = ImVec4(0.05f, 0.05f, 0.05f, 0.95f);
    style.Colors[ImGuiCol_ChildBg] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_PopupBg] = ImVec4(0.05f, 0.05f, 0.05f, 0.95f);
    style.Colors[ImGuiCol_Border] = ImVec4(0.0f, 0.7f, 1.0f, 0.8f);
    style.Colors[ImGuiCol_BorderShadow] = ImVec4(0.0f, 0.0f, 0.0f, 0.0f);
    style.Colors[ImGuiCol_FrameBg] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_FrameBgHovered] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_FrameBgActive] = ImVec4(0.18f, 0.18f, 0.18f, 1.0f);
    style.Colors[ImGuiCol_TitleBg] = ImVec4(0.05f, 0.05f, 0.05f, 1.0f);
    style.Colors[ImGuiCol_TitleBgActive] = ImVec4(0.0f, 0.3f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_TitleBgCollapsed] = ImVec4(0.05f, 0.05f, 0.05f, 1.0f);
    style.Colors[ImGuiCol_MenuBarBg] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarBg] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrab] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrabHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_ScrollbarGrabActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_CheckMark] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_SliderGrab] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_SliderGrabActive] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_Button] = ImVec4(0.0f, 0.4f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_ButtonHovered] = ImVec4(0.0f, 0.5f, 0.9f, 1.0f);
    style.Colors[ImGuiCol_ButtonActive] = ImVec4(0.0f, 0.3f, 0.7f, 1.0f);
    style.Colors[ImGuiCol_Header] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_HeaderHovered] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_HeaderActive] = ImVec4(0.18f, 0.18f, 0.18f, 1.0f);
    style.Colors[ImGuiCol_Separator] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_SeparatorHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_SeparatorActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_ResizeGrip] = ImVec4(0.3f, 0.3f, 0.3f, 1.0f);
    style.Colors[ImGuiCol_ResizeGripHovered] = ImVec4(0.4f, 0.4f, 0.4f, 1.0f);
    style.Colors[ImGuiCol_ResizeGripActive] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_Tab] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_TabHovered] = ImVec4(0.15f, 0.15f, 0.15f, 1.0f);
    style.Colors[ImGuiCol_TabActive] = ImVec4(0.0f, 0.4f, 0.8f, 1.0f);
    style.Colors[ImGuiCol_TabUnfocused] = ImVec4(0.08f, 0.08f, 0.08f, 1.0f);
    style.Colors[ImGuiCol_TabUnfocusedActive] = ImVec4(0.12f, 0.12f, 0.12f, 1.0f);
    style.Colors[ImGuiCol_PlotLines] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotLinesHovered] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotHistogram] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_PlotHistogramHovered] = ImVec4(0.0f, 0.6f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_Text] = ImVec4(0.95f, 0.95f, 0.95f, 1.0f);
    style.Colors[ImGuiCol_TextDisabled] = ImVec4(0.5f, 0.5f, 0.5f, 1.0f);
    style.Colors[ImGuiCol_TextSelectedBg] = ImVec4(0.0f, 0.4f, 0.8f, 0.3f);
    style.Colors[ImGuiCol_DragDropTarget] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavHighlight] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavWindowingHighlight] = ImVec4(0.0f, 0.5f, 1.0f, 1.0f);
    style.Colors[ImGuiCol_NavWindowingDimBg] = ImVec4(0.0f, 0.0f, 0.0f, 0.5f);
    style.Colors[ImGuiCol_ModalWindowDimBg] = ImVec4(0.0f, 0.0f, 0.0f, 0.5f);
    
    // Curved rounded corners like in the image
    style.WindowRounding = 20.0f;
    style.ChildRounding = 20.0f;
    style.FrameRounding = 15.0f;
    style.PopupRounding = 20.0f;
    style.ScrollbarRounding = 15.0f;
    style.GrabRounding = 15.0f;
    style.TabRounding = 15.0f;
    
    // Professional spacing
    style.WindowPadding = ImVec2(0, 0);
    style.FramePadding = ImVec2(12, 8);
    style.ItemSpacing = ImVec2(12, 8);
    style.ItemInnerSpacing = ImVec2(8, 6);
    style.IndentSpacing = 20.0f;
    style.ScrollbarSize = 16.0f;
    style.GrabMinSize = 12.0f;
    
    // Window styling with thicker blue borders
    style.WindowBorderSize = 3.0f;
    style.ChildBorderSize = 3.0f;
    style.PopupBorderSize = 3.0f;
    style.FrameBorderSize = 2.0f;
    style.TabBorderSize = 2.0f;
}

// Main code
int main(int, char**)
{
    // Make process DPI aware and obtain main monitor scale
    ImGui_ImplWin32_EnableDpiAwareness();
    float main_scale = ImGui_ImplWin32_GetDpiScaleForMonitor(::MonitorFromPoint(POINT{ 0, 0 }, MONITOR_DEFAULTTOPRIMARY));

    // Create application window with transparency and rounded corners
    WNDCLASSEXW wc = { sizeof(wc), CS_CLASSDC, WndProc, 0L, 0L, GetModuleHandle(nullptr), nullptr, nullptr, nullptr, nullptr, L"Login System", nullptr };
    ::RegisterClassExW(&wc);
    HWND hwnd = ::CreateWindowW(wc.lpszClassName, L"Authentication", WS_POPUP, 100, 100, 800, 600, nullptr, nullptr, wc.hInstance, nullptr);
    
    // Set window to be layered for transparency and rounded corners
    SetWindowLong(hwnd, GWL_EXSTYLE, GetWindowLong(hwnd, GWL_EXSTYLE) | WS_EX_LAYERED | WS_EX_TOPMOST);
    SetLayeredWindowAttributes(hwnd, 0, 150, LWA_ALPHA); // 150/255 = ~59% opacity - much more transparent
    
    // Remove maximize button and add rounded corners
    LONG windowStyle = GetWindowLong(hwnd, GWL_STYLE);
    windowStyle &= ~WS_MAXIMIZEBOX; // Remove maximize button
    windowStyle &= ~WS_THICKFRAME;  // Remove thick frame for rounded corners
    SetWindowLong(hwnd, GWL_STYLE, windowStyle);
    
    // Create rounded window region
    HRGN hRgn = CreateRoundRectRgn(0, 0, 800, 600, 30, 30);
    SetWindowRgn(hwnd, hRgn, TRUE);

    // Initialize Direct3D
    if (!CreateDeviceD3D(hwnd))
    {
        CleanupDeviceD3D();
        ::UnregisterClassW(wc.lpszClassName, wc.hInstance);
        return 1;
    }

    // Show the window
    ::ShowWindow(hwnd, SW_SHOWDEFAULT);
    ::UpdateWindow(hwnd);

    // Setup Dear ImGui context
    IMGUI_CHECKVERSION();
    ImGui::CreateContext();
    ImGuiIO& io = ImGui::GetIO(); (void)io;
    io.ConfigFlags |= ImGuiConfigFlags_NavEnableKeyboard;

    // Setup Dear ImGui style
    ImGui::StyleColorsDark();
    SetupCustomStyle();

    // Setup scaling
    ImGuiStyle& style = ImGui::GetStyle();
    style.ScaleAllSizes(main_scale);
    style.FontScaleDpi = main_scale;

    // Setup Platform/Renderer backends
    ImGui_ImplWin32_Init(hwnd);
    ImGui_ImplDX11_Init(g_pd3dDevice, g_pd3dDeviceContext);

    // Our state
    ImVec4 clear_color = ImVec4(0.05f, 0.05f, 0.05f, 0.3f); // Much more transparent

    // Main loop
    bool done = false;
    while (!done)
    {
        // Poll and handle messages
        MSG msg;
        while (::PeekMessage(&msg, nullptr, 0U, 0U, PM_REMOVE))
        {
            ::TranslateMessage(&msg);
            ::DispatchMessage(&msg);
            if (msg.message == WM_QUIT)
                done = true;
        }
        if (done)
            break;

        // Handle window being minimized or screen locked
        if (g_SwapChainOccluded && g_pSwapChain->Present(0, DXGI_PRESENT_TEST) == DXGI_STATUS_OCCLUDED)
        {
            ::Sleep(10);
            continue;
        }
        g_SwapChainOccluded = false;

        // Handle window resize
        if (g_ResizeWidth != 0 && g_ResizeHeight != 0)
        {
            CleanupRenderTarget();
            g_pSwapChain->ResizeBuffers(0, g_ResizeWidth, g_ResizeHeight, DXGI_FORMAT_UNKNOWN, 0);
            g_ResizeWidth = g_ResizeHeight = 0;
            CreateRenderTarget();
        }

        // Start the Dear ImGui frame
        ImGui_ImplDX11_NewFrame();
        ImGui_ImplWin32_NewFrame();
        ImGui::NewFrame();

        // Create the login interface
        {
            // Set window to fill the entire screen
            ImGui::SetNextWindowPos(ImVec2(0, 0));
            ImGui::SetNextWindowSize(ImVec2(800, 600));
            ImGui::SetNextWindowBgAlpha(0.4f); // Much more transparent

            ImGui::Begin("Authentication", &show_login_window, 
                ImGuiWindowFlags_NoTitleBar | ImGuiWindowFlags_NoResize | 
                ImGuiWindowFlags_NoScrollbar | ImGuiWindowFlags_NoCollapse);

            // No window controls - clean top
            
            // No ImGui dragging - only desktop window movement

            // Main content area - full width, starting from top
            ImGui::BeginChild("MainContent", ImVec2(800, 600), true);
            
            // Title - perfectly centered with exact colors from reference
            ImGui::SetCursorPos(ImVec2(0, 50)); // Start from left edge for proper centering
            
            // Create a larger, high-quality font
            ImFont* largeFont = ImGui::GetIO().Fonts->AddFontFromFileTTF("C:/Windows/Fonts/arial.ttf", 64.0f);
            if (largeFont) {
                ImGui::PushFont(largeFont);
            }
            
            // Create beautiful glow effect using ImGui's drawing
            ImDrawList* drawList = ImGui::GetWindowDrawList();
            ImVec2 textPos = ImGui::GetCursorScreenPos();
            
            // Calculate perfect center
            const char* text = "LOGIN";
            ImVec2 textSize = ImGui::CalcTextSize(text);
            textPos.x = textPos.x + (ImGui::GetWindowWidth() - textSize.x) * 0.5f;
            textPos.y = textPos.y + 20;
            
            // Create subtle white glow effect
            for (int i = 4; i >= 1; i--) {
                float alpha = 0.05f + (0.15f * (4 - i) / 4.0f);
                ImU32 glowColor = IM_COL32(255, 255, 255, (int)(alpha * 255));
                
                // Draw subtle white glow in all directions
                for (int x = -i; x <= i; x++) {
                    for (int y = -i; y <= i; y++) {
                        if (x*x + y*y <= i*i) {
                            drawList->AddText(ImVec2(textPos.x + x, textPos.y + y), glowColor, text);
                        }
                    }
                }
            }
            
            // Moderate bright white text
            ImU32 textColor = IM_COL32(255, 255, 255, 255);
            // Draw white text once for normal strength
            drawList->AddText(textPos, textColor, text);
            
            // Move cursor past the text
            ImGui::SetCursorPos(ImVec2(ImGui::GetCursorPos().x, ImGui::GetCursorPos().y + 100));
            
            if (largeFont) {
                ImGui::PopFont();
            }

            // Key input field - clean design like reference
            float input_width = 320.0f;
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - input_width) * 0.5f, 250));
            
            // Key input field - simplified and working
            ImGui::Spacing();
            ImGui::Spacing();
            ImGui::Text("Key:");
            ImGui::SameLine();
            ImGui::SetNextItemWidth(200);
            ImGui::InputText("##key", key_input, sizeof(key_input));

            // Authenticate button - simplified
            ImGui::Spacing();
            if (ImGui::Button("Authenticate", ImVec2(120, 30)))
            {
                // Handle KeyAuth authentication
                if (strlen(key_input) > 0)
                {
                    // KeyAuth integration
                    std::string key = std::string(key_input);
                    std::string result = keyAuth.license(key);
                    
                if (result == "success")
                {
                    MessageBoxA(hwnd, "Authentication successful! Welcome to the application.", "KeyAuth Success", MB_OK | MB_ICONINFORMATION);
                    // Here you would typically start the main application
                    // For demo purposes, you can close the login window
                    show_login_window = false;
                }
                else if (result == "expired")
                {
                    MessageBoxA(hwnd, "Key has expired. Please contact support.", "KeyAuth Error", MB_OK | MB_ICONERROR);
                }
                else if (result == "banned")
                {
                    MessageBoxA(hwnd, "Key has been banned. Access denied.", "KeyAuth Error", MB_OK | MB_ICONERROR);
                }
                else if (result == "network_error")
                {
                    MessageBoxA(hwnd, "Network error. Please check your internet connection and try again.", "KeyAuth Error", MB_OK | MB_ICONERROR);
                }
                else if (result == "invalid")
                {
                    MessageBoxA(hwnd, "Invalid key. Please check your key and try again.", "KeyAuth Error", MB_OK | MB_ICONERROR);
                }
                }
                else
                {
                    MessageBoxA(hwnd, "Please enter a key", "KeyAuth Error", MB_OK | MB_ICONWARNING);
                }
            }

            // Footer - perfectly centered with glowing effect
            float footer_width = ImGui::CalcTextSize("Copyright 2021-2025 | sync.top").x;
            
            // Glowing footer text effect
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.0f, 0.0f, 0.0f, 0.5f)); // Dark shadow
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - footer_width) * 0.5f + 1, 551));
            ImGui::Text("Copyright 2021-2025 | sync.top");
            ImGui::PopStyleColor();
            
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.0f, 0.0f, 0.0f, 0.5f)); // Dark shadow
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - footer_width) * 0.5f - 1, 549));
            ImGui::Text("Copyright 2021-2025 | sync.top");
            ImGui::PopStyleColor();
            
            // Main glowing footer text
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.7f, 0.7f, 0.7f, 1.0f)); // Light gray
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - footer_width) * 0.5f, 550));
            ImGui::Text("Copyright 2021-2025 | sync.top");
            ImGui::PopStyleColor();
            
            // Outer glow
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.5f, 0.5f, 0.8f, 0.4f)); // Light blue glow
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - footer_width) * 0.5f + 2, 552));
            ImGui::Text("Copyright 2021-2025 | sync.top");
            ImGui::PopStyleColor();
            
            ImGui::PushStyleColor(ImGuiCol_Text, ImVec4(0.5f, 0.5f, 0.8f, 0.4f)); // Light blue glow
            ImGui::SetCursorPos(ImVec2((ImGui::GetWindowWidth() - footer_width) * 0.5f - 2, 548));
            ImGui::Text("Copyright 2021-2025 | sync.top");
            ImGui::PopStyleColor();

            ImGui::EndChild();

            ImGui::End();
        }

        // Rendering
        ImGui::Render();
        const float clear_color_with_alpha[4] = { clear_color.x * clear_color.w, clear_color.y * clear_color.w, clear_color.z * clear_color.w, clear_color.w };
        g_pd3dDeviceContext->OMSetRenderTargets(1, &g_mainRenderTargetView, nullptr);
        g_pd3dDeviceContext->ClearRenderTargetView(g_mainRenderTargetView, clear_color_with_alpha);
        ImGui_ImplDX11_RenderDrawData(ImGui::GetDrawData());

        // Present
        HRESULT hr = g_pSwapChain->Present(1, 0);
        g_SwapChainOccluded = (hr == DXGI_STATUS_OCCLUDED);
    }

    // Cleanup
    ImGui_ImplDX11_Shutdown();
    ImGui_ImplWin32_Shutdown();
    ImGui::DestroyContext();

    CleanupDeviceD3D();
    ::DestroyWindow(hwnd);
    ::UnregisterClassW(wc.lpszClassName, wc.hInstance);

    return 0;
}

// Helper functions (same as original example)
bool CreateDeviceD3D(HWND hWnd)
{
    DXGI_SWAP_CHAIN_DESC sd;
    ZeroMemory(&sd, sizeof(sd));
    sd.BufferCount = 2;
    sd.BufferDesc.Width = 0;
    sd.BufferDesc.Height = 0;
    sd.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
    sd.BufferDesc.RefreshRate.Numerator = 60;
    sd.BufferDesc.RefreshRate.Denominator = 1;
    sd.Flags = DXGI_SWAP_CHAIN_FLAG_ALLOW_MODE_SWITCH;
    sd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
    sd.OutputWindow = hWnd;
    sd.SampleDesc.Count = 1;
    sd.SampleDesc.Quality = 0;
    sd.Windowed = TRUE;
    sd.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

    UINT createDeviceFlags = 0;
    D3D_FEATURE_LEVEL featureLevel;
    const D3D_FEATURE_LEVEL featureLevelArray[2] = { D3D_FEATURE_LEVEL_11_0, D3D_FEATURE_LEVEL_10_0, };
    HRESULT res = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_HARDWARE, nullptr, createDeviceFlags, featureLevelArray, 2, D3D11_SDK_VERSION, &sd, &g_pSwapChain, &g_pd3dDevice, &featureLevel, &g_pd3dDeviceContext);
    if (res == DXGI_ERROR_UNSUPPORTED)
        res = D3D11CreateDeviceAndSwapChain(nullptr, D3D_DRIVER_TYPE_WARP, nullptr, createDeviceFlags, featureLevelArray, 2, D3D11_SDK_VERSION, &sd, &g_pSwapChain, &g_pd3dDevice, &featureLevel, &g_pd3dDeviceContext);
    if (res != S_OK)
        return false;

    CreateRenderTarget();
    return true;
}

void CleanupDeviceD3D()
{
    CleanupRenderTarget();
    if (g_pSwapChain) { g_pSwapChain->Release(); g_pSwapChain = nullptr; }
    if (g_pd3dDeviceContext) { g_pd3dDeviceContext->Release(); g_pd3dDeviceContext = nullptr; }
    if (g_pd3dDevice) { g_pd3dDevice->Release(); g_pd3dDevice = nullptr; }
}

void CreateRenderTarget()
{
    ID3D11Texture2D* pBackBuffer;
    g_pSwapChain->GetBuffer(0, IID_PPV_ARGS(&pBackBuffer));
    g_pd3dDevice->CreateRenderTargetView(pBackBuffer, nullptr, &g_mainRenderTargetView);
    pBackBuffer->Release();
}

void CleanupRenderTarget()
{
    if (g_mainRenderTargetView) { g_mainRenderTargetView->Release(); g_mainRenderTargetView = nullptr; }
}

extern IMGUI_IMPL_API LRESULT ImGui_ImplWin32_WndProcHandler(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam);

LRESULT WINAPI WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    if (ImGui_ImplWin32_WndProcHandler(hWnd, msg, wParam, lParam))
        return true;

    switch (msg)
    {
    case WM_LBUTTONDOWN:
        // Start dragging the window
        ReleaseCapture();
        SendMessage(hWnd, WM_NCLBUTTONDOWN, HTCAPTION, 0);
        return 0;
    case WM_SIZE:
        if (wParam == SIZE_MINIMIZED)
            return 0;
        g_ResizeWidth = (UINT)LOWORD(lParam);
        g_ResizeHeight = (UINT)HIWORD(lParam);
        return 0;
    case WM_SYSCOMMAND:
        if ((wParam & 0xfff0) == SC_KEYMENU)
            return 0;
        break;
    case WM_DESTROY:
        ::PostQuitMessage(0);
        return 0;
    }
    return ::DefWindowProcW(hWnd, msg, wParam, lParam);
}
