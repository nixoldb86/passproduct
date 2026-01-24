import 'dart:ui';

import 'package:flutter/material.dart';

/// Modal que aparece cuando el usuario busca algo y debe elegir entre 3 tipos de búsqueda
/// Basado en las especificaciones de MODAL_TIPO_BUSQUEDA_SPECS.md
class SearchTypeModal extends StatefulWidget {
  final String searchText;
  final bool isGuestMode;
  final VoidCallback onClassicSearch;
  final VoidCallback onSmartSearch;
  final VoidCallback onSalesAnalysis;
  final VoidCallback onClose;

  const SearchTypeModal({
    super.key,
    required this.searchText,
    required this.isGuestMode,
    required this.onClassicSearch,
    required this.onSmartSearch,
    required this.onSalesAnalysis,
    required this.onClose,
  });

  @override
  State<SearchTypeModal> createState() => _SearchTypeModalState();
}

class _SearchTypeModalState extends State<SearchTypeModal> {
  double _dragOffset = 0;
  bool _isDragging = false;
  
  void _onDragStart(DragStartDetails details) {
    setState(() => _isDragging = true);
  }
  
  void _onDragUpdate(DragUpdateDetails details) {
    // Solo permitir arrastrar hacia abajo
    if (details.delta.dy > 0 || _dragOffset > 0) {
      setState(() {
        _dragOffset += details.delta.dy;
        if (_dragOffset < 0) _dragOffset = 0;
      });
    }
  }
  
  void _onDragEnd(DragEndDetails details) {
    setState(() => _isDragging = false);
    // Si se arrastró más de 100px hacia abajo, cerrar
    if (_dragOffset > 100 || details.velocity.pixelsPerSecond.dy > 500) {
      widget.onClose();
    } else {
      // Volver a la posición original
      setState(() => _dragOffset = 0);
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    return Stack(
      children: [
        // Backdrop con blur
        Positioned.fill(
          child: GestureDetector(
            onTap: widget.onClose,
            child: Container(
              color: Colors.black.withValues(alpha: 0.4),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Container(
                  color: Colors.black.withValues(alpha: 0.0),
                ),
              ),
            ),
          ),
        ),

        // Modal con soporte para deslizar hacia abajo para cerrar
        Align(
          alignment: isMobile ? Alignment.bottomCenter : Alignment.center,
          child: Padding(
            padding: isMobile ? EdgeInsets.zero : const EdgeInsets.all(16),
            child: _SlideUpAnimation(
              child: AnimatedContainer(
                duration: _isDragging ? Duration.zero : const Duration(milliseconds: 200),
                curve: Curves.easeOutCubic,
                transform: Matrix4.translationValues(0, _dragOffset, 0),
                child: GestureDetector(
                  onVerticalDragStart: isMobile ? _onDragStart : null,
                  onVerticalDragUpdate: isMobile ? _onDragUpdate : null,
                  onVerticalDragEnd: isMobile ? _onDragEnd : null,
                  child: Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(maxWidth: 512),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: isMobile
                          ? const BorderRadius.only(
                              topLeft: Radius.circular(24),
                              topRight: Radius.circular(24),
                            )
                          : BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 50,
                          offset: const Offset(0, 25),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Barra de arrastre (solo móvil) - área táctil para deslizar
                        if (isMobile)
                          Padding(
                            padding: const EdgeInsets.only(top: 12, bottom: 8),
                            child: Center(
                              child: Container(
                                width: 48,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD1D5DB), // gray-300
                                  borderRadius: BorderRadius.circular(9999),
                                ),
                              ),
                            ),
                          ),

                        // Header
                        Container(
                          padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                          decoration: const BoxDecoration(
                            border: Border(
                              bottom: BorderSide(
                                color: Color(0xFFF3F4F6), // gray-100
                                width: 1,
                              ),
                            ),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      '¿Qué tipo de búsqueda?',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF111827), // gray-900
                                        height: 1.25,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Buscando: "${_truncateText(widget.searchText, 30)}"',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w400,
                                        color: Color(0xFF6B7280), // gray-500
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (!isMobile)
                                IconButton(
                                  onPressed: widget.onClose,
                                  icon: const Icon(
                                    Icons.close,
                                    size: 20,
                                    color: Color(0xFF6B7280), // gray-500
                                  ),
                                  style: IconButton.styleFrom(
                                    shape: const CircleBorder(),
                                    backgroundColor: Colors.transparent,
                                  ),
                                ),
                            ],
                          ),
                        ),

                        // Opciones
                        Padding(
                          padding: EdgeInsets.fromLTRB(
                            16,
                            16,
                            16,
                            isMobile ? 96 : 16,
                          ),
                          child: Column(
                            children: [
                              // Opción 1: Búsqueda Clásica (siempre activa)
                              _buildClassicSearchOption(context),
                              const SizedBox(height: 10),

                              // Opción 2: Búsqueda Inteligente (bloqueada si es invitado)
                              _buildSmartSearchOption(context),
                              const SizedBox(height: 10),

                              // Opción 3: Análisis de Venta (bloqueada si es invitado)
                              _buildSalesAnalysisOption(context),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  String _truncateText(String text, int maxLength) {
    if (text.length <= maxLength) return text;
    return '${text.substring(0, maxLength)}...';
  }

  /// OPCIÓN 1: BÚSQUEDA CLÁSICA (ACTIVA)
  Widget _buildClassicSearchOption(BuildContext context) {
    return _SearchOption(
      onTap: widget.onClassicSearch,
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFF5F3FF), Color(0xFFEDE9FE)], // primary-50 to primary-100
      ),
      hoverGradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFEDE9FE), Color(0xFFE9D5FF)], // primary-100 to primary-200
      ),
      borderColor: const Color(0xFFDDD6FE), // primary-200
      hoverBorderColor: const Color(0xFFC4B5FD), // primary-400
      icon: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF667EEA), Color(0xFF667EEA)], // primary-600
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(
          Icons.search,
          size: 24,
          color: Colors.white,
        ),
      ),
      title: 'Búsqueda Clásica',
      description: 'Resultados directos y rápidos de todas las plataformas',
      badges: [
        _Badge(
          icon: Icons.access_time,
          label: 'Rápido',
          color: const Color(0xFF7C3AED), // primary-700
        ),
        _Badge(
          icon: Icons.check_circle,
          label: 'Gratis',
          color: const Color(0xFF15803D), // green-700
        ),
      ],
      arrowColor: const Color(0xFF667EEA), // primary-600
      isBlocked: false,
    );
  }

  /// OPCIÓN 2: BÚSQUEDA INTELIGENTE (BLOQUEADA si invitado)
  Widget _buildSmartSearchOption(BuildContext context) {
    return _SearchOption(
      onTap: widget.onSmartSearch,
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFFAF5FF), Color(0xFFF5F3FF)], // purple-50 to purple-100
      ),
      hoverGradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFF5F3FF), Color(0xFFEDE9FE)], // purple-100 to purple-200
      ),
      borderColor: const Color(0xFFE9D5FF), // purple-200
      hoverBorderColor: const Color(0xFFC084FC), // purple-400
      icon: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFA855F7), Color(0xFF9333EA)], // purple-500 to purple-600
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(
          Icons.flash_on,
          size: 24,
          color: Colors.white,
        ),
      ),
      title: 'Búsqueda Inteligente',
      titleSuffix: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF9333EA), Color(0xFFDB2777)], // purple-600 to pink-600
          ),
          borderRadius: BorderRadius.circular(9999),
        ),
        child: const Text(
          'IA',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
      ),
      description:
          'Filtrando de forma inteligente los anuncios para ofrecer resultados de calidad (sin anuncios gancho, accesorios o productos relacionados)',
      descriptionFontSize: 11,
      badges: [
        _Badge(
          icon: Icons.lightbulb,
          label: 'Avanzado',
          color: const Color(0xFF7C3AED), // purple-700
        ),
        if (!widget.isGuestMode)
          _Badge(
            icon: Icons.check_circle,
            label: 'Premium',
            color: const Color(0xFF15803D), // green-700
          ),
      ],
      arrowColor: const Color(0xFF9333EA), // purple-600
      isBlocked: widget.isGuestMode,
      showShimmer: true,
    );
  }

  /// OPCIÓN 3: ANÁLISIS DE VENTA (BLOQUEADA si invitado)
  Widget _buildSalesAnalysisOption(BuildContext context) {
    return _SearchOption(
      onTap: widget.onSalesAnalysis,
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFF0FDF4), Color(0xFFD1FAE5)], // green-50 to emerald-100
      ),
      hoverGradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFD1FAE5), Color(0xFFA7F3D0)], // green-100 to emerald-200
      ),
      borderColor: const Color(0xFFBBF7D0), // green-200
      hoverBorderColor: const Color(0xFF4ADE80), // green-400
      icon: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF10B981), Color(0xFF059669)], // green-500 to emerald-600
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(
          Icons.attach_money,
          size: 24,
          color: Colors.white,
        ),
      ),
      title: 'Análisis de Venta',
      description: 'Descubre el mejor precio para vender tu producto',
      badges: [
        _Badge(
          icon: Icons.trending_up,
          label: 'Análisis',
          color: const Color(0xFF15803D), // green-700
        ),
        if (!widget.isGuestMode)
          _Badge(
            icon: Icons.star,
            label: 'Premium',
            color: const Color(0xFFD97706), // amber-700
          ),
      ],
      arrowColor: const Color(0xFF10B981), // green-600
      isBlocked: widget.isGuestMode,
    );
  }
}

/// Widget individual de opción de búsqueda
class _SearchOption extends StatefulWidget {
  final VoidCallback onTap;
  final LinearGradient gradient;
  final LinearGradient hoverGradient;
  final Color borderColor;
  final Color hoverBorderColor;
  final Widget icon;
  final String title;
  final Widget? titleSuffix;
  final String description;
  final double? descriptionFontSize;
  final List<_Badge> badges;
  final Color arrowColor;
  final bool isBlocked;
  final bool showShimmer;

  const _SearchOption({
    required this.onTap,
    required this.gradient,
    required this.hoverGradient,
    required this.borderColor,
    required this.hoverBorderColor,
    required this.icon,
    required this.title,
    this.titleSuffix,
    required this.description,
    this.descriptionFontSize,
    required this.badges,
    required this.arrowColor,
    required this.isBlocked,
    this.showShimmer = false,
  });

  @override
  State<_SearchOption> createState() => _SearchOptionState();
}

class _SearchOptionState extends State<_SearchOption> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) {
        if (!widget.isBlocked) {
          setState(() => _isHovered = true);
        }
      },
      onExit: (_) {
        if (!widget.isBlocked) {
          setState(() => _isHovered = false);
        }
      },
      cursor: widget.isBlocked ? SystemMouseCursors.forbidden : SystemMouseCursors.click,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.ease,
        transform: Matrix4.identity()..scaleByDouble(_isHovered ? 1.01 : 1.0, _isHovered ? 1.01 : 1.0, 1.0, 1.0),
        child: Opacity(
          opacity: widget.isBlocked ? 0.6 : 1.0,
          child: GestureDetector(
            onTap: widget.onTap,
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: _isHovered ? widget.hoverGradient : widget.gradient,
                border: Border.all(
                  color: _isHovered ? widget.hoverBorderColor : widget.borderColor,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: _isHovered
                    ? [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 15,
                          offset: const Offset(0, 10),
                        ),
                      ]
                    : null,
              ),
              child: Stack(
                children: [
                  // Efecto shimmer (solo para opción 2)
                  if (widget.showShimmer) const _ShimmerEffect(),

                  // Contenido
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Icono
                      widget.icon,
                      const SizedBox(width: 12),

                      // Contenido de texto
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Título
                            Row(
                              children: [
                                Text(
                                  widget.title,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF111827), // gray-900
                                    height: 1.25,
                                  ),
                                ),
                                if (widget.titleSuffix != null) ...[
                                  const SizedBox(width: 6),
                                  widget.titleSuffix!,
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),

                            // Descripción
                            Text(
                              widget.description,
                              style: TextStyle(
                                fontSize: widget.descriptionFontSize ?? 12,
                                fontWeight: FontWeight.w400,
                                color: const Color(0xFF4B5563), // gray-600
                                height: 1.375,
                              ),
                            ),
                            const SizedBox(height: 6),

                            // Badges
                            Wrap(
                              spacing: 6,
                              runSpacing: 6,
                              children: widget.badges,
                            ),
                          ],
                        ),
                      ),

                      // Flecha
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        transform: Matrix4.identity()..translateByDouble(_isHovered ? 2.0 : 0.0, 0.0, 0.0, 1.0),
                        child: Icon(
                          Icons.chevron_right,
                          size: 20,
                          color: widget.arrowColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Badge individual
class _Badge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _Badge({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(9999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 10, color: color),
          const SizedBox(width: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

/// Animación de entrada slideUp
class _SlideUpAnimation extends StatefulWidget {
  final Widget child;

  const _SlideUpAnimation({required this.child});

  @override
  State<_SlideUpAnimation> createState() => _SlideUpAnimationState();
}

class _SlideUpAnimationState extends State<_SlideUpAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 100),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Cubic(0.32, 0.72, 0, 1), // cubic-bezier(0.32, 0.72, 0, 1)
      ),
    );

    _fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Cubic(0.32, 0.72, 0, 1),
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
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: widget.child,
          ),
        );
      },
    );
  }
}

/// Efecto shimmer para la opción 2
class _ShimmerEffect extends StatefulWidget {
  const _ShimmerEffect();

  @override
  State<_ShimmerEffect> createState() => _ShimmerEffectState();
}

class _ShimmerEffectState extends State<_ShimmerEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();

    _animation = Tween<double>(
      begin: -1,
      end: 1,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Transform.translate(
              offset: Offset(_animation.value * MediaQuery.of(context).size.width, 0),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.5,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      Colors.transparent,
                      Colors.white.withValues(alpha: 0.3),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

