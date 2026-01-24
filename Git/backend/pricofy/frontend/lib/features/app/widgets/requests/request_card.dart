// Request Card Widget
//
// Card for displaying user's evaluation requests in the dashboard.
// Shows: product info, action badge, favorite icon, location and date.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/models/request.dart';
import '../../../../core/services/favorites_service.dart';
import '../../../../config/theme.dart';

class RequestCard extends StatefulWidget {
  final Request request;

  const RequestCard({
    super.key,
    required this.request,
  });

  @override
  State<RequestCard> createState() => _RequestCardState();
}

class _RequestCardState extends State<RequestCard> {
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    _loadFavoriteStatus();
  }

  void _loadFavoriteStatus() {
    final favoritesService = context.read<FavoritesService>();
    setState(() {
      _isFavorite = favoritesService.isFavorite(widget.request.id);
    });
  }

  Future<void> _toggleFavorite() async {
    final authProvider = context.read<AuthProvider>();

    // Check if authenticated
    if (!authProvider.isAuthenticated) {
      _showPremiumDialog(context);
      return;
    }

    final favoritesService = context.read<FavoritesService>();
    final newStatus = await favoritesService.toggleFavorite(widget.request.id);
    setState(() {
      _isFavorite = newStatus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final request = widget.request;

    return Card(
      elevation: 2,
      margin: EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => context.go('/evaluation/${request.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  // Product icon
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppTheme.primary600.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        request.tipoProducto[0].toUpperCase(),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary600,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 12),

                  // Title and metadata
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          request.modeloMarca,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        SizedBox(height: 4),
                        Text(
                          '${request.tipoProducto} • ${request.estado}',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Action badge + favorite
                  Column(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: request.accion.contains('vender')
                              ? Colors.green[50]
                              : Colors.blue[50],
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              request.accion.contains('vender')
                                  ? Icons.sell
                                  : Icons.shopping_cart,
                              size: 14,
                              color: request.accion.contains('vender')
                                  ? Colors.green[700]
                                  : Colors.blue[700],
                            ),
                            SizedBox(width: 4),
                            Text(
                              request.accion.contains('vender')
                                  ? l10n.commonSell
                                  : l10n.commonBuy,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: request.accion.contains('vender')
                                    ? Colors.green[700]
                                    : Colors.blue[700],
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 8),
                      Stack(
                        children: [
                          IconButton(
                            onPressed: _toggleFavorite,
                            icon: Icon(
                              _isFavorite ? Icons.favorite : Icons.favorite_border,
                              color: _isFavorite ? Colors.red : Colors.grey[400],
                            ),
                            iconSize: 20,
                            padding: EdgeInsets.zero,
                            constraints: BoxConstraints(),
                            tooltip: context.read<AuthProvider>().isAuthenticated
                              ? 'Toggle favorite'
                              : 'Sign up to save favorites',
                          ),
                          if (!context.read<AuthProvider>().isAuthenticated)
                            Positioned(
                              right: 0,
                              top: 0,
                              child: Container(
                                padding: const EdgeInsets.all(2),
                                decoration: BoxDecoration(
                              color: AppTheme.primary600,
                              shape: BoxShape.circle,
                                ),
                                child: Icon(Icons.lock, size: 8, color: Colors.white),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 12),

              // Location and date
              Row(
                children: [
                  Icon(Icons.location_on_outlined, size: 14, color: Colors.grey[600]),
                  SizedBox(width: 4),
                  Text(
                    '${request.ciudad}, ${request.pais}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                  SizedBox(width: 16),
                  Icon(Icons.calendar_today, size: 14, color: Colors.grey[600]),
                  SizedBox(width: 4),
                  Text(
                    DateFormat('dd/MM/yyyy').format(DateTime.parse(request.createdAt)),
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showPremiumDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.lock, color: AppTheme.primary600),
            const SizedBox(width: 8),
            const Text('Premium Feature'),
          ],
        ),
        content: const Text(
          'Sign up for free to save favorites and access premium features!',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Maybe Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Navigate to login/signup
              context.go('/login');
            },
            child: const Text('Sign Up Free'),
          ),
        ],
      ),
    );
  }
}

// Keep backward compatibility with EvaluationCard name
typedef EvaluationCard = RequestCard;
