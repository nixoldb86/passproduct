import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/api_config.dart';

/// Modal que aparece cuando un usuario no registrado intenta acceder a funciones premium
/// Basado en las especificaciones de MODAL_REGISTRO_SPECS.md
class RegistrationModal extends StatelessWidget {
  final VoidCallback onClose;
  final VoidCallback? onRegister;
  final String? title;
  final String? message;

  const RegistrationModal({
    super.key,
    required this.onClose,
    this.onRegister,
    this.title,
    this.message,
  });

  /// Redirección por defecto a landing para registro
  Future<void> _defaultRegister(BuildContext context) async {
    onClose();
    final landingUrl = ApiConfig.isProduction
        ? 'https://pricofy.com/landing'
        : 'https://dev.pricofy.com/#/landing';
    final uri = Uri.parse(landingUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.platformDefault);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 640;

    return Stack(
      children: [
        // Backdrop con blur
        Positioned.fill(
          child: GestureDetector(
            onTap: onClose,
            child: Container(
              color: Colors.black.withValues(alpha: 0.5),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Container(
                  color: Colors.black.withValues(alpha: 0.0),
                ),
              ),
            ),
          ),
        ),

        // Modal
        Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: _FadeInUpAnimation(
              child: Container(
                width: double.infinity,
                constraints: const BoxConstraints(maxWidth: 448),
                padding: EdgeInsets.all(isMobile ? 20 : 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.25),
                      blurRadius: 50,
                      offset: const Offset(0, 25),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Botón cerrar (X)
                    Positioned(
                      top: 0,
                      right: 0,
                      child: IconButton(
                        onPressed: onClose,
                        icon: const Icon(
                          Icons.close,
                          size: 20,
                          color: Color(0xFF9CA3AF), // gray-400
                        ),
                        style: IconButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(20, 20),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ),

                    // Contenido
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Icono candado
                        Container(
                          width: 48,
                          height: 48,
                          margin: const EdgeInsets.only(bottom: 12),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Color(0xFFF5F3FF), // primary-100
                                Color(0xFFFAF5FF), // purple-100
                              ],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.lock_outline,
                            size: 24,
                            color: Color(0xFF667EEA), // primary-600
                          ),
                        ),

                        // Título
                        Text(
                          title ?? 'Regístrate para continuar',
                          style: TextStyle(
                            fontSize: isMobile ? 20 : 24,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF111827), // gray-900
                            height: 1.25,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),

                        // Mensaje
                        Text(
                          message ?? 'Regístrate para acceder a todas las funciones de la plataforma.',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: Color(0xFF4B5563), // gray-600
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),

                        // Caja de beneficios
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB), // gray-50
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Con una cuenta podrás:',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF374151), // gray-700
                                ),
                              ),
                              const SizedBox(height: 6),
                              _buildBenefitItem('Búsquedas avanzadas e inteligentes'),
                              const SizedBox(height: 6),
                              _buildBenefitItem('Análisis de venta de productos'),
                              const SizedBox(height: 6),
                              _buildBenefitItem('Guardar favoritos y archivar búsquedas'),
                              const SizedBox(height: 6),
                              _buildBenefitItem('Historial completo de búsquedas avanzadas'),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Botones
                        Column(
                          children: [
                            // Botón primario
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => onRegister != null ? onRegister!() : _defaultRegister(context),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 0,
                                  shadowColor: Colors.black.withValues(alpha: 0.1),
                                ),
                                child: Ink(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        Color(0xFF667EEA), // primary-600
                                        Color(0xFFA855F7), // purple-600
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Container(
                                    alignment: Alignment.center,
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                    child: const Text(
                                      'Registrarse gratis',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 8),

                            // Botón secundario
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: onClose,
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  side: const BorderSide(
                                    color: Color(0xFFD1D5DB), // gray-300
                                    width: 2,
                                  ),
                                  foregroundColor: const Color(0xFF374151), // gray-700
                                ),
                                child: const Text(
                                  'Quizás más tarde',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBenefitItem(String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 2),
          child: Icon(
            Icons.check,
            size: 16,
            color: Color(0xFF667EEA), // primary-600
          ),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: Color(0xFF4B5563), // gray-600
              height: 1.5,
            ),
          ),
        ),
      ],
    );
  }
}

/// Animación de entrada fade-in-up
class _FadeInUpAnimation extends StatefulWidget {
  final Widget child;

  const _FadeInUpAnimation({required this.child});

  @override
  State<_FadeInUpAnimation> createState() => _FadeInUpAnimationState();
}

class _FadeInUpAnimationState extends State<_FadeInUpAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    _scaleAnimation = Tween<double>(
      begin: 0.95,
      end: 1.0,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 16),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOut,
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: _slideAnimation.value,
          child: Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _fadeAnimation.value,
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}

