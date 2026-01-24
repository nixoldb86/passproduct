// Add Funds Sheet
//
// Bottom sheet for adding funds to wallet with predefined amounts.
// Integrates with Stripe payment flow.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/providers/wallet_provider.dart';

class AddFundsSheet extends StatefulWidget {
  const AddFundsSheet({super.key});

  @override
  State<AddFundsSheet> createState() => _AddFundsSheetState();
}

class _AddFundsSheetState extends State<AddFundsSheet> {
  int _selectedAmount = 2000; // €20
  final List<int> _quickAmounts = [1000, 2000, 5000, 10000]; // €10, €20, €50, €100

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Añadir Fondos',
            style: Theme.of(context).textTheme.headlineSmall,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          const Text('Selecciona cantidad:'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _quickAmounts.map((amount) {
              return ChoiceChip(
                label: Text('€${amount ~/ 100}'),
                selected: _selectedAmount == amount,
                onSelected: (selected) {
                  if (selected) {
                    setState(() => _selectedAmount = amount);
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => _handleAddFunds(context),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
            ),
            child: Text('Añadir €${_selectedAmount ~/ 100}'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<void> _handleAddFunds(BuildContext context) async {
    final provider = context.read<WalletProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(child: CircularProgressIndicator()),
    );

    final success = await provider.addFunds(_selectedAmount);

    if (!mounted) return;
    navigator.pop(); // Close loading

    if (success) {
      navigator.pop(); // Close sheet
      messenger.showSnackBar(
        const SnackBar(content: Text('Fondos añadidos correctamente')),
      );
    } else {
      messenger.showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Error al añadir fondos'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}

