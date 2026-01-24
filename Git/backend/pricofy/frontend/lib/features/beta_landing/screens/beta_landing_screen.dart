// Beta Landing Screen
//
// Waitlist registration page with gamification elements.
// Users can register, track their position, and earn points
// by completing tasks (follow, share story, invite friends).

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../../config/theme.dart';
import '../../../core/api/bff_api_client.dart';
import '../../../core/extensions/l10n_extension.dart';
import '../../../core/utils/error_translator.dart';
import '../../../layouts/components/navbar.dart';
import '../../../layouts/components/footer.dart';
import '../models/waitlist_user.dart';
import '../widgets/how_it_works_section.dart';
import '../widgets/registration_form.dart';
import '../widgets/user_status_section.dart';
import '../widgets/steps_progress_section.dart';

const int kMaxRealPositions = 3000;
const int kFirstRealPosition = 131;
const int kVirtualPositionBase = 5500;

class BetaLandingScreen extends StatefulWidget {
  final String? referralCode;

  const BetaLandingScreen({super.key, this.referralCode});

  @override
  State<BetaLandingScreen> createState() => _BetaLandingScreenState();
}

class _BetaLandingScreenState extends State<BetaLandingScreen> {
  WaitlistUser? _userStatus;
  bool _loading = false;
  bool _checking = false;
  String? _error;
  bool _success = false;
  String? _storedReferralCode;

  @override
  void initState() {
    super.initState();
    _storedReferralCode = widget.referralCode;
  }

  Future<void> _handleRegister(String email, String instagramUsername) async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();

      final body = <String, dynamic>{
        'email': email,
        'instagram_username': instagramUsername.replaceAll('@', ''),
      };

      if (_storedReferralCode != null && _storedReferralCode!.isNotEmpty) {
        body['referralCode'] = _storedReferralCode;
      }

      final response = await apiClient.post('/promo/register', data: body);

      // Success - response is already the data (Map<String, dynamic>)
      final data = response['data'] as Map<String, dynamic>?;
      if (data != null) {
        setState(() {
          _userStatus = WaitlistUser.fromRegisterResponse(
            data,
            instagramUsername.replaceAll('@', ''),
          );
          _success = true;
          _storedReferralCode = null;
        });

        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) {
            setState(() => _success = false);
          }
        });
      } else {
        setState(() {
          _error = response['error']?.toString() ?? response['message']?.toString() ?? 'Error desconocido';
        });
      }
    } on ApiException catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, e.code);
      });
    } catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, null);
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _handleCheckExistingUser(String email, String instagramUsername) async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();
      final response = await apiClient.get(
        '/promo/status',
        queryParameters: {'email': email},
      );

      // Success - response is already the data (Map<String, dynamic>)
      final data = response['data'] as Map<String, dynamic>?;
      if (data != null) {
        setState(() {
          _userStatus = WaitlistUser.fromJson(
            data,
            instagramUsername: instagramUsername.replaceAll('@', ''),
            virtualPositionBase: kVirtualPositionBase,
          );
        });
      } else {
        setState(() {
          _error = response['error']?.toString() ?? response['message']?.toString() ?? 'Error';
        });
      }
    } on ApiException catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, e.code);
      });
    } catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, null);
      });
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _handleCheckStatus() async {
    if (_userStatus == null) return;

    setState(() {
      _checking = true;
      _error = null;
    });

    try {
      final apiClient = context.read<BffApiClient>();
      final response = await apiClient.get(
        '/promo/status',
        queryParameters: {'email': _userStatus!.email},
      );

      // Success - response is already the data (Map<String, dynamic>)
      final data = response['data'] as Map<String, dynamic>?;
      if (data != null) {
        setState(() {
          _userStatus = WaitlistUser.fromJson(
            data,
            instagramUsername: _userStatus!.instagramUsername,
            virtualPositionBase: kVirtualPositionBase,
          );
        });
      } else {
        setState(() {
          _error = response['error']?.toString() ?? response['message']?.toString() ?? 'Error';
        });
      }
    } on ApiException catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, e.code);
      });
    } catch (e) {
      setState(() {
        _error = translateErrorCode(context.l10n, null);
      });
    } finally {
      setState(() => _checking = false);
    }
  }

  String _getReferralLink() {
    if (_userStatus == null || _userStatus!.referralCode.isEmpty) return '';
    return 'https://pricofy.com/landing?ref=${_userStatus!.referralCode}';
  }

  void _copyReferralLink() {
    final link = _getReferralLink();
    if (link.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: link));
      final l10n = context.l10n;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.betaLinkCopied),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 768;

    return Scaffold(
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF030712), // gray-950
                  Color(0xFF111827), // gray-900
                  Color(0xFF030712), // gray-950
                ],
              ),
            ),
          ),
          // Content
          CustomScrollView(
            slivers: [
              // Navbar
              const SliverToBoxAdapter(
                child: Navbar(),
              ),
              // Main content
              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: isMobile ? 8 : 24,
                    vertical: 24,
                  ),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1152), // max-w-6xl
                      child: Column(
                        children: [
                          // Hero Section
                          _buildHeroSection(l10n, isMobile),
                          const SizedBox(height: 48),

                          // Content based on state
                          if (_userStatus == null) ...[
                            // How It Works Section
                            HowItWorksSection(l10n: l10n, isMobile: isMobile),
                            const SizedBox(height: 32),

                            // Registration Form
                            RegistrationForm(
                              l10n: l10n,
                              isMobile: isMobile,
                              loading: _loading,
                              error: _error,
                              onRegister: _handleRegister,
                              onCheckExisting: _handleCheckExistingUser,
                            ),
                          ] else ...[
                            // Success message
                            if (_success) _buildSuccessMessage(l10n),
                            if (_success) const SizedBox(height: 24),

                            // User Status Section
                            UserStatusSection(
                              l10n: l10n,
                              isMobile: isMobile,
                              userStatus: _userStatus!,
                              maxRealPositions: kMaxRealPositions,
                              firstRealPosition: kFirstRealPosition,
                            ),
                            const SizedBox(height: 24),

                            // Steps Progress Section
                            if (!_userStatus!.isApproved)
                              StepsProgressSection(
                                l10n: l10n,
                                isMobile: isMobile,
                                userStatus: _userStatus!,
                                checking: _checking,
                                error: _error,
                                referralLink: _getReferralLink(),
                                onCheckStatus: _handleCheckStatus,
                                onCopyReferralLink: _copyReferralLink,
                              ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              // Footer
              const SliverToBoxAdapter(
                child: Footer(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeroSection(dynamic l10n, bool isMobile) {
    return Column(
      children: [
        Text(
          l10n.betaTitle,
          style: TextStyle(
            fontSize: isMobile ? 40 : 56,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            height: 1.1,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        Text(
          l10n.betaSubtitle,
          style: TextStyle(
            fontSize: isMobile ? 20 : 28,
            fontWeight: FontWeight.w600,
            color: AppTheme.primary400,
          ),
          textAlign: TextAlign.center,
        ),
        if (_userStatus == null) ...[
          const SizedBox(height: 16),
          Text(
            l10n.betaDescription,
            style: TextStyle(
              fontSize: isMobile ? 16 : 18,
              color: AppTheme.gray300,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ],
    );
  }

  Widget _buildSuccessMessage(dynamic l10n) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF14532D).withValues(alpha: 0.5), // green-900/50
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF16A34A), // green-600
          width: 2,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.check_circle,
            color: Color(0xFF86EFAC), // green-300
            size: 24,
          ),
          const SizedBox(width: 12),
          Text(
            l10n.betaRegisteredSuccess,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Color(0xFFBBF7D0), // green-200
            ),
          ),
        ],
      ),
    );
  }
}
