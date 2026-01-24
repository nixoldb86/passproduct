// Wallet Tab Widget
//
// Shows user balance, add funds button, and transaction history.
// Part of the Profile screen tabs.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/providers/wallet_provider.dart';
import 'add_funds_sheet.dart';

class WalletTab extends StatefulWidget {
  const WalletTab({super.key});

  @override
  State<WalletTab> createState() => _WalletTabState();
}

class _WalletTabState extends State<WalletTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WalletProvider>().loadBalance();
      context.read<WalletProvider>().loadTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<WalletProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.balance == null) {
          return const Center(child: CircularProgressIndicator());
        }

        if (provider.error != null && provider.balance == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Error: ${provider.error}'),
                ElevatedButton(
                  onPressed: () => provider.loadBalance(),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          );
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Balance Card
              if (provider.balance != null)
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(
                          'Saldo Disponible',
                          style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          provider.balance!.formatted,
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Actualizado: ${_formatDateTime(provider.balance!.updatedAt)}',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 16),

              // Add Funds Button
              ElevatedButton.icon(
                onPressed: () => _showAddFundsSheet(context),
                icon: const Icon(Icons.add),
                label: const Text('Añadir Fondos'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
              ),

              const SizedBox(height: 24),

              // Transactions List
              Text(
                'Historial',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              if (provider.transactions.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No hay transacciones'),
                )
              else
                ...provider.transactions.map((tx) => ListTile(
                      leading: CircleAvatar(
                        backgroundColor: tx.isCredit ? Colors.green : Colors.red,
                        child: Icon(
                          tx.isCredit ? Icons.add : Icons.remove,
                          color: Colors.white,
                        ),
                      ),
                      title: Text(tx.description),
                      subtitle: Text(_formatDateTime(tx.createdAt)),
                      trailing: Text(
                        tx.formatted,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: tx.isCredit ? Colors.green : Colors.red,
                        ),
                      ),
                    )),
            ],
          ),
        );
      },
    );
  }

  void _showAddFundsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const AddFundsSheet(),
    );
  }

  String _formatDateTime(DateTime dt) {
    return DateFormat('dd/MM/yyyy HH:mm').format(dt);
  }
}

