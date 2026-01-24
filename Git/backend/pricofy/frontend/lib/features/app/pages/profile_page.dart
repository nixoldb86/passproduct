// Profile Page
//
// View and edit user profile information with tabs:
// - Profile: Personal data
// - Wallet: Balance and transactions
// - Subscription: Active subscription and usage
// - Invoices: Invoice history
// Layout (navbar + sidebar) provided by AppLayout shell.
// Requires authentication.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../config/theme.dart';
import '../../../core/providers/auth_provider.dart' as app;
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/models/user.dart' as app_models;
import '../widgets/profile/wallet_tab.dart';
import '../widgets/profile/subscription_tab.dart';
import '../widgets/profile/invoices_tab.dart';

/// Profile page content - layout provided by AppLayout shell
class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  late final BffApiClient _apiClient;
  late final TabController _tabController;
  app_models.User? _profile;
  bool _loading = false;
  bool _loadingProfile = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _apiClient = context.read<BffApiClient>();
    _loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _loadingProfile = true);

    try {
      final profile = await _apiClient.getProfile();
      setState(() {
        _profile = profile;
        _firstNameController.text = profile.firstName ?? '';
        _lastNameController.text = profile.lastName ?? '';
        _phoneController.text = profile.phone ?? '';
        _loadingProfile = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading profile: $e'), backgroundColor: Colors.red),
        );
      }
      setState(() => _loadingProfile = false);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);

    try {
      await _apiClient.updateProfile(
        firstName: _firstNameController.text.trim(),
        lastName: _lastNameController.text.trim(),
        phone: _phoneController.text.trim(),
      );

      await _loadProfile();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.l10n.profileUpdatedSuccess), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating profile: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<app.AuthProvider>();
    final l10n = context.l10n;
    final user = authProvider.user;

    // Content only - layout provided by AppLayout shell
    if (user == null) {
      return const Center(child: Text('User not authenticated'));
    }

    if (_loadingProfile || _profile == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        // User header
        _buildUserHeader(authProvider, l10n),

        // Tabs
        Container(
          color: Colors.white,
          child: TabBar(
            controller: _tabController,
            labelColor: AppTheme.primary600,
            unselectedLabelColor: AppTheme.gray600,
            indicatorColor: AppTheme.primary600,
            tabs: [
              Tab(text: l10n.profileData),
              Tab(text: l10n.profileWallet),
              Tab(text: l10n.profileSubscription),
              Tab(text: l10n.profileInvoices),
            ],
          ),
        ),

        // Tab views
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildProfileTab(l10n),
              const WalletTab(),
              const SubscriptionTab(),
              const InvoicesTab(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUserHeader(app.AuthProvider authProvider, dynamic l10n) {
    return Container(
      padding: const EdgeInsets.all(24),
      color: Colors.white,
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: const Color(0xFF667eea),
            child: Text(
              _profile!.email.isNotEmpty ? _profile!.email.substring(0, 1).toUpperCase() : 'U',
              style: const TextStyle(fontSize: 40, color: Colors.white),
            ),
          ),
          const SizedBox(height: 8),
          Text(_profile!.email, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          if (authProvider.isAdmin)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.purple.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  l10n.profileAdministrator,
                  style: TextStyle(fontSize: 12, color: Colors.purple.shade900, fontWeight: FontWeight.w600),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProfileTab(dynamic l10n) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 800),
          width: double.infinity,
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _firstNameController,
                  decoration: InputDecoration(labelText: l10n.profileFirstName, border: const OutlineInputBorder()),
                  validator: (value) => (value == null || value.isEmpty) ? l10n.commonFieldRequired : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _lastNameController,
                  decoration: InputDecoration(labelText: l10n.profileLastName, border: const OutlineInputBorder()),
                  validator: (value) => (value == null || value.isEmpty) ? l10n.commonFieldRequired : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: l10n.profilePhone, border: const OutlineInputBorder()),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loading ? null : _handleSave,
                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: _loading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                        )
                      : Text(l10n.profileSaveChanges),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
