// Buyers Grid Widget
//
// Displays grid of buyer listings (compradores).
// Each card shows: image, title, price, location, distance.
// Click opens modal with full details.

import 'package:flutter/material.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../core/services/geocoding_service.dart';
import '../../../../core/models/coordinates.dart';
import '../../models/evaluation_detail.dart';
import 'buyer_card.dart';
import 'buyer_detail_modal.dart';

class BuyersGrid extends StatelessWidget {
  final List<Comprador> compradores;
  final Coordinates? userCoords;
  final GeocodingService geocodingService;

  const BuyersGrid({
    super.key,
    required this.compradores,
    required this.userCoords,
    required this.geocodingService,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    if (compradores.isEmpty) {
      return Card(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.search_off, size: 64, color: Colors.grey[400]),
              SizedBox(height: 16),
              Text(
                l10n.dashboardNoResultsWithFilters,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.evaluationListingsFound,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            Chip(
              label: Text(
                '${compradores.length}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              backgroundColor: Colors.blue,
            ),
          ],
        ),
        SizedBox(height: 16),

        // Grid
        LayoutBuilder(
          builder: (context, constraints) {
            // Responsive columns
            int crossAxisCount;
            if (constraints.maxWidth < 640) {
              crossAxisCount = 1; // Mobile: 1 column
            } else if (constraints.maxWidth < 1024) {
              crossAxisCount = 2; // Tablet: 2 columns
            } else if (constraints.maxWidth < 1280) {
              crossAxisCount = 3; // Desktop: 3 columns
            } else {
              crossAxisCount = 4; // Widescreen: 4 columns
            }

            return GridView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.75, // Slightly taller cards
              ),
              itemCount: compradores.length,
              itemBuilder: (context, index) {
                final comprador = compradores[index];
                return BuyerCard(
                  comprador: comprador,
                  onTap: () => _showDetailModal(context, comprador),
                );
              },
            );
          },
        ),
      ],
    );
  }

  void _showDetailModal(BuildContext context, Comprador comprador) {
    showDialog(
      context: context,
      builder: (context) => BuyerDetailModal(comprador: comprador),
    );
  }
}

