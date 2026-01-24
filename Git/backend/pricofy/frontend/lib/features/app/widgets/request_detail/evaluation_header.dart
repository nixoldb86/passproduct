// Evaluation Header Widget
//
// Displays evaluation stats and metadata.
// Shows: total ads, platforms consulted, date, location.

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../models/evaluation_detail.dart';

class EvaluationHeader extends StatelessWidget {
  final EvaluationDetail evaluation;

  const EvaluationHeader({
    super.key,
    required this.evaluation,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final scraping = evaluation.scraping;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Metadata row
        Wrap(
          spacing: 16,
          runSpacing: 8,
          children: [
            _buildMetaChip(
              icon: Icons.location_on_outlined,
              label: evaluation.codigoPostal != null
                  ? '${evaluation.ciudad} (${evaluation.codigoPostal})'
                  : evaluation.ciudad,
            ),
            _buildMetaChip(
              icon: Icons.calendar_today,
              label: DateFormat('dd/MM/yyyy').format(evaluation.fecha),
            ),
            _buildMetaChip(
              icon: Icons.category_outlined,
              label: evaluation.categoria,
            ),
          ],
        ),
        SizedBox(height: 16),

        // Stats cards
        LayoutBuilder(
          builder: (context, constraints) {
            // Responsive: 2 columns on mobile, 4 on tablet+
            final crossAxisCount = constraints.maxWidth < 640 ? 2 : 4;
            
            return GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.5,
              children: [
                _buildStatCard(
                  context,
                  icon: Icons.search,
                  label: l10n.evaluationFound,
                  value: scraping.totalEncontrados.toString(),
                  color: Colors.blue,
                ),
                _buildStatCard(
                  context,
                  icon: Icons.filter_list,
                  label: l10n.evaluationFiltered,
                  value: scraping.totalFiltrados.toString(),
                  color: Colors.green,
                ),
                _buildStatCard(
                  context,
                  icon: Icons.cancel_outlined,
                  label: l10n.evaluationDiscarded,
                  value: scraping.totalDescartados.toString(),
                  color: Colors.orange,
                ),
                _buildStatCard(
                  context,
                  icon: Icons.apps,
                  label: l10n.evaluationPlatforms,
                  value: scraping.plataformasConsultadas.length.toString(),
                  color: Colors.purple,
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildMetaChip({required IconData icon, required String label}) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(
        label,
        style: TextStyle(fontSize: 12),
      ),
      backgroundColor: Colors.grey[100],
      padding: EdgeInsets.symmetric(horizontal: 4),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

