// Subscription Tab Widget
//
// Shows active subscription details, usage progress, and plan management.
// Part of the Profile screen tabs.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../../../core/providers/subscription_provider.dart';
import 'subscription_plans_sheet.dart';

class SubscriptionTab extends StatefulWidget {
  const SubscriptionTab({super.key});

  @override
  State<SubscriptionTab> createState() => _SubscriptionTabState();
}

class _SubscriptionTabState extends State<SubscriptionTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SubscriptionProvider>().loadSubscription();
      context.read<SubscriptionProvider>().loadUsage();
      context.read<SubscriptionProvider>().loadPricing();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SubscriptionProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading && provider.subscription == null) {
          return const Center(child: CircularProgressIndicator());
        }

        final subscription = provider.subscription;
        final usage = provider.usage;

        if (subscription == null || !subscription.isActive) {
          return _buildNoSubscriptionView(context);
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Current Plan Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Text(
                        'Plan Actual',
                        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        subscription.tierName,
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text('${subscription.amountCents ~/ 100}€/mes'),
                      const SizedBox(height: 16),
                      // Usage progress
                      if (usage != null && usage.limit != null) ...[
                        Text('Evaluaciones este mes: ${usage.used} / ${usage.limit}'),
                        const SizedBox(height: 8),
                        LinearProgressIndicator(
                          value: usage.used / usage.limit!,
                          backgroundColor: Colors.grey[300],
                          valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
                        ),
                      ] else ...[
                        const Text('Evaluaciones ilimitadas'),
                      ],
                      const SizedBox(height: 16),
                      Text(
                        'Renueva: ${DateFormat('dd/MM/yyyy').format(subscription.currentPeriodEnd)}',
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Actions
              ElevatedButton(
                onPressed: () => _showPlansSheet(context),
                child: const Text('Cambiar Plan'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => _showCancelDialog(context, subscription),
                child: const Text(
                  'Cancelar Suscripción',
                  style: TextStyle(color: Colors.red),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNoSubscriptionView(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.workspace_premium, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          const Text('No tienes ninguna suscripción activa'),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => _showPlansSheet(context),
            child: const Text('Ver Planes'),
          ),
        ],
      ),
    );
  }

  void _showPlansSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => const SubscriptionPlansSheet(),
    );
  }

  void _showCancelDialog(BuildContext context, subscription) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar Suscripción'),
        content: const Text('¿Estás seguro de que quieres cancelar tu suscripción?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              final provider = context.read<SubscriptionProvider>();
              final success = await provider.cancelSubscription();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success
                        ? 'Suscripción cancelada'
                        : 'Error al cancelar suscripción'),
                  ),
                );
              }
            },
            child: const Text('Sí, cancelar'),
          ),
        ],
      ),
    );
  }
}

