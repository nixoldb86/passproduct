// New Request Page
//
// Full screen form for submitting new evaluation requests.
// - Auto-detect country
// - Photo picker (max 6, 5MB each)
// - Multipart upload to API Gateway
// - No reCAPTCHA on mobile (web-only feature removed)
// - Email validation with disposable check
// - Auto-fill email for authenticated users
// - Rate limiting validation
// - Responsive layout with max-width on web

import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb, kDebugMode, debugPrint;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/validators.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/services/location_service.dart';
import '../../../core/models/coordinates.dart';
import '../../../config/routes.dart';

class NewRequestPage extends StatefulWidget {
  final VoidCallback? onClose;
  final String? initialAction; // 'vender' or 'comprar'
  final bool showAsPage; // If true, wrap in Scaffold with AppBar; if false, just show content

  const NewRequestPage({
    super.key,
    this.onClose,
    this.initialAction,
    this.showAsPage = true,
  });

  @override
  State<NewRequestPage> createState() => _NewRequestPageState();
}

class _NewRequestPageState extends State<NewRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final ImagePicker _picker = ImagePicker();
  late final BffApiClient _apiClient;

  // Form fields
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _cityController = TextEditingController();
  final TextEditingController _postalCodeController = TextEditingController();
  final TextEditingController _modelBrandController = TextEditingController();
  final TextEditingController _accessoriesController = TextEditingController();

  String? _selectedCountry;
  String? _selectedAction;
  String? _selectedProductType;
  String? _selectedCondition;
  String? _selectedUrgency;
  final List<XFile> _selectedPhotos = [];

  // State
  bool _countriesLoading = true;
  bool _isSubmitting = false;
  bool _submitSuccess = false;
  String? _submitError;
  String? _detectedCountry;
  String? _detectedPostalCode;

  // Errors map
  final Map<String, String?> _errors = {};

  @override
  void initState() {
    super.initState();

    // Initialize after widget is mounted
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _apiClient = context.read<BffApiClient>();
      _detectLocation();

      // Auto-fill email if user is authenticated
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        final userEmail = authProvider.user?.email;
        if (userEmail != null) {
          _emailController.text = userEmail;
        }
      }

      // Set initial action if provided
      if (widget.initialAction != null) {
        final l10n = context.l10n;
        _selectedAction = widget.initialAction == 'vender'
            ? l10n.formActionSell
            : l10n.formActionBuy;

        // Set default urgency for sell action
        if (widget.initialAction == 'vender') {
          _selectedUrgency = l10n.formUrgencyFast;
        }
      }
      setState(() {});
    });
  }

  Future<void> _detectLocation() async {
    try {
      final locationService = LocationService(_apiClient);
      
      // Try location detection (IP for web, GPS+IP for mobile)
      final location = await locationService.detectLocation();
      
      if (location != null) {
        if (kDebugMode) debugPrint('Location detected: ${location.cityCountry}, CP: ${location.postalCode}');
        
        setState(() {
          _selectedCountry = location.country;
          _detectedCountry = location.country;
          _cityController.text = location.city ?? '';
          _postalCodeController.text = location.postalCode ?? '';
          _detectedPostalCode = location.postalCode;
          _countriesLoading = false;
        });
      } else {
        // Fallback: Try basic country detection
        if (kDebugMode) debugPrint('Location detection failed, trying country-only');
        final data = await _apiClient.detectCountry();
        if (data['country'] != null && europeanCountries.contains(data['country'])) {
          setState(() {
            _detectedCountry = data['country'] as String;
            _selectedCountry = _detectedCountry;
            _countriesLoading = false;
          });
        } else {
          setState(() {
            _countriesLoading = false;
          });
        }
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Error detecting location: $e');
      setState(() {
        _countriesLoading = false;
      });
    }
  }

  List<String> _getOrderedCountries() {
    return getOrderedCountries(_detectedCountry);
  }

  Future<void> _pickImages() async {
    // Capture l10n before async gap
    final l10n = context.l10n;

    try {
      final List<XFile> images = await _picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (!mounted) return;

      if (images.length + _selectedPhotos.length > 6) {
        setState(() {
          _errors['fotos'] = l10n.formErrorPhotosMax;
        });
        return;
      }

      // Check file sizes (max 5MB each)
      for (final image in images) {
        final bytes = await image.length();
        if (!mounted) return;
        if (bytes > 5 * 1024 * 1024) {
          setState(() {
            _errors['fotos'] = l10n.formPhotosMax;
          });
          return;
        }
      }

      setState(() {
        _selectedPhotos.addAll(images);
        _errors.remove('fotos');
      });
    } catch (e) {
      if (kDebugMode) debugPrint('Error picking images: $e');
    }
  }

  void _removePhoto(int index) {
    setState(() {
      _selectedPhotos.removeAt(index);
      if (_selectedPhotos.isEmpty) {
        _errors.remove('fotos');
      }
    });
  }

  bool _validateForm() {
    _errors.clear();
    final l10n = context.l10n;

    // Email validation
    final emailValidation = validateEmail(_emailController.text.trim());
    if (!emailValidation.valid) {
      _errors['email'] = emailValidation.error;
    }

    // Required fields
    if (_selectedCountry == null || _selectedCountry!.isEmpty) {
      _errors['pais'] = l10n.formErrorCountryRequired;
    }
    if (_cityController.text.trim().isEmpty) {
      _errors['ciudad'] = l10n.formErrorCityRequired;
    }
    if (_selectedAction == null || _selectedAction!.isEmpty) {
      _errors['accion'] = l10n.formErrorActionRequired;
    }
    if (_selectedProductType == null || _selectedProductType!.isEmpty) {
      _errors['tipoProducto'] = l10n.formErrorProductTypeRequired;
    }
    if (_modelBrandController.text.trim().isEmpty) {
      _errors['modeloMarca'] = l10n.formErrorModelBrandRequired;
    }
    if (_selectedCondition == null || _selectedCondition!.isEmpty) {
      _errors['estado'] = l10n.formErrorConditionRequired;
    }

    // If selling, urgency and photos are required
    final isSelling = _selectedAction == l10n.formActionSell;
    if (isSelling) {
      if (_selectedUrgency == null || _selectedUrgency!.isEmpty) {
        _errors['urgencia'] = l10n.formErrorUrgencyRequired;
      }
      if (_selectedPhotos.isEmpty) {
        _errors['fotos'] = l10n.formPhotosMin;
      }
    }

    setState(() {});
    return _errors.isEmpty;
  }

  Future<void> _handleSubmit() async {
    if (!_validateForm()) {
      return;
    }

    // Capture l10n before async operations
    final l10n = context.l10n;

    setState(() {
      _isSubmitting = true;
      _submitError = null;
    });

    try {

      // Note: reCAPTCHA token is automatically added by RecaptchaInterceptor
      // via the X-Recaptcha-Token header for /submit-request endpoint

      // Geocode location before submit to get coordinates
      Coordinates? coords;
      String metodoDeteccion = 'manual';
      
      final postalCode = _postalCodeController.text.trim();
      final city = _cityController.text.trim();
      
      if (postalCode.isNotEmpty) {
        // Use postal code (most precise)
        if (kDebugMode) debugPrint('Geocoding by postal code: $postalCode');
        try {
          final response = await _apiClient.post('/geocode-by-postal', 
            data: {'postalCode': postalCode}
          );
          if (response['success'] == true && response['coords'] != null) {
            coords = Coordinates.fromJson(response['coords']);
            // Check if postal code was auto-detected or manual
            metodoDeteccion = (postalCode == _detectedPostalCode && _detectedPostalCode != null) 
                ? 'ip' 
                : 'manual';
            if (kDebugMode) debugPrint('✅ Coords from postal code: ${coords.lat}, ${coords.lon}');
          }
        } catch (e) {
          if (kDebugMode) debugPrint('⚠️ Geocoding by postal code failed: $e');
        }
      } else if (city.isNotEmpty) {
        // Fallback: Use city name
        if (kDebugMode) debugPrint('Geocoding by city: $city');
        try {
          final response = await _apiClient.post('/geocode-by-postal',
            data: {'municipio': city}
          );
          if (response['success'] == true && response['coords'] != null) {
            coords = Coordinates.fromJson(response['coords']);
            if (kDebugMode) debugPrint('✅ Coords from city: ${coords.lat}, ${coords.lon}');
          }
        } catch (e) {
          if (kDebugMode) debugPrint('⚠️ Geocoding by city failed: $e');
        }
      }

      // Prepare multipart request
      final formData = {
        'email': _emailController.text.trim(),
        'pais': _selectedCountry!,
        'ciudad': city,
        'codigoPostal': postalCode.isNotEmpty ? postalCode : null,
        'accion': _selectedAction!,
        'tipoProducto': _selectedProductType!,
        'modeloMarca': _modelBrandController.text.trim(),
        'estado': _selectedCondition!,
        'accesorios': _accessoriesController.text.trim(),
        'urgencia': _selectedUrgency ?? '',
        'coordenadas': coords != null ? {'lat': coords.lat, 'lon': coords.lon} : null,
        'metodoDeteccion': metodoDeteccion,
        'language': l10n.localeName,
      };

      await _apiClient.submitEvaluationWithPhotos(formData, _selectedPhotos);

      setState(() {
        _submitSuccess = true;
      });

      // Reset form after 2 seconds and close
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        _resetForm();
        if (widget.onClose != null) {
          widget.onClose!();
        } else {
          Navigator.of(context).pop();
        }
      }
    } on DioException catch (e) {
      if (!mounted) return;

      // Handle payment required (402)
      if (e.response?.statusCode == 402) {
        final errorData = e.response?.data as Map<String, dynamic>?;
        _showPaymentRequiredDialog(context, errorData);
        setState(() {
          _isSubmitting = false;
        });
        return;
      }

      // Handle other errors
      setState(() {
        _submitError =
            e.toString().contains('una evaluación al día') ||
                e.toString().contains('one evaluation per day')
            ? l10n.formErrorOnePerDay
            : l10n.formErrorSubmitError;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _submitError = l10n.formErrorSubmitError;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _resetForm() {
    _emailController.clear();
    _cityController.clear();
    _postalCodeController.clear();
    _modelBrandController.clear();
    _accessoriesController.clear();
    _selectedCountry = _detectedCountry;
    _selectedAction = null;
    _selectedProductType = null;
    _selectedCondition = null;
    _selectedUrgency = null;
    _selectedPhotos.clear();
    _errors.clear();
    _submitSuccess = false;
    _submitError = null;
    setState(() {});
  }

  void _showPaymentRequiredDialog(BuildContext context, Map<String, dynamic>? errorData) {
    final l10n = context.l10n;
    final details = errorData?['details'] as Map<String, dynamic>?;
    final actions = errorData?['actions'] as Map<String, dynamic>?;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.formInsufficientFunds),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.formInsufficientFundsMessage),
            if (details != null) ...[
              const SizedBox(height: 16),
              Text('${l10n.formCost}: ${(details['required'] as int? ?? 0) / 100}'),
              Text('${l10n.formYourBalance}: ${(details['available'] as int? ?? 0) / 100}'),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.commonCancel),
          ),
          if (actions?['canAddFunds'] == true)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.profile); // Navigate to profile (Wallet tab)
              },
              child: Text(l10n.formAddFunds),
            ),
          if (actions?['canSubscribe'] == true)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                context.go(AppRoutes.profile); // Navigate to profile (Subscription tab)
              },
              child: Text(l10n.formViewPlans),
            ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _cityController.dispose();
    _postalCodeController.dispose();
    _modelBrandController.dispose();
    _accessoriesController.dispose();
    super.dispose();
  }

  Widget _buildFormField({
    required String label,
    required Widget child,
    bool required = false,
    String? error,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF374151),
              ),
            ),
            if (required)
              const Text(
                ' *',
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
          ],
        ),
        const SizedBox(height: 8),
        child,
        if (error != null) ...[
          const SizedBox(height: 4),
          Text(error, style: const TextStyle(color: Colors.red, fontSize: 14)),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isSmall = MediaQuery.of(context).size.width < 768;
    final isSelling = _selectedAction == l10n.formActionSell;

    // Product types from ARB
    final productTypes = [
      l10n.formProductTypeElectronics,
      l10n.formProductTypeMobiles,
      l10n.formProductTypeIT,
      l10n.formProductTypeAudioVideo,
      l10n.formProductTypeCars,
      l10n.formProductTypeBikes,
      l10n.formProductTypeClothing,
      l10n.formProductTypeHome,
      l10n.formProductTypeSports,
      l10n.formProductTypeBooks,
      l10n.formProductTypeToys,
      l10n.formProductTypeOther,
    ];

    // Conditions from ARB
    final conditions = [
      l10n.formConditionNew,
      l10n.formConditionLikeNew,
      l10n.formConditionGood,
      l10n.formConditionUsed,
      l10n.formConditionRepair,
    ];

    // Urgencies from ARB
    final urgencies = [
      l10n.formUrgencyFast,
      l10n.formUrgencyNoRush,
      l10n.formUrgencyBestPrice,
    ];

    final content = SingleChildScrollView(
      child: Form(
        key: _formKey,
        child: Padding(
          padding: EdgeInsets.all(isSmall ? 16.0 : 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Email (only show if NOT authenticated)
              Consumer<AuthProvider>(
                builder: (context, authProvider, _) {
                  if (authProvider.isAuthenticated) {
                    // User is logged in - email is auto-filled, no need to show field
                    return const SizedBox.shrink();
                  }
                  
                  // Not authenticated - show email field
                  return Column(
                    children: [
                      _buildFormField(
                        label: l10n.formEmail,
                        required: true,
                        error: _errors['email'],
                        child: TextField(
                          controller: _emailController,
                          keyboardType: TextInputType.emailAddress,
                          decoration: InputDecoration(
                            hintText: l10n.formEmailPlaceholder,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: BorderSide(
                                color: _errors['email'] != null
                                    ? Colors.red
                                    : const Color(0xFFD1D5DB),
                              ),
                            ),
                          ),
                          onChanged: (_) => setState(() => _errors.remove('email')),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  );
                },
              ),

              // Country
              _buildFormField(
                label: l10n.formCountry,
                required: true,
                error: _errors['pais'],
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedCountry,
                  decoration: InputDecoration(
                    hintText: _countriesLoading
                        ? l10n.formDetectingCountry
                        : l10n.formCountryPlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  items: _getOrderedCountries().map((country) {
                    return DropdownMenuItem(
                      value: country,
                      child: Text(country),
                    );
                  }).toList(),
                  onChanged: _countriesLoading
                      ? null
                      : (value) {
                          setState(() {
                            _selectedCountry = value;
                            _errors.remove('pais');
                          });
                        },
                ),
              ),
              const SizedBox(height: 20),

              // City
              _buildFormField(
                label: l10n.formCity,
                required: true,
                error: _errors['ciudad'],
                child: TextField(
                  controller: _cityController,
                  decoration: InputDecoration(
                    hintText: l10n.formCityPlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onChanged: (_) => setState(() => _errors.remove('ciudad')),
                ),
              ),
              const SizedBox(height: 20),

              // Postal Code
              _buildFormField(
                label: l10n.formPostalCode,
                required: false,
                error: _errors['codigoPostal'],
                child: TextField(
                  controller: _postalCodeController,
                  decoration: InputDecoration(
                    hintText: '28001',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    helperText: l10n.formPostalCodeHelper,
                  ),
                  keyboardType: TextInputType.number,
                  maxLength: 5,
                  onChanged: (value) {
                    setState(() => _errors.remove('codigoPostal'));
                    // Validate format
                    if (value.isNotEmpty && value.length != 5) {
                      _errors['codigoPostal'] = l10n.formPostalCodeError;
                    }
                  },
                ),
              ),
              const SizedBox(height: 20),

              // Action (radio buttons)
              _buildFormField(
                label: l10n.formAction,
                required: true,
                error: _errors['accion'],
                child: RadioGroup<String>(
                  groupValue: _selectedAction,
                  onChanged: (value) {
                    setState(() {
                      _selectedAction = value;
                      if (value == l10n.formActionSell) {
                        _selectedUrgency = urgencies[0]; // Default urgency
                      } else {
                        _selectedUrgency = null; // No urgency for buying
                      }
                      _errors.remove('accion');
                    });
                  },
                  child: Column(
                    children: [
                      RadioListTile<String>(
                        title: Text(l10n.formActionSell),
                        value: l10n.formActionSell,
                      ),
                      RadioListTile<String>(
                        title: Text(l10n.formActionBuy),
                        value: l10n.formActionBuy,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Product Type
              _buildFormField(
                label: l10n.formProductType,
                required: true,
                error: _errors['tipoProducto'],
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedProductType,
                  decoration: InputDecoration(
                    hintText: l10n.formProductTypePlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  items: productTypes.map((type) {
                    return DropdownMenuItem(value: type, child: Text(type));
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedProductType = value;
                      _errors.remove('tipoProducto');
                    });
                  },
                ),
              ),
              const SizedBox(height: 20),

              // Model/Brand
              _buildFormField(
                label: l10n.formModelBrand,
                required: true,
                error: _errors['modeloMarca'],
                child: TextField(
                  controller: _modelBrandController,
                  decoration: InputDecoration(
                    hintText: l10n.formModelBrandPlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onChanged: (_) =>
                      setState(() => _errors.remove('modeloMarca')),
                ),
              ),
              const SizedBox(height: 20),

              // Condition
              _buildFormField(
                label: l10n.formCondition,
                required: true,
                error: _errors['estado'],
                child: DropdownButtonFormField<String>(
                  initialValue: _selectedCondition,
                  decoration: InputDecoration(
                    hintText: l10n.formConditionPlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  items: conditions.map((condition) {
                    return DropdownMenuItem(
                      value: condition,
                      child: Text(condition),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedCondition = value;
                      _errors.remove('estado');
                    });
                  },
                ),
              ),
              const SizedBox(height: 20),

              // Accessories
              _buildFormField(
                label: l10n.formAccessories,
                required: false,
                child: TextField(
                  controller: _accessoriesController,
                  maxLines: 3,
                  decoration: InputDecoration(
                    hintText: l10n.formAccessoriesPlaceholder,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Urgency (only if selling)
              if (isSelling) ...[
                _buildFormField(
                  label: l10n.formUrgency,
                  required: true,
                  error: _errors['urgencia'],
                  child: DropdownButtonFormField<String>(
                    initialValue: _selectedUrgency,
                    decoration: InputDecoration(
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    items: urgencies.map((urgency) {
                      return DropdownMenuItem(
                        value: urgency,
                        child: Text(urgency),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedUrgency = value;
                        _errors.remove('urgencia');
                      });
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Photos
              _buildFormField(
                label: l10n.formPhotos,
                required: isSelling,
                error: _errors['fotos'],
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _selectedPhotos.length < 6
                          ? _pickImages
                          : null,
                      icon: const Icon(Icons.add_photo_alternate),
                      label: Text(l10n.formPhotosSelectButton),
                    ),
                    if (_selectedPhotos.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        '${_selectedPhotos.length} ${l10n.formPhotosSelected}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.grey,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: List.generate(_selectedPhotos.length, (
                          index,
                        ) {
                          return Stack(
                            children: [
                              kIsWeb
                                  ? Image.network(
                                      _selectedPhotos[index].path,
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                    )
                                  : Image.file(
                                      File(_selectedPhotos[index].path),
                                      width: 80,
                                      height: 80,
                                      fit: BoxFit.cover,
                                    ),
                              Positioned(
                                top: 0,
                                right: 0,
                                child: GestureDetector(
                                  onTap: () => _removePhoto(index),
                                  child: Container(
                                    color: Colors.black54,
                                    child: const Icon(
                                      Icons.close,
                                      color: Colors.white,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          );
                        }),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Submit error
              if (_submitError != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    border: Border.all(color: Colors.red.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _submitError!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Success message
              if (_submitSuccess) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    border: Border.all(color: Colors.green.shade200),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    l10n.formSuccess,
                    style: const TextStyle(color: Colors.green),
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed:
                          widget.onClose ?? () => Navigator.of(context).pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: Text(l10n.formCancel),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _isSubmitting ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            )
                          : Text(l10n.formSubmit),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    // If not showing as a page, just return the content
    // (used when embedded in dashboard)
    if (!widget.showAsPage) {
      return Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 800),
          child: content,
        ),
      );
    }

    // Handle back navigation for full page mode
    final authProvider = context.read<AuthProvider>();
    void handleBack() {
      if (widget.onClose != null) {
        widget.onClose!();
      } else {
        // Navigate back based on auth state
        if (authProvider.isAuthenticated) {
          context.go(AppRoutes.dashboard);
        } else {
          context.go(AppRoutes.home);
        }
      }
    }

    // Full screen on all platforms (navigated as dedicated route)
    // On web: use standard Scaffold with AppBar
    // On mobile: use standard Scaffold with AppBar
    if (kIsWeb) {
      return Scaffold(
        appBar: AppBar(
          title: Text(l10n.formRequestEvaluation),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: handleBack,
          ),
        ),
        body: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: content,
          ),
        ),
      );
    }

    // Mobile: Full screen
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.formRequestEvaluation),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: handleBack,
        ),
      ),
      body: content,
    );
  }
}
