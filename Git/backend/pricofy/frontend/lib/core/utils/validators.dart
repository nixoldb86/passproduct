/**
 * Email Validator
 * 
 * Migrated from pricofy-frontend/lib/emailValidator.ts (337 lines)
 * EXACT validation logic including disposable email domains (200+ domains)
 */

/// Validation result
class ValidationResult {
  final bool valid;
  final String? error;

  const ValidationResult({required this.valid, this.error});
}

/// List of temporary and disposable email domains (200+ domains)
const List<String> temporaryEmailDomains = [
  // Temp mail services
  'tempmail.com', 'tempmail.net', 'tempmail.org', 'tempmail.co', 'tempmail.io',
  'temp-mail.org',
  'temp-mail.io',
  'temp-mail.ru',
  'temp-mail.com',
  'temp-mail.net',
  'tempinbox.com', 'tempmailo.com', 'tmpmail.org', 'tmpmail.net', 'tmpmail.com',
  'mytemp.email', 'tempr.email', 'tempail.com', 'tempmail.de',

  // 10 minute mail (10minutemail.com)
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  '10minutemail.co.uk',
  '10minutemail.de', '10minutemail.es', '10minutemail.fr',
  '10minutemail.ml', '10minutemail.ga', '10minutemail.tk',

  // Guerrilla mail
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',

  // Mailinator
  'mailinator.com', 'mailinator.net', 'mailinator.org',

  // Throwaway
  'throwaway.email',
  'throwawaymail.com',
  'throwawaymail.net',
  'throwawaymail.org',

  // Yopmail
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'yopmail.org',

  // Mohmal
  'mohmal.com', 'mohmal.im', 'mohmal.in',

  // Fake inbox
  'fakeinbox.com', 'fakeinbox.net', 'fakeinbox.org',

  // Fakemail.net
  'fakemail.net', 'fakemail.com', 'fakemail.org', 'fakemail.co',
  'fakemail.io', 'fakemail.me', 'fakemail.tk', 'fakemail.ga',

  // Trash mail
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.fr',
  'dispostable.com', 'dispostable.net',

  // Spam services
  'spamgourmet.com', 'spamhole.com', 'spam4.me', 'spamfree24.org',
  'spambox.us', 'spam.la', 'spambog.com', 'spambog.de', 'spambog.ru',

  // Other common disposable
  'getnada.com', 'mintemail.com', 'meltmail.com',
  'emailondeck.com', 'sharklasers.com', 'grr.la', 'pokemail.net',
  'bccto.me', 'chacuo.net', 'anonymbox.com', 'mytrashmail.com',
  '33mail.com', 'maildrop.cc', 'mailcatch.com', 'mailmoat.com',
  'mailnull.com', 'mailtemp.info', 'mailtothis.com',

  // Suntuy y similares
  'suntuy.com', 'suntuy.net', 'suntuy.org',

  // Emailfake.com y dominios relacionados
  'emailfake.com', 'code-gmail.com', 'wotomail.com', 'dmxs8.com',
  'tiktokngon.com', 'nowpodbid.com', 'jagomail.com', 'dsantoro.es',

  // Otros dominios temporales comunes
  'mailinator.pl', 'mailinator2.com', 'mailinator3.com',
  'mailnesia.com', 'mailforspam.com',
  'mailme.lv', 'mailmetrash.com', 'mailscrap.com',
  'mailshell.com', 'mailsiphon.com',
  'mailzi.ru', 'minuteinbox.com',
  'moburl.com', 'monemail.fr',
  'mvrht.com', 'neomailbox.com',
  'nospam.ze.tc', 'nowmymail.com', 'objectmail.com',
  'obobbo.com', 'onewaymail.com', 'online.ms',
  'opayq.com', 'ordinaryamerican.net', 'otherinbox.com',
  'owlpic.com', 'pimpedupmyspace.com', 'plexolan.de',
  'pookmail.com', 'privacy.net', 'privymail.de',
  'proxymail.eu', 'punkass.com', 'putthisinyourspamdatabase.com',
  'quickinbox.com', 'rcpt.at', 'recode.me',
  'recursor.net', 'regbypass.com', 'regbypass.comsafe-mail.net',
  'safetymail.info', 'safetypost.de', 'sandelf.de',
  'saynotospams.com', 'selfdestructingmail.com', 'sendspamhere.com',
  'shiftmail.com', 'shmail.net',
  'shortmail.net', 'sibmail.com', 'sinnlos-mail.de',
  'slapsfromlastnight.com', 'slaskpost.se', 'smashmail.de',
  'smellfear.com', 'snakemail.com', 'sneakemail.com',
  'sofort-mail.de', 'sogetthis.com', 'soodonims.com',
  'spamavert.com', 'spambob.com',
  'spambob.org',
  'spamex.com',
  'spamfree24.de', 'spamfree24.eu',
  'spamfree24.net',
  'spamgourmet.net', 'spamgourmet.org', 'spamherelots.com',
  'spamhereplease.com', 'spamify.com',
  'spaminator.de', 'spamkill.info', 'spaml.com',
  'spaml.de', 'spammotel.com', 'spamobox.com',
  'spamspot.com', 'spamthis.co.uk', 'spamthisplease.com',
  'speed.1s.fr', 'stuffmail.de', 'super-auswahl.de',
  'supergreatmail.com', 'supermailer.jp', 'superrito.com',
  'tagyourself.com', 'teewars.org', 'teleosaurs.xyz',
  'teleworm.com',
  'tempalias.com', 'tempe-mail.com', 'tempemail.biz',
  'tempemail.com', 'tempinbox.co.uk',
  'tempmail.it',
  'tempmail.us',
  'tempmail2.com', 'tempmailer.com', 'tempmailer.de',
  'tempomail.fr', 'temporarily.de', 'temporarioemail.com.br',
  'tempthe.net', 'thankyou2010.com', 'thisisnotmyrealemail.com',
  'tilien.com',
  'tmail.ws', 'tmailinator.com', 'toiea.com',
  'tradermail.info', 'trash-amil.com', 'trash-mail.at',
  'trash-mail.com', 'trash-mail.de', 'trash2009.com',
  'trashemail.de', 'trashmail.at',
  'trashmail.de', 'trashmail.me',
  'trashymail.com', 'turual.com',
  'twinmail.de', 'tyldd.com', 'uggsrock.com',
  'umail.net', 'upliftnow.com', 'uplipht.com',
  'uroid.com', 'us.af', 'venompen.com',
  'veryrealemail.com', 'viditag.com', 'viewcastmedia.com',
  'viewcastmedia.net', 'viewcastmedia.org', 'webemail.me',
  'webm4il.info', 'wh4f.org', 'whyspam.me',
  'willselfdestruct.com', 'winemaven.info', 'wronghead.com',
  'wuzup.net', 'wuzupmail.net', 'xagloo.com',
  'xemaps.com', 'xents.com', 'xmaily.com',
  'xoxy.net', 'yapped.net', 'yeah.net',
  'yep.it', 'yogamaven.com',
  'youmailr.com',
  'ypmail.webyn.com', 'zippymail.info', 'zoemail.com',
  'zoemail.net', 'zoemail.org',
];

/// Validate email format and check for disposable domains
ValidationResult validateEmail(String email) {
  // Basic format validation
  if (email.trim().isEmpty) {
    return const ValidationResult(
      valid: false,
      error: 'El email es obligatorio',
    );
  }

  // Strict format validation (RFC 5322 simplified)
  final emailRegex = RegExp(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
  );
  if (!emailRegex.hasMatch(email)) {
    return const ValidationResult(
      valid: false,
      error: 'El formato del email no es válido',
    );
  }

  // Validate length (max 254 characters per RFC)
  if (email.length > 254) {
    return const ValidationResult(
      valid: false,
      error: 'El email es demasiado largo',
    );
  }

  // Validate no spaces
  if (email.contains(' ')) {
    return const ValidationResult(
      valid: false,
      error: 'El email no puede contener espacios',
    );
  }

  // Validate exactly one @
  final atCount = '@'.allMatches(email).length;
  if (atCount != 1) {
    return const ValidationResult(
      valid: false,
      error: 'El email debe contener exactamente un símbolo @',
    );
  }

  // Extract domain
  final parts = email.split('@');
  if (parts.length != 2 || parts[1].isEmpty) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio del email no es válido',
    );
  }

  final domain = parts[1].toLowerCase();

  // Validate domain has at least one dot
  if (!domain.contains('.')) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio del email debe contener un punto',
    );
  }

  // Validate domain doesn't end with dot
  if (domain.endsWith('.')) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio del email no puede terminar en punto',
    );
  }

  // Extract domain parts for additional validations
  final domainParts = domain.split('.');
  final domainName = domainParts[0];

  // Check known temporary domains
  if (temporaryEmailDomains.any(
    (temp) => domain == temp || domain.endsWith('.$temp'),
  )) {
    return const ValidationResult(
      valid: false,
      error: 'No se permiten emails temporales o desechables',
    );
  }

  // Suspicious patterns in domain (aggressive)
  final suspiciousPatterns = [
    RegExp(r'^temp', caseSensitive: false),
    RegExp(r'^fake', caseSensitive: false),
    RegExp(r'^test', caseSensitive: false),
    RegExp(r'^throwaway', caseSensitive: false),
    RegExp(r'^disposable', caseSensitive: false),
    RegExp(r'^spam', caseSensitive: false),
    RegExp(r'^trash', caseSensitive: false),
    RegExp(r'^dummy', caseSensitive: false),
    RegExp(r'^example', caseSensitive: false),
    RegExp(r'^invalid', caseSensitive: false),
    RegExp(r'^noreply', caseSensitive: false),
    RegExp(r'^no-reply', caseSensitive: false),
    RegExp(r'^donotreply', caseSensitive: false),
    RegExp(r'^do-not-reply', caseSensitive: false),
    RegExp(r'temp', caseSensitive: false),
    RegExp(r'fake', caseSensitive: false),
    RegExp(r'throwaway', caseSensitive: false),
    RegExp(r'disposable', caseSensitive: false),
    RegExp(r'spam', caseSensitive: false),
    RegExp(r'trash', caseSensitive: false),
    RegExp(r'^tmp', caseSensitive: false),
    RegExp(r'^tmpmail', caseSensitive: false),
    RegExp(r'^tempmail', caseSensitive: false),
    RegExp(r'^mohmal', caseSensitive: false),
    RegExp(r'^yopmail', caseSensitive: false),
    RegExp(r'^mailinator', caseSensitive: false),
    RegExp(r'^guerrilla', caseSensitive: false),
    RegExp(r'^10minute', caseSensitive: false),
    RegExp(r'^minutemail', caseSensitive: false),
    RegExp(r'^suntuy', caseSensitive: false),
    RegExp(r'^maildrop', caseSensitive: false),
    RegExp(r'^bccto', caseSensitive: false),
    RegExp(r'^chacuo', caseSensitive: false),
    RegExp(r'^anonym', caseSensitive: false),
    RegExp(r'^meltmail', caseSensitive: false),
    RegExp(r'^mintemail', caseSensitive: false),
    RegExp(r'^getnada', caseSensitive: false),
    RegExp(r'^emailfake', caseSensitive: false),
    RegExp(r'^code-gmail', caseSensitive: false),
    RegExp(r'^wotomail', caseSensitive: false),
    RegExp(r'^dmxs', caseSensitive: false),
    RegExp(r'^tiktokngon', caseSensitive: false),
    RegExp(r'^nowpodbid', caseSensitive: false),
    RegExp(r'^jagomail', caseSensitive: false),
    RegExp(r'^dsantoro', caseSensitive: false),
    RegExp(r'^fakemail', caseSensitive: false),
    RegExp(r'^10minutemail', caseSensitive: false),
  ];

  // Check if domain contains any suspicious pattern
  if (suspiciousPatterns.any((pattern) => pattern.hasMatch(domain))) {
    return const ValidationResult(
      valid: false,
      error: 'No se permiten emails temporales o desechables',
    );
  }

  // Detect randomly generated domains (very uncommon)
  final commonDomains = [
    'gmail',
    'yahoo',
    'hotmail',
    'outlook',
    'icloud',
    'protonmail',
    'aol',
    'mail',
    'live',
    'msn',
    'proton',
    'zoho',
    'mailbox',
    'gmx',
    'yandex',
    'me',
    'co',
    'edu',
    'gov',
  ];
  final isKnownDomain = commonDomains.any(
    (common) => domainName.toLowerCase().contains(common),
  );

  // Detect suspicious domains: very short or with random characters
  final suspiciousDomainPatterns = [
    RegExp(
      r'^[a-z]{4,6}\d{1,3}\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{8,12}(ngon|bid|mail|gmail|fake|minute)\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{6,10}[-_]?(gmail|mail|fake|temp|minute)\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{5,10}\d{2,4}\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{6,10}(santoro|ngon|bid|podbid|minute|fake)\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{6,12}(minute|minutemail|fakemail)\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
    RegExp(
      r'^[a-z]{4,8}[0-9]{1,4}(minute|fake|temp)\.(com|net|org|es|co|io|me|tk|ga|ml)$',
      caseSensitive: false,
    ),
  ];

  if (suspiciousDomainPatterns.any((pattern) => pattern.hasMatch(domain))) {
    return const ValidationResult(
      valid: false,
      error: 'No se permiten emails temporales o desechables',
    );
  }

  // Detect domains with random character sequences
  final randomCharPattern = RegExp(
    r'^[a-z]{4,8}[a-z]{4,8}\d{0,3}\.(com|net|org|es|co|io|me|tk|ga|ml)$',
    caseSensitive: false,
  );
  if (randomCharPattern.hasMatch(domain) && !isKnownDomain) {
    final hasRepeatingPattern = RegExp(
      r'([a-z])\1{2,}',
      caseSensitive: false,
    ).hasMatch(domainName);
    final hasRandomSequence = RegExp(
      r'[a-z]{6,}[^aeiou]{4,}',
      caseSensitive: false,
    ).hasMatch(domainName);
    final hasNumberLetterPattern = RegExp(
      r'[0-9]{2,}[a-z]{3,}|[a-z]{3,}[0-9]{2,}',
      caseSensitive: false,
    ).hasMatch(domainName);

    if (hasRandomSequence ||
        (hasRepeatingPattern && domainName.length < 8) ||
        hasNumberLetterPattern) {
      return const ValidationResult(
        valid: false,
        error: 'No se permiten emails temporales o desechables',
      );
    }
  }

  // Additional detection for services allowing custom domains
  final suspiciousSuffixes = [
    'minute',
    'fakemail',
    'tempemail',
    'tmpmail',
    'disposable',
  ];
  final hasSuspiciousSuffix = suspiciousSuffixes.any(
    (suffix) => domainName.toLowerCase().contains(suffix),
  );
  if (hasSuspiciousSuffix && !isKnownDomain) {
    return const ValidationResult(
      valid: false,
      error: 'No se permiten emails temporales o desechables',
    );
  }

  // If domain is very short and not known, it's suspicious
  if (!isKnownDomain && domainName.length < 4 && domainParts.length == 2) {
    return const ValidationResult(
      valid: false,
      error: 'No se permiten emails temporales o desechables',
    );
  }

  // Validate domain structure (must have valid TLD)
  if (domainParts.length < 2) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio del email no es válido',
    );
  }

  final tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || tld.length > 63) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio del email no es válido',
    );
  }

  // Validate domain doesn't contain invalid characters
  if (!RegExp(r'^[a-z0-9.-]+$').hasMatch(domain)) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio contiene caracteres inválidos',
    );
  }

  // Validate no consecutive dots
  if (domain.contains('..')) {
    return const ValidationResult(
      valid: false,
      error: 'El dominio no puede tener puntos consecutivos',
    );
  }

  // Validate domain doesn't start or end with hyphen or dot
  final domainWithoutTLD = domain.substring(0, domain.lastIndexOf('.'));
  if (domainWithoutTLD.startsWith('-') ||
      domainWithoutTLD.startsWith('.') ||
      domainWithoutTLD.endsWith('-') ||
      domainWithoutTLD.endsWith('.')) {
    return const ValidationResult(
      valid: false,
      error: 'El formato del dominio no es válido',
    );
  }

  return const ValidationResult(valid: true);
}
