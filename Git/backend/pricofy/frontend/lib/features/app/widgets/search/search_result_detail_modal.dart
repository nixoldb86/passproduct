// Search Result Detail Modal Widget
//
// Full-screen modal with detailed listing information for search results.
// Shows: large image, title, price, product info chips, description, metadata, link to external listing.

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/extensions/l10n_extension.dart';
import '../../../../config/theme.dart';
import '../../../../shared/components/badges/platform_icon_with_flag.dart';
import '../../../../shared/components/images/network_image_widget.dart';
import '../../../../core/models/search_result.dart';
import '../../../../core/utils/country_flags.dart';

class SearchResultDetailModal extends StatelessWidget {
  final SearchResult result;

  const SearchResultDetailModal({
    super.key,
    required this.result,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.all(16),
      child: Container(
        constraints: BoxConstraints(maxWidth: 600, maxHeight: MediaQuery.of(context).size.height * 0.9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header with close button
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.grey[200]!)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      l10n.evaluationListingDetails,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close),
                    tooltip: l10n.commonClose,
                  ),
                ],
              ),
            ),

            // Content (scrollable)
            Flexible(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image - use NetworkImageWidget to bypass CORS issues on web
                    if (result.hasImage)
                      NetworkImageWidget(
                        imageUrl: result.imageUrl!,
                        width: double.infinity,
                        height: 300,
                        fit: BoxFit.cover,
                        borderRadius: BorderRadius.circular(12),
                        placeholder: (context) => Container(
                          height: 300,
                          color: Colors.grey[200],
                          child: Center(child: CircularProgressIndicator()),
                        ),
                        errorBuilder: (context, error) => Container(
                          height: 300,
                          color: Colors.grey[200],
                          child: Icon(Icons.broken_image, size: 64),
                        ),
                      ),
                    SizedBox(height: 16),

                    // Title + Platform icon with flag (in same row)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            result.title,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        PlatformIconWithFlag(
                          platform: result.platform,
                          countryCode: result.marketplaceCountry ?? result.countryCode,
                          size: 40,
                        ),
                      ],
                    ),
                    SizedBox(height: 12),

                    // Price label + Price
                    Text(
                      l10n.sortPrice,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    SizedBox(height: 4),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: AppTheme.primary600.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${result.price.toStringAsFixed(2)} €',
                        style: TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primary600,
                        ),
                      ),
                    ),
                    SizedBox(height: 16),

                    // Platform-specific fields (condition, brand, size, model, shipping)
                    if (result.hasCondition || result.hasBrand || result.hasSize || result.isShippable)
                      _buildProductInfoSection(context, l10n),

                    // Description
                    if (result.description != null && result.description!.isNotEmpty) ...[
                      SizedBox(height: 8),
                      Divider(),
                      SizedBox(height: 12),
                      Text(
                        l10n.evaluationDescription,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        result.description!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                          height: 1.5,
                        ),
                      ),
                    ],

                    // Metadata (location, distance, dates) - always show with "-" if no value
                    SizedBox(height: 12),
                    Divider(),
                    SizedBox(height: 12),
                    _buildMetadataRow(
                      icon: Icons.location_on_outlined,
                      label: l10n.evaluationLocation,
                      value: (result.location != null && result.location!.isNotEmpty)
                          ? result.location!
                          : '-',
                      countryCode: (result.location != null && result.location!.isNotEmpty)
                          ? result.countryCode
                          : null,
                    ),
                    _buildMetadataRow(
                      icon: Icons.navigation_outlined,
                      label: l10n.sortDistance,
                      value: result.hasDistance ? result.formattedDistance! : '-',
                    ),
                    _buildMetadataRow(
                      icon: Icons.schedule_outlined,
                      label: l10n.searchPublished,
                      value: result.publishedAt != null
                          ? _formatDate(result.publishedAt!, l10n)
                          : '-',
                    ),
                  ],
                ),
              ),
            ),

            // Footer with action button
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: Colors.grey[200]!)),
              ),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => _launchUrl(result.url),
                  icon: Icon(Icons.open_in_new),
                  label: Text(
                    l10n.evaluationViewFullListing,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary600,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(vertical: 16),
                    textStyle: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductInfoSection(BuildContext context, dynamic l10n) {
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Wrap(
        spacing: 12,
        runSpacing: 8,
        children: [
          if (result.isShippable)
            _buildInfoChip(
              icon: Icons.local_shipping_outlined,
              label: l10n.shippingWithShipping,
              color: Colors.teal,
            ),
          if (result.hasCondition)
            _buildInfoChip(
              icon: Icons.verified_outlined,
              label: result.conditionDisplayName,
              color: _getConditionColor(result.condition!),
            ),
          if (result.hasBrand)
            _buildInfoChip(
              icon: Icons.local_offer_outlined,
              label: result.brand!,
              color: Colors.blue,
            ),
          if (result.hasSize)
            _buildInfoChip(
              icon: Icons.straighten_outlined,
              label: result.size!,
              color: Colors.purple,
            ),
          if (result.model != null && result.model!.isNotEmpty)
            _buildInfoChip(
              icon: Icons.devices_outlined,
              label: result.model!,
              color: Colors.teal,
            ),
          if (result.hasCategory)
            _buildInfoChip(
              icon: Icons.category_outlined,
              label: result.category!,
              color: Colors.orange,
            ),
        ],
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Color _getConditionColor(String condition) {
    switch (condition) {
      case 'new':
        return Colors.green;
      case 'like_new':
        return Colors.teal;
      case 'good':
        return Colors.blue;
      case 'used':
        return Colors.orange;
      case 'acceptable':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Widget _buildMetadataRow({
    required IconData icon,
    required String label,
    required String value,
    String? countryCode,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey[600]),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                  ),
                ),
                SizedBox(height: 2),
                Row(
                  children: [
                    if (countryCode != null && countryCode.isNotEmpty) ...[
                      Text(
                        getCountryFlagEmoji(countryCode),
                        style: TextStyle(fontSize: 14),
                      ),
                      SizedBox(width: 6),
                    ],
                    Expanded(
                      child: Text(
                        value,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date, dynamic l10n) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) {
      return l10n.timeJustNow;
    } else if (difference.inMinutes < 60) {
      return l10n.timeMinutesAgo(difference.inMinutes);
    } else if (difference.inHours < 24) {
      return l10n.timeHoursAgo(difference.inHours);
    } else {
      return l10n.timeDaysAgo(difference.inDays);
    }
  }

  Future<void> _launchUrl(String url) async {
    try {
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (kDebugMode) print('❌ Cannot launch URL: $url');
      }
    } catch (e) {
      if (kDebugMode) print('❌ Error launching URL: $e');
    }
  }
}
