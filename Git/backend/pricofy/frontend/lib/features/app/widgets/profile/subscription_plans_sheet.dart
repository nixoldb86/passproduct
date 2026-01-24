// Subscription Plans Sheet
//
// Bottom sheet showing available subscription plans.
// Allows user to select and subscribe to a plan.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../../core/providers/subscription_provider.dart';
import '../../../../core/models/pricing_plan.dart';

class SubscriptionPlansSheet extends StatefulWidget {
  const SubscriptionPlansSheet({super.key});

  @override
  State<SubscriptionPlansSheet> createState() => _SubscriptionPlansSheetState();
}

class _SubscriptionPlansSheetState extends State<SubscriptionPlansSheet> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SubscriptionProvider>().loadPricing();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<SubscriptionProvider>(
      builder: (context, provider, child) {
        if (provider.pricing == null) {
          return const SizedBox(
            height: 400,
            child: Center(child: CircularProgressIndicator()),
          );
        }

        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Elige tu Plan',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              ...provider.pricing!.plans.map((plan) => Card(
                    child: ListTile(
                      title: Text(
                        plan.name,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        '${plan.evaluations == null ? 'Ilimitado' : '${plan.evaluations} evaluaciones'}/mes',
                      ),
                      trailing: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '€${plan.priceCents ~/ 100}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Text('/mes', style: TextStyle(fontSize: 12)),
                        ],
                      ),
                      onTap: () => _subscribeToPlan(context, plan, provider),
                    ),
                  )),
            ],
          ),
        );
      },
    );
  }

  Future<void> _subscribeToPlan(
    BuildContext context,
    PricingPlan plan,
    SubscriptionProvider provider,
  ) async {
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar Suscripción'),
        content: Text('¿Suscribirse al plan ${plan.name} por €${plan.priceCents ~/ 100}/mes?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final success = await provider.createSubscription(plan.stripePriceId);

    if (!mounted) return;
    navigator.pop(); // Close sheet

    messenger.showSnackBar(
      SnackBar(
        content: Text(success
            ? '¡Suscripción activada!'
            : 'Error al activar suscripción'),
        backgroundColor: success ? Colors.green : Colors.red,
      ),
    );
  }
}

