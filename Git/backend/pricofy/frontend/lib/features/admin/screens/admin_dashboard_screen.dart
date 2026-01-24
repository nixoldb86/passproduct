// Admin Dashboard Screen
//
// Shows:
// - All solicitudes (evaluations)
// - All contacts
// - All users (with management actions)
//
// Layout (navbar + sidebar) provided by AdminLayout shell.
// Requires admin authentication.

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/models/request.dart';
import '../../../core/models/contacto.dart';
import '../../../core/models/user.dart';
import '../../../config/theme.dart';

/// Admin dashboard content - layout provided by AdminLayout shell
class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  late final BffApiClient _apiClient;

  List<Request> _requests = [];
  List<Contacto> _contactos = [];
  List<User> _users = [];
  User? _editingUser;

  bool _loadingRequests = true;
  bool _loadingContactos = false;
  bool _loadingUsers = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _apiClient = context.read<BffApiClient>();
    _fetchRequests();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchRequests() async {
    setState(() => _loadingRequests = true);
    try {
      final data = await _apiClient.getAllSolicitudes();
      setState(() {
        _requests = data.map((json) => Request.fromJson(json as Map<String, dynamic>)).toList();
        _loadingRequests = false;
      });
    } catch (e) {
      setState(() => _loadingRequests = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _fetchContactos() async {
    setState(() => _loadingContactos = true);
    try {
      final data = await _apiClient.getAllContactos();
      setState(() {
        _contactos = data.map((json) => Contacto.fromJson(json as Map<String, dynamic>)).toList();
        _loadingContactos = false;
      });
    } catch (e) {
      setState(() => _loadingContactos = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _fetchUsers() async {
    setState(() => _loadingUsers = true);
    try {
      final data = await _apiClient.getAllUsers();
      setState(() {
        _users = data.map((json) => User.fromJson(json as Map<String, dynamic>)).toList();
        _loadingUsers = false;
      });
    } catch (e) {
      setState(() => _loadingUsers = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _deleteUser(String userId) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminConfirmDelete),
        content: Text(l10n.authLogoutConfirm),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(l10n.commonCancel)),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text(l10n.commonDelete),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _apiClient.deleteUser(userId);
        await _fetchUsers();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.adminUserDeleted), backgroundColor: Colors.green),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateString;
    }
  }

  Future<void> _showRequestDetails(Request req) async {
    final l10n = context.l10n;
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.evaluationRequestDetails),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDetailRow(l10n.formEmail, req.email),
              _buildDetailRow(l10n.evaluationProduct, req.modeloMarca),
              _buildDetailRow(l10n.evaluationType, req.tipoProducto),
              _buildDetailRow(l10n.evaluationCondition, req.estado),
              _buildDetailRow(l10n.formAction, req.accion),
              _buildDetailRow(l10n.evaluationLocation, '${req.ciudad}, ${req.pais}'),
              if (req.urgencia?.isNotEmpty == true) _buildDetailRow(l10n.evaluationUrgency, req.urgencia!),
              if (req.accesorios?.isNotEmpty == true) _buildDetailRow(l10n.evaluationAccessories, req.accesorios!),
              if (req.fotosUrls?.isNotEmpty == true) ...[
                const SizedBox(height: 16),
                Text('${l10n.evaluationPhotos} (${req.fotosUrls!.length}):', style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: req.fotosUrls!.map((url) => Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(url, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image_not_supported)),
                    ),
                  )).toList(),
                ),
              ],
            ],
          ),
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text(l10n.commonClose))],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.bold))),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Future<void> _toggleGroup(String userId, String email, String group, bool isInGroup) async {
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminChangeGroup),
        content: Text('$email - $group'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(l10n.commonCancel)),
          ElevatedButton(onPressed: () => Navigator.pop(context, true), child: Text(l10n.commonConfirm)),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _apiClient.updateUserGroup(userId, group: group);
        await _fetchUsers();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.adminChangeGroup), backgroundColor: Colors.green),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  Future<void> _showEditUserModal() async {
    if (_editingUser == null) return;

    final l10n = context.l10n;
    final firstNameController = TextEditingController(text: _editingUser!.firstName);
    final lastNameController = TextEditingController(text: _editingUser!.lastName);
    final phoneController = TextEditingController(text: _editingUser!.phone);
    final formKey = GlobalKey<FormState>();

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.adminEditUserProfile),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  initialValue: _editingUser!.email,
                  enabled: false,
                  decoration: InputDecoration(labelText: l10n.adminEmailReadOnly, filled: true, fillColor: Colors.grey[100]),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: firstNameController,
                  decoration: InputDecoration(labelText: l10n.profileFirstName, border: const OutlineInputBorder()),
                  validator: (value) => (value == null || value.trim().isEmpty) ? l10n.commonFieldRequired : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: lastNameController,
                  decoration: InputDecoration(labelText: l10n.profileLastName, border: const OutlineInputBorder()),
                  validator: (value) => (value == null || value.trim().isEmpty) ? l10n.commonFieldRequired : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(labelText: l10n.profilePhone, border: const OutlineInputBorder()),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _editingUser = null);
            },
            child: Text(l10n.commonCancel),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.pop(context);
                await _handleSaveUserProfile(firstNameController.text.trim(), lastNameController.text.trim(), phoneController.text.trim());
              }
            },
            child: Text(l10n.profileSaveChanges),
          ),
        ],
      ),
    );

    firstNameController.dispose();
    lastNameController.dispose();
    phoneController.dispose();
  }

  Future<void> _handleSaveUserProfile(String firstName, String lastName, String phone) async {
    if (_editingUser == null) return;

    final l10n = context.l10n;

    try {
      await _apiClient.updateAdminUserProfile(_editingUser!.userId, firstName: firstName, lastName: lastName, phone: phone.isEmpty ? null : phone);
      await _fetchUsers();
      setState(() => _editingUser = null);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.profileUpdatedSuccess), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      setState(() => _editingUser = null);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    // Content only - layout provided by AdminLayout shell
    return Column(
      children: [
        // Tabs Navigation
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppTheme.gray200)),
          ),
          child: TabBar(
            controller: _tabController,
            onTap: (index) {
              if (index == 1 && _contactos.isEmpty && !_loadingContactos) {
                _fetchContactos();
              } else if (index == 2 && _users.isEmpty && !_loadingUsers) {
                _fetchUsers();
              }
            },
            tabs: [
              Tab(text: l10n.adminRequests),
              Tab(text: l10n.adminContacts),
              Tab(text: l10n.adminUsers),
            ],
            labelColor: AppTheme.primary600,
            unselectedLabelColor: AppTheme.gray600,
            indicatorColor: AppTheme.primary600,
          ),
        ),

        // Tab Content
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildRequestsTab(l10n),
              _buildContactosTab(l10n),
              _buildUsersTab(l10n),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRequestsTab(dynamic l10n) {
    if (_loadingRequests) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _fetchRequests,
      child: _requests.isEmpty
          ? Center(child: Text(l10n.dashboardNoResultsFound))
          : ListView.builder(
              itemCount: _requests.length,
              itemBuilder: (context, index) {
                final req = _requests[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: InkWell(
                    onTap: () => _showRequestDetails(req),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                backgroundColor: const Color(0xFF667eea),
                                child: Text(req.email.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.white)),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(req.email, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                    Text(_formatDate(req.createdAt), style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                                  ],
                                ),
                              ),
                              Icon(
                                req.accion.contains('vender') ? Icons.sell : Icons.shopping_bag,
                                color: req.accion.contains('vender') ? Colors.green : Colors.blue,
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(req.modeloMarca, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                    Text('${req.tipoProducto} • ${req.estado}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                                  ],
                                ),
                              ),
                              if (req.fotosUrls?.isNotEmpty == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                                  child: Text('${req.fotosUrls!.length} ${l10n.evaluationPhotos}', style: const TextStyle(fontSize: 12, color: Colors.blue, fontWeight: FontWeight.w500)),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.location_on, size: 16, color: Colors.grey[500]),
                              const SizedBox(width: 4),
                              Text('${req.ciudad}, ${req.pais}', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: req.accion.contains('vender') ? Colors.green.withValues(alpha: 0.1) : Colors.blue.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  req.accion.contains('vender') ? l10n.commonSell : l10n.commonBuy,
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: req.accion.contains('vender') ? Colors.green : Colors.blue),
                                ),
                              ),
                            ],
                          ),
                          if (req.urgencia?.isNotEmpty == true) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.priority_high, size: 16, color: Colors.orange),
                                const SizedBox(width: 4),
                                Text('${l10n.evaluationUrgency}: ${req.urgencia!}', style: const TextStyle(fontSize: 12, color: Colors.orange, fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  Widget _buildContactosTab(dynamic l10n) {
    if (_loadingContactos) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _fetchContactos,
      child: _contactos.isEmpty
          ? Center(child: Text(l10n.dashboardNoResultsFound))
          : ListView.builder(
              itemCount: _contactos.length,
              itemBuilder: (context, index) {
                final contact = _contactos[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.person)),
                    title: Text(contact.nombre),
                    subtitle: Text('${contact.email}\n${contact.telefono}'),
                    isThreeLine: true,
                  ),
                );
              },
            ),
    );
  }

  Widget _buildUsersTab(dynamic l10n) {
    if (_loadingUsers) return const Center(child: CircularProgressIndicator());

    return RefreshIndicator(
      onRefresh: _fetchUsers,
      child: _users.isEmpty
          ? Center(child: Text(l10n.dashboardNoResultsFound))
          : ListView.builder(
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: user.groups.contains('admin') ? Colors.purple : Colors.blue,
                      child: Icon(user.groups.contains('admin') ? Icons.admin_panel_settings : Icons.person, color: Colors.white),
                    ),
                    title: Text(user.email),
                    subtitle: Text(user.groups.join(', '), style: TextStyle(color: user.groups.contains('admin') ? Colors.purple : Colors.grey)),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit),
                          color: Colors.blue,
                          onPressed: () {
                            setState(() => _editingUser = user);
                            WidgetsBinding.instance.addPostFrameCallback((_) => _showEditUserModal());
                          },
                          tooltip: l10n.profileEditProfile,
                        ),
                        IconButton(
                          icon: Icon(user.groups.contains('admin') ? Icons.admin_panel_settings : Icons.admin_panel_settings_outlined, color: user.groups.contains('admin') ? Colors.purple : Colors.grey),
                          onPressed: () => _toggleGroup(user.userId, user.email, 'admin', user.groups.contains('admin')),
                          tooltip: user.groups.contains('admin') ? l10n.adminRemoveAdmin : l10n.adminMakeAdmin,
                        ),
                        IconButton(
                          icon: Icon(user.groups.contains('user') ? Icons.person : Icons.person_outline, color: user.groups.contains('user') ? Colors.blue : Colors.grey),
                          onPressed: () => _toggleGroup(user.userId, user.email, 'user', user.groups.contains('user')),
                          tooltip: user.groups.contains('user') ? l10n.adminRemoveUser : l10n.adminMakeUser,
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _deleteUser(user.userId),
                          tooltip: l10n.adminDeleteUser,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
