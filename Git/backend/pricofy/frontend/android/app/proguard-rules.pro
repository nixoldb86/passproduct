# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# AWS Amplify + Cognito
-keep class com.amazonaws.** { *; }
-keep class com.amplifyframework.** { *; }
-dontwarn com.amazonaws.**
-dontwarn com.amplifyframework.**

# Google Tink (used by Amplify Secure Storage)
-keep class com.google.crypto.tink.** { *; }
-dontwarn com.google.crypto.tink.**
-dontwarn com.google.errorprone.annotations.**
-dontwarn javax.annotation.**
-dontwarn javax.lang.model.**

# Dio HTTP Client
-keep class dio.** { *; }
-dontwarn okio.**
-dontwarn okhttp3.**

# Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep generic signature of Call, Response (R8 full mode strips signatures from non-kept items)
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# Models (if using JSON serialization)
-keepclassmembers class ** {
  @com.google.gson.annotations.SerializedName <fields>;
}

# Keep models
-keep class com.pricofy.pricofy_front_flutter.** { *; }

# Kotlin
-dontwarn kotlin.**
-dontwarn kotlinx.**

# Image Picker
-keep class androidx.lifecycle.** { *; }
-keep class androidx.activity.** { *; }

# Prevent obfuscation of model classes
-keepattributes *Annotation*, InnerClasses
-keepattributes SourceFile, LineNumberTable
-keep public class * extends java.lang.Exception

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep setters in Views
-keepclassmembers public class * extends android.view.View {
    void set*(***);
    *** get*();
}

# Keep Activity subclasses
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# Google Play Core (for deferred components - not used)
-dontwarn com.google.android.play.core.**

# R8 full mode optimizations
-allowaccessmodification
-repackageclasses

