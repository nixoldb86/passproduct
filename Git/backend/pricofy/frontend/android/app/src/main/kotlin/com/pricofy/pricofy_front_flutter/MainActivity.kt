package com.pricofy.pricofy_front_flutter

import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine

class MainActivity : FlutterFragmentActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // Register Platform Attestation handler for Play Integrity
        flutterEngine.plugins.add(PlatformAttestationHandler())
    }
}
