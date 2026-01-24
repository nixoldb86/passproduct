// Network Image Widget
//
// Cross-platform image widget that handles CORS issues on Flutter Web.
// On web, uses HTML img elements which bypass CORS restrictions.
// On mobile/desktop, uses standard Image.network.
//
// This file exports the correct implementation based on platform.

export 'network_image_widget_stub.dart'
    if (dart.library.js_interop) 'network_image_widget_impl.dart';
