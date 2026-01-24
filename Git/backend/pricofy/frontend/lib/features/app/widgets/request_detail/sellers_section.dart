// Sellers Section Widget
//
// Displays recommended selling prices (only for sell actions).
// Shows: minimum, ideal, and fast sale prices with platform suggestions.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../config/theme.dart';
import '../../models/evaluation_detail.dart';

class SellersSection extends StatelessWidget {
  final JsonVendedores vendedores;

  const SellersSection({
    super.key,
    required this.vendedores,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    // If no vendedores, show nothing
    if (vendedores.vendedores == null || vendedores.vendedores!.isEmpty) {
      return SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Text(
          l10n.evaluationRecommendedSellingPrices,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 16),

        // Description (if available)
        if (vendedores.descripcionAnuncio != null && vendedores.descripcionAnuncio!.isNotEmpty) ...[
          Card(
            color: Colors.blue[50],
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.lightbulb_outline, color: AppTheme.primary600),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      vendedores.descripcionAnuncio!,
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[800],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),
        ],

        // Price cards
        LayoutBuilder(
          builder: (context, constraints) {
            // Responsive columns
            final crossAxisCount = constraints.maxWidth < 640 ? 1 : 3;

            return GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 1.2,
              children: [
                // Try to get each price type
                if (_getVendedor('minimo') != null)
                  _buildPriceCard(
                    context,
                    l10n.localeName,
                    vendedor: _getVendedor('minimo')!,
                    icon: Icons.trending_down,
                    color: Colors.green,
                  ),
                if (_getVendedor('ideal') != null)
                  _buildPriceCard(
                    context,
                    l10n.localeName,
                    vendedor: _getVendedor('ideal')!,
                    icon: Icons.star,
                    color: AppTheme.primary600,
                  ),
                if (_getVendedor('rapido') != null)
                  _buildPriceCard(
                    context,
                    l10n.localeName,
                    vendedor: _getVendedor('rapido')!,
                    icon: Icons.flash_on,
                    color: Colors.orange,
                  ),
              ],
            );
          },
        ),
      ],
    );
  }

  Vendedor? _getVendedor(String tipo) {
    return vendedores.vendedores?.firstWhere(
      (v) => v.tipoPrecio == tipo,
      orElse: () => vendedores.vendedores!.first,
    );
  }

  Widget _buildPriceCard(
    BuildContext context,
    String locale,
    {
      required Vendedor vendedor,
      required IconData icon,
      required Color color,
    }
  ) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: color.withValues(alpha: 0.3), width: 2),
      ),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 32),
            ),
            SizedBox(height: 12),

            // Label
            Text(
              vendedor.getLabel(locale),
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 8),

            // Price
            Text(
              '${vendedor.precioEur.round()}€',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            SizedBox(height: 12),

            // Platform suggestions
            if (vendedor.plataformaSugerida.isNotEmpty)
              Wrap(
                spacing: 4,
                alignment: WrapAlignment.center,
                children: vendedor.plataformaSugerida.map((platform) {
                  return Chip(
                    label: Text(
                      platform,
                      style: TextStyle(fontSize: 10),
                    ),
                    padding: EdgeInsets.zero,
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}

