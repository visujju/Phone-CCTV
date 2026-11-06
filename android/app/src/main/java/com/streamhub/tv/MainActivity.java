package com.streamhub.tv;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

public final class MainActivity extends Activity {
    private static final String HOME_URL = "file:///android_asset/streamhub/viewer.html";
    private final Handler handler = new Handler(Looper.getMainLooper());
    private WebView webView;
    private LinearLayout toolbar;
    private TextView siteTitle;
    private TextView siteUrl;
    private ProgressBar progress;
    private boolean browsingSite;
    private String currentUrl = "";
    private String currentAccent = "#ffb060";
    private final Runnable hideToolbar = () -> {
        if (toolbar != null && browsingSite) {
            toolbar.animate().alpha(0f).setDuration(220).withEndAction(() -> {
                if (toolbar != null && browsingSite) toolbar.setVisibility(View.GONE);
            }).start();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(8, 8, 13));
        webView = new WebView(this);
        webView.setFocusable(true);
        webView.setFocusableInTouchMode(true);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setBackgroundColor(Color.rgb(8, 8, 13));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setWebViewClient(new StreamHubWebViewClient());
        webView.setWebChromeClient(new StreamHubChromeClient());

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setLoadsImagesAutomatically(true);
        settings.setOffscreenPreRaster(true);
        settings.setUserAgentString(settings.getUserAgentString() + " StreamHubTV/1.0");
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        webView.addJavascriptInterface(new StreamHubBridge(), "StreamHubAndroid");
        webView.setOnTouchListener((view, event) -> {
            if (browsingSite) revealToolbar();
            return false;
        });
        webView.setOnKeyListener((view, keyCode, event) -> {
            if (event.getAction() != KeyEvent.ACTION_DOWN) return false;
            if (!browsingSite) return dispatchLauncherKey(keyCode);
            if (isDpadKey(keyCode)) revealToolbar();
            return false;
        });

        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        createToolbar(root);
        createProgress(root);
        setContentView(root);
        webView.loadUrl(HOME_URL);
        hideSystemUi();
    }

    private void createToolbar(FrameLayout root) {
        toolbar = new LinearLayout(this);
        toolbar.setOrientation(LinearLayout.HORIZONTAL);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        toolbar.setPadding(dp(15), dp(5), dp(15), dp(5));
        GradientDrawable surface = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xF01B1A22, 0xE30B0B10});
        surface.setCornerRadius(dp(0));
        toolbar.setBackground(surface);
        toolbar.setElevation(dp(8));
        toolbar.setAlpha(0f);
        toolbar.setVisibility(View.GONE);

        TextView back = toolbarButton("‹", 29);
        back.setContentDescription("Back to StreamHub");
        back.setOnClickListener(v -> goBack());
        toolbar.addView(back, new LinearLayout.LayoutParams(dp(48), dp(44)));

        LinearLayout titleBlock = new LinearLayout(this);
        titleBlock.setOrientation(LinearLayout.VERTICAL);
        titleBlock.setGravity(Gravity.CENTER_VERTICAL);
        siteTitle = new TextView(this);
        siteTitle.setText("StreamHub");
        siteTitle.setTextColor(Color.WHITE);
        siteTitle.setTextSize(14);
        siteTitle.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        siteUrl = new TextView(this);
        siteUrl.setTextColor(0xFFAAA9B5);
        siteUrl.setTextSize(10);
        siteUrl.setSingleLine(true);
        siteUrl.setEllipsize(android.text.TextUtils.TruncateAt.END);
        titleBlock.addView(siteTitle);
        titleBlock.addView(siteUrl);
        toolbar.addView(titleBlock, new LinearLayout.LayoutParams(0, -1, 1f));

        TextView reload = toolbarButton("↻", 21);
        reload.setContentDescription("Reload page");
        reload.setOnClickListener(v -> {
            if (webView != null) webView.reload();
            revealToolbar();
        });
        toolbar.addView(reload, new LinearLayout.LayoutParams(dp(48), dp(44)));

        TextView open = toolbarButton("↗", 18);
        open.setContentDescription("Open in browser");
        open.setOnClickListener(v -> openExternal(currentUrl));
        toolbar.addView(open, new LinearLayout.LayoutParams(dp(48), dp(44)));

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(-1, dp(58), Gravity.TOP);
        root.addView(toolbar, params);
    }

    private void createProgress(FrameLayout root) {
        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        int progressColor;
        try { progressColor = Color.parseColor(currentAccent); } catch (IllegalArgumentException error) { progressColor = Color.rgb(255, 176, 96); }
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(progressColor));
        progress.setProgress(0);
        progress.setVisibility(View.GONE);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(-1, dp(3), Gravity.TOP);
        root.addView(progress, params);
    }

    private TextView toolbarButton(String label, int size) {
        TextView button = new TextView(this);
        button.setText(label);
        button.setTextSize(size);
        button.setTextColor(Color.WHITE);
        button.setGravity(Gravity.CENTER);
        button.setFocusable(true);
        button.setBackground(makeFocusableBackground());
        return button;
    }

    private android.graphics.drawable.Drawable makeFocusableBackground() {
        android.graphics.drawable.StateListDrawable states = new android.graphics.drawable.StateListDrawable();
        GradientDrawable focused = new GradientDrawable();
        focused.setColor(0x553D2B1E);
        focused.setCornerRadius(dp(13));
        focused.setStroke(dp(2), Color.rgb(255, 176, 96));
        GradientDrawable normal = new GradientDrawable();
        normal.setColor(Color.TRANSPARENT);
        normal.setCornerRadius(dp(13));
        states.addState(new int[]{android.R.attr.state_focused}, focused);
        states.addState(new int[]{android.R.attr.state_pressed}, focused);
        states.addState(new int[]{}, normal);
        return states;
    }

    private int dp(float value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void hideSystemUi() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
    }

    private void revealToolbar() {
        if (toolbar == null || !browsingSite) return;
        handler.removeCallbacks(hideToolbar);
        toolbar.setVisibility(View.VISIBLE);
        toolbar.setAlpha(1f);
        handler.postDelayed(hideToolbar, 3800);
    }

    private void openSite(String name, String url, String accent) {
        Uri uri = Uri.parse(url);
        String scheme = uri.getScheme();
        if (!"http".equals(scheme) && !"https".equals(scheme)) return;
        currentUrl = uri.toString();
        currentAccent = accent == null ? "#ffb060" : accent;
        browsingSite = true;
        siteTitle.setText(name == null || name.isEmpty() ? uri.getHost() : name);
        siteUrl.setText(uri.getHost() == null ? currentUrl : uri.getHost());
        toolbar.setBackground(new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xF01B1A22, 0xE30B0B10}));
        revealToolbar();
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(Color.parseColor(currentAccent)));
        progress.setProgress(0);
        progress.setVisibility(View.VISIBLE);
        // Remove the bridge before loading a third-party origin; it is restored on return to home.
        webView.removeJavascriptInterface("StreamHubAndroid");
        webView.loadUrl(currentUrl);
    }

    private void goBack() {
        handler.removeCallbacks(hideToolbar);
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            showHome();
        }
    }

    private void showHome() {
        browsingSite = false;
        currentUrl = "";
        if (toolbar != null) toolbar.setVisibility(View.GONE);
        if (webView != null) {
            webView.addJavascriptInterface(new StreamHubBridge(), "StreamHubAndroid");
            webView.loadUrl(HOME_URL);
        }
    }

    private void openExternal(String value) {
        if (value == null || value.isEmpty()) return;
        try {
            Uri uri = Uri.parse(value);
            if ("https".equals(uri.getScheme()) || "http".equals(uri.getScheme())) {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            }
        } catch (Exception ignored) {
            // Ignore malformed or unsupported external destinations.
        }
    }

    private void handleBack() {
        if (webView == null) {
            finish();
            return;
        }
        if (browsingSite) {
            goBack();
            return;
        }
        webView.evaluateJavascript(
                "(function(){return !!document.querySelector('.viewer.open, .overlay.open')})()",
                value -> {
                    if ("true".equals(value)) {
                        webView.evaluateJavascript(
                                "document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',keyCode:27,which:27,bubbles:true}))",
                                null);
                    } else {
                        finish();
                    }
                });
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            handleBack();
            return true;
        }
        if (!browsingSite && dispatchLauncherKey(keyCode)) return true;
        if (browsingSite && isDpadKey(keyCode)) revealToolbar();
        return super.onKeyDown(keyCode, event);
    }

    private boolean isDpadKey(int keyCode) {
        return keyCode == KeyEvent.KEYCODE_DPAD_UP || keyCode == KeyEvent.KEYCODE_DPAD_DOWN
                || keyCode == KeyEvent.KEYCODE_DPAD_LEFT || keyCode == KeyEvent.KEYCODE_DPAD_RIGHT
                || keyCode == KeyEvent.KEYCODE_DPAD_CENTER || keyCode == KeyEvent.KEYCODE_ENTER
                || keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER;
    }

    private boolean dispatchLauncherKey(int keyCode) {
        if (webView == null) return false;
        String key = null;
        int webCode = keyCode;
        switch (keyCode) {
            case KeyEvent.KEYCODE_DPAD_UP: key = "ArrowUp"; webCode = 19; break;
            case KeyEvent.KEYCODE_DPAD_DOWN: key = "ArrowDown"; webCode = 20; break;
            case KeyEvent.KEYCODE_DPAD_LEFT: key = "ArrowLeft"; webCode = 21; break;
            case KeyEvent.KEYCODE_DPAD_RIGHT: key = "ArrowRight"; webCode = 22; break;
            case KeyEvent.KEYCODE_DPAD_CENTER:
            case KeyEvent.KEYCODE_ENTER:
            case KeyEvent.KEYCODE_NUMPAD_ENTER: key = "Enter"; webCode = 23; break;
            default: break;
        }
        if (key == null) return false;
        webView.evaluateJavascript(
                "document.dispatchEvent(new KeyboardEvent('keydown',{key:'" + key
                        + "',keyCode:" + webCode + ",which:" + webCode + ",bubbles:true,cancelable:true}))",
                null);
        return true;
    }

    @Override
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private final class StreamHubBridge {
        @JavascriptInterface
        public void openSite(String name, String url, String accent) {
            runOnUiThread(() -> MainActivity.this.openSite(name, url, accent));
        }
    }

    private final class StreamHubWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String scheme = uri.getScheme();
            if ("http".equals(scheme) || "https".equals(scheme)) {
                // Keep browsing inside StreamHub; external services no longer get blocked by iframe policies.
                return false;
            }
            if ("file".equals(scheme) || "about".equals(scheme)) return false;
            openExternal(uri.toString());
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            if (url != null && url.startsWith("file:///android_asset/streamhub/")) {
                browsingSite = false;
                if (toolbar != null) toolbar.setVisibility(View.GONE);
                webView.addJavascriptInterface(new StreamHubBridge(), "StreamHubAndroid");
            } else if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                browsingSite = true;
                currentUrl = url;
                if (siteUrl != null) siteUrl.setText(Uri.parse(url).getHost());
                if (siteTitle != null && (siteTitle.getText() == null || siteTitle.getText().length() == 0 || "StreamHub".contentEquals(siteTitle.getText()))) siteTitle.setText(Uri.parse(url).getHost());
                revealToolbar();
            }
        }
    }

    private final class StreamHubChromeClient extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView view, int newProgress) {
            if (progress == null || !browsingSite) return;
            progress.setProgress(newProgress);
            if (newProgress < 100) {
                progress.setVisibility(View.VISIBLE);
            } else {
                handler.postDelayed(() -> progress.setVisibility(View.GONE), 220);
            }
        }

        @Override
        public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, Message resultMsg) {
            WebView popup = new WebView(MainActivity.this);
            popup.getSettings().setJavaScriptEnabled(true);
            popup.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView popupView, WebResourceRequest request) {
                    if (request.isForMainFrame()) {
                        Uri uri = request.getUrl();
                        if ("http".equals(uri.getScheme()) || "https".equals(uri.getScheme())) {
                            runOnUiThread(() -> {
                                currentUrl = uri.toString();
                                browsingSite = true;
                                if (siteTitle != null) siteTitle.setText(uri.getHost());
                                if (siteUrl != null) siteUrl.setText(uri.getHost());
                                revealToolbar();
                                progress.setProgress(0);
                                progress.setVisibility(View.VISIBLE);
                                webView.loadUrl(currentUrl);
                                popupView.destroy();
                            });
                            return true;
                        }
                    }
                    return false;
                }
            });
            WebView.WebViewTransport transport = (WebView.WebViewTransport) resultMsg.obj;
            transport.setWebView(popup);
            resultMsg.sendToTarget();
            return true;
        }
    }
}
