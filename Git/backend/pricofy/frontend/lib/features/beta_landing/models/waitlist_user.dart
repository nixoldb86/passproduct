/**
 * Waitlist User Model
 *
 * Represents a user in the beta waitlist with their
 * position, steps completion status, and referral info.
 */

/// Modelo para el estado del usuario en la waitlist de beta
class WaitlistUser {
  final String email;
  final String instagramUsername;
  final String referralCode;
  final String estado; // 'registrado' | 'pendiente_verificacion' | 'aprobado'
  final int puestoVirtual;
  final int? puestoReal;
  final int invitacionesRealizadas;
  final bool step1Follow;
  final bool step2Story;
  final bool step3Invitations;

  const WaitlistUser({
    required this.email,
    required this.instagramUsername,
    required this.referralCode,
    required this.estado,
    required this.puestoVirtual,
    this.puestoReal,
    required this.invitacionesRealizadas,
    required this.step1Follow,
    required this.step2Story,
    required this.step3Invitations,
  });

  bool get isApproved => estado == 'aprobado';

  bool get allStepsCompleted =>
      step1Follow && step2Story && step3Invitations;

  factory WaitlistUser.fromJson(Map<String, dynamic> json, {
    String? instagramUsername,
    int virtualPositionBase = 5500,
  }) {
    final position = json['position'] as int? ?? 0;
    final isRealPosition = position < virtualPositionBase;

    return WaitlistUser(
      email: json['email'] as String? ?? '',
      instagramUsername: instagramUsername ?? '',
      referralCode: json['referralCode'] as String? ?? '',
      estado: json['status'] as String? ?? 'registrado',
      puestoVirtual: isRealPosition ? 0 : position,
      puestoReal: isRealPosition ? position : null,
      invitacionesRealizadas: json['invitationsCount'] as int? ?? 0,
      step1Follow: json['steps']?['follow'] as bool? ?? false,
      step2Story: json['steps']?['story'] as bool? ?? false,
      step3Invitations: json['steps']?['invitations'] as bool? ?? false,
    );
  }

  factory WaitlistUser.fromRegisterResponse(
    Map<String, dynamic> json,
    String instagramUsername,
  ) {
    return WaitlistUser(
      email: json['email'] as String? ?? '',
      instagramUsername: instagramUsername,
      referralCode: json['referralCode'] as String? ?? '',
      estado: json['status'] as String? ?? 'registrado',
      puestoVirtual: json['position'] as int? ?? 0,
      puestoReal: null,
      invitacionesRealizadas: 0,
      step1Follow: false,
      step2Story: false,
      step3Invitations: false,
    );
  }
}
