// Favorites Service
//
// Manages favorite evaluations using SharedPreferences.
// Persists across app restarts.
//
// Features:
// - Add/remove favorites
// - Check if evaluation is favorited
// - Get all favorites
// - Persist in local storage

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart' show kDebugMode;

class FavoritesService {
  static const String _key = 'evaluation_favorites';
  
  Set<String> _favoriteIds = {};
  bool _initialized = false;

  /// Initialize service (load from storage)
  /// Call this once at app startup
  Future<void> initialize() async {
    if (_initialized) return;
    
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<String>? stored = prefs.getStringList(_key);
      
      if (stored != null) {
        _favoriteIds = Set<String>.from(stored);
        if (kDebugMode) print('✅ [Favorites] Loaded ${_favoriteIds.length} favorites');
      }
      
      _initialized = true;
    } catch (e) {
      if (kDebugMode) print('❌ [Favorites] Error loading: $e');
      _favoriteIds = {};
      _initialized = true;
    }
  }

  /// Check if evaluation is favorited
  bool isFavorite(String evaluationId) {
    return _favoriteIds.contains(evaluationId);
  }

  /// Toggle favorite status
  /// Returns new status (true = favorited, false = unfavorited)
  Future<bool> toggleFavorite(String evaluationId) async {
    await initialize(); // Ensure initialized

    final wasFavorite = _favoriteIds.contains(evaluationId);
    
    if (wasFavorite) {
      _favoriteIds.remove(evaluationId);
      if (kDebugMode) print('❌ [Favorites] Removed: $evaluationId');
    } else {
      _favoriteIds.add(evaluationId);
      if (kDebugMode) print('✅ [Favorites] Added: $evaluationId');
    }

    // Persist to storage
    await _save();

    return !wasFavorite;
  }

  /// Add favorite
  Future<void> addFavorite(String evaluationId) async {
    await initialize();
    
    if (!_favoriteIds.contains(evaluationId)) {
      _favoriteIds.add(evaluationId);
      await _save();
      if (kDebugMode) print('✅ [Favorites] Added: $evaluationId');
    }
  }

  /// Remove favorite
  Future<void> removeFavorite(String evaluationId) async {
    await initialize();
    
    if (_favoriteIds.contains(evaluationId)) {
      _favoriteIds.remove(evaluationId);
      await _save();
      if (kDebugMode) print('❌ [Favorites] Removed: $evaluationId');
    }
  }

  /// Get all favorite IDs
  Future<Set<String>> getAllFavorites() async {
    await initialize();
    return Set<String>.from(_favoriteIds);
  }

  /// Get favorites count
  int get count => _favoriteIds.length;

  /// Clear all favorites
  Future<void> clearAll() async {
    _favoriteIds.clear();
    await _save();
    if (kDebugMode) print('🗑️ [Favorites] Cleared all');
  }

  /// Save to SharedPreferences
  Future<void> _save() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList(_key, _favoriteIds.toList());
    } catch (e) {
      if (kDebugMode) print('❌ [Favorites] Error saving: $e');
    }
  }
}

