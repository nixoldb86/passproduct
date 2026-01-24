import Flutter
import DeviceCheck

/// PlatformAttestationHandler
///
/// Handles platform attestation for iOS using DeviceCheck API.
/// This validates that requests come from legitimate, unmodified devices.
///
/// DeviceCheck provides:
/// - Device authenticity verification (real iOS device, not simulator)
/// - Per-device token generation (cryptographically secure)
/// - Server-side validation with Apple servers
///
/// Note: DeviceCheck tokens can only be generated on real iOS devices.
/// Simulators will fail with DCError.featureUnsupported.
class PlatformAttestationHandler: NSObject, FlutterPlugin {

    static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(
            name: "com.pricofy/platform_attestation",
            binaryMessenger: registrar.messenger()
        )
        let instance = PlatformAttestationHandler()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }

    func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "getDeviceCheckToken":
            handleGetDeviceCheckToken(call: call, result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }

    /// Generate a DeviceCheck token for platform attestation
    ///
    /// The token is bound to:
    /// - The specific device
    /// - The app bundle identifier
    /// - The current timestamp
    ///
    /// Arguments:
    /// - nonce: Server challenge nonce
    /// - response: PoW response (for binding)
    ///
    /// Returns: "ios_devicecheck:<base64_token>"
    private func handleGetDeviceCheckToken(call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: String],
              let nonce = args["nonce"],
              let response = args["response"] else {
            result(FlutterError(
                code: "INVALID_ARGS",
                message: "Missing nonce or response arguments",
                details: nil
            ))
            return
        }

        // Log the request (without sensitive data)
        print("[PlatformAttest] Generating DeviceCheck token for nonce: \(nonce.prefix(16))...")

        // Check iOS version (DeviceCheck requires iOS 11+)
        if #available(iOS 11.0, *) {
            let device = DCDevice.current

            // Check if DeviceCheck is supported on this device
            guard device.isSupported else {
                print("[PlatformAttest] DeviceCheck not supported on this device")
                result(FlutterError(
                    code: "NOT_SUPPORTED",
                    message: "DeviceCheck is not supported on this device (simulator or restricted device)",
                    details: nil
                ))
                return
            }

            // Generate the token
            device.generateToken { tokenData, error in
                if let error = error {
                    print("[PlatformAttest] DeviceCheck error: \(error.localizedDescription)")

                    // Map DCError to user-friendly messages
                    let errorCode: String
                    let errorMessage: String

                    if let dcError = error as? DCError {
                        switch dcError.code {
                        case .unknownSystemFailure:
                            errorCode = "SYSTEM_FAILURE"
                            errorMessage = "Device verification system failure"
                        case .featureUnsupported:
                            errorCode = "UNSUPPORTED"
                            errorMessage = "DeviceCheck not supported (simulator or restricted)"
                        default:
                            errorCode = "DEVICECHECK_ERROR"
                            errorMessage = error.localizedDescription
                        }
                    } else {
                        errorCode = "DEVICECHECK_ERROR"
                        errorMessage = error.localizedDescription
                    }

                    result(FlutterError(
                        code: errorCode,
                        message: errorMessage,
                        details: nil
                    ))
                    return
                }

                guard let tokenData = tokenData else {
                    print("[PlatformAttest] No token data returned")
                    result(FlutterError(
                        code: "NO_TOKEN",
                        message: "DeviceCheck returned no token",
                        details: nil
                    ))
                    return
                }

                // Encode token as base64
                let tokenBase64 = tokenData.base64EncodedString()

                // Return with prefix for easy parsing on backend
                let formattedToken = "ios_devicecheck:\(tokenBase64)"

                print("[PlatformAttest] DeviceCheck token generated successfully (length: \(tokenBase64.count))")
                result(formattedToken)
            }
        } else {
            print("[PlatformAttest] iOS version < 11, DeviceCheck not available")
            result(FlutterError(
                code: "IOS_VERSION",
                message: "DeviceCheck requires iOS 11 or later",
                details: nil
            ))
        }
    }
}
