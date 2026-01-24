// Google Analytics Helper
//
// Provides methods to track events and page views in Google Analytics
// Works with both HTML and WebAssembly (CanvasKit) renderers

import 'dart:js_interop';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode;

/// JS interop for gtag function
@JS('gtag')
external void _gtag(String command, String targetId, [JSObject? params]);

/// Helper class for Google Analytics tracking
class AnalyticsHelper {
  /// Track a custom event
  ///
  /// [category] - Event category (e.g., 'User', 'Button', 'Search')
  /// [action] - Event action (e.g., 'click', 'search_query', 'purchase')
  /// [label] - Optional event label for additional context
  /// [value] - Optional numeric value associated with the event
  static void trackEvent(
    String category,
    String action, {
    String? label,
    int? value,
  }) {
    if (kIsWeb) {
      try {
        final params = <String, dynamic>{
          'event_category': category,
        };

        if (label != null) params['event_label'] = label;
        if (value != null) params['value'] = value;

        _gtag('event', action, params.jsify() as JSObject);
      } catch (e) {
        if (kDebugMode) {
          // ignore: avoid_print
          print('Analytics event tracking error: $e');
        }
      }
    }
  }

  /// Track a page view
  ///
  /// [pageName] - The page path (e.g., '/app/dashboard', '/features')
  static void trackPageView(String pageName) {
    if (kIsWeb) {
      try {
        // Note: Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID
        final params = <String, dynamic>{
          'page_path': pageName,
        };
        _gtag('config', 'G-XXXXXXXXXX', params.jsify() as JSObject);
      } catch (e) {
        if (kDebugMode) {
          // ignore: avoid_print
          print('Analytics page view tracking error: $e');
        }
      }
    }
  }
  
  /// Track a search query
  /// 
  /// [searchTerm] - The search term entered by the user
  static void trackSearch(String searchTerm) {
    trackEvent('Search', 'search_query', label: searchTerm);
  }
  
  /// Track a purchase/subscription event
  /// 
  /// [plan] - The plan name (e.g., 'Premium', 'Basic')
  /// [price] - The price in EUR
  static void trackPurchase(String plan, double price) {
    trackEvent(
      'Purchase',
      'purchase_plan',
      label: plan,
      value: price.toInt(),
    );
  }
  
  /// Track user registration
  /// 
  /// [method] - Registration method (e.g., 'email', 'google', 'apple')
  static void trackRegistration(String method) {
    trackEvent('User', 'registration', label: method);
  }
  
  /// Track user login
  /// 
  /// [method] - Login method (e.g., 'email', 'google', 'apple')
  static void trackLogin(String method) {
    trackEvent('User', 'login', label: method);
  }
  
  /// Track button clicks
  /// 
  /// [buttonName] - Name or identifier of the button
  static void trackButtonClick(String buttonName) {
    trackEvent('Button', 'click', label: buttonName);
  }
  
  /// Track form submissions
  /// 
  /// [formName] - Name of the form (e.g., 'contact', 'search')
  static void trackFormSubmit(String formName) {
    trackEvent('Form', 'submit', label: formName);
  }
  
  /// Track errors
  /// 
  /// [errorType] - Type of error
  /// [errorMessage] - Error message or description
  static void trackError(String errorType, String errorMessage) {
    trackEvent('Error', errorType, label: errorMessage);
  }
}

