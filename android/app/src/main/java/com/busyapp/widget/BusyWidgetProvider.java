package com.busyapp.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.widget.RemoteViews;

import com.busyapp.R;

public class BusyWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_TOGGLE_BUSY = "com.busyapp.ACTION_TOGGLE_BUSY";
    private static final String PREFS_NAME = "com.busyapp.widget.prefs";
    private static final String KEY_IS_BUSY = "is_busy";
    private static final String KEY_EMOJI = "status_emoji";
    private static final String KEY_MESSAGE = "status_message";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean isBusy = prefs.getBoolean(KEY_IS_BUSY, false);
        String emoji = prefs.getString(KEY_EMOJI, isBusy ? "🔴" : "✅");
        String message = prefs.getString(KEY_MESSAGE, isBusy ? "Busy" : "Available");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_busy_layout);

        // Update Text
        views.setTextViewText(R.id.widget_status_emoji, emoji);
        views.setTextViewText(R.id.widget_status_text, message);
        views.setTextViewText(R.id.widget_status_badge, isBusy ? "BUSY" : "AVAILABLE");
        views.setTextColor(R.id.widget_status_badge, isBusy ? Color.parseColor("#EF4444") : Color.parseColor("#22C55E"));

        // Setup PendingIntent for one-tap click action
        Intent toggleIntent = new Intent(context, BusyWidgetProvider.class);
        toggleIntent.setAction(ACTION_TOGGLE_BUSY);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_btn_toggle, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        if (ACTION_TOGGLE_BUSY.equals(intent.getAction())) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean currentlyBusy = prefs.getBoolean(KEY_IS_BUSY, false);
            boolean newBusy = !currentlyBusy;

            SharedPreferences.Editor editor = prefs.edit();
            editor.putBoolean(KEY_IS_BUSY, newBusy);
            editor.putString(KEY_EMOJI, newBusy ? "🔴" : "✅");
            editor.putString(KEY_MESSAGE, newBusy ? "Busy" : "Available");
            editor.apply();

            // Notify all widget instances
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisWidget = new ComponentName(context, BusyWidgetProvider.class);
            int[] allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
            onUpdate(context, appWidgetManager, allWidgetIds);

            // Broadcast to React Native if app is in background/foreground
            Intent rnBroadcast = new Intent("com.busyapp.WIDGET_STATUS_CHANGED");
            rnBroadcast.putExtra("isBusy", newBusy);
            rnBroadcast.putExtra("emoji", newBusy ? "🔴" : "✅");
            rnBroadcast.putExtra("message", newBusy ? "Busy" : "Available");
            context.sendBroadcast(rnBroadcast);
        }
    }

    public static void syncWidgetState(Context context, boolean isBusy, String emoji, String message) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean(KEY_IS_BUSY, isBusy);
        editor.putString(KEY_EMOJI, emoji);
        editor.putString(KEY_MESSAGE, message);
        editor.apply();

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, BusyWidgetProvider.class);
        int[] allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        for (int id : allWidgetIds) {
            updateAppWidget(context, appWidgetManager, id);
        }
    }
}
