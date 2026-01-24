// Invoices Tab Widget
//
// Shows user's invoice history with download links.
// Part of the Profile screen tabs.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/api/bff_api_client.dart';
import '../../../../core/api/payment_api_extensions.dart';

class InvoicesTab extends StatefulWidget {
  const InvoicesTab({super.key});

  @override
  State<InvoicesTab> createState() => _InvoicesTabState();
}

class _InvoicesTabState extends State<InvoicesTab> {
  List<Map<String, dynamic>> _invoices = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();
      _invoices = await apiClient.listInvoices();
    } catch (e) {
      setState(() {
        _error = 'Error al cargar facturas: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _downloadInvoice(String invoicePdf) async {
    if (invoicePdf.isEmpty) return;
    
    final uri = Uri.parse(invoicePdf);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error'),
            ElevatedButton(
              onPressed: _loadInvoices,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_invoices.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text('No hay facturas'),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _invoices.length,
      itemBuilder: (context, index) {
        final invoice = _invoices[index];
        final amount = invoice['amount'] as int? ?? 0;
        final status = invoice['status'] as String? ?? 'unknown';
        final created = invoice['created'] as int? ?? 0;
        final invoicePdf = invoice['invoice_pdf'] as String?;

        return Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: status == 'paid' ? Colors.green : Colors.grey,
              child: Icon(
                status == 'paid' ? Icons.check : Icons.pending,
                color: Colors.white,
              ),
            ),
            title: Text('Factura ${invoice['id']}'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('€${(amount / 100).toStringAsFixed(2)}'),
                Text(
                  DateFormat('dd/MM/yyyy').format(
                    DateTime.fromMillisecondsSinceEpoch(created * 1000),
                  ),
                ),
                Text('Estado: $status'),
              ],
            ),
            trailing: invoicePdf != null && invoicePdf.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.download),
                    onPressed: () => _downloadInvoice(invoicePdf),
                    tooltip: 'Descargar PDF',
                  )
                : null,
          ),
        );
      },
    );
  }
}

