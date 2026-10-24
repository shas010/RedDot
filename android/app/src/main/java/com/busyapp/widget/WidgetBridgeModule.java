package com.busyapp.widget;

import android.content.Context;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class WidgetBridgeModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public WidgetBridgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "WidgetBridge";
    }

    @ReactMethod
    public void syncWidget(boolean isBusy, String emoji, String message) {
        Context context = reactContext.getApplicationContext();
        BusyWidgetProvider.syncWidgetState(context, isBusy, emoji, message);
    }
}
