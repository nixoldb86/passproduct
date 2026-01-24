#!/usr/bin/env python3
"""
Script to convert custom Dart localization files to ARB format.
Reads lib/core/localization/app_localizations_*.dart and generates lib/l10n/app_*.arb
"""

import re
import json
import os

# Mapping of language codes
LANGUAGES = {
    'es': 'es',
    'en': 'en',
    'fr': 'fr',
    'pt': 'pt',
    'de': 'de',
    'it': 'it',
}

def extract_strings_from_dart(filepath):
    """Extract string constants from a Dart localization file."""
    strings = {}

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match: static const String name = 'value'; or "value"
    pattern = r"static const String (\w+) =\s*['\"](.+?)['\"];"

    # Also match multiline strings
    multiline_pattern = r"static const String (\w+) =\s*['\"]([^;]+)['\"];"

    for match in re.finditer(pattern, content, re.DOTALL):
        key = match.group(1)
        value = match.group(2)
        # Unescape single quotes
        value = value.replace("\\'", "'")
        # Handle line continuations
        value = re.sub(r"'\s*\n\s*'", "", value)
        strings[key] = value

    return strings

def generate_arb(strings, locale, is_template=False):
    """Generate ARB content from extracted strings."""
    arb = {
        "@@locale": locale,
    }

    for key, value in strings.items():
        arb[key] = value

        # Add metadata for template file (English)
        if is_template:
            # Check if value has placeholders like {count} or {position}
            placeholders = re.findall(r'\{(\w+)\}', value)
            if placeholders:
                arb[f"@{key}"] = {
                    "placeholders": {
                        p: {"type": "String"} for p in placeholders
                    }
                }

    return arb

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    localization_dir = os.path.join(base_dir, 'lib', 'core', 'localization')
    output_dir = os.path.join(base_dir, 'lib', 'l10n')

    os.makedirs(output_dir, exist_ok=True)

    for lang_suffix, locale in LANGUAGES.items():
        input_file = os.path.join(localization_dir, f'app_localizations_{lang_suffix}.dart')
        output_file = os.path.join(output_dir, f'app_{locale}.arb')

        if not os.path.exists(input_file):
            print(f"Warning: {input_file} not found, skipping")
            continue

        print(f"Processing {lang_suffix}...")
        strings = extract_strings_from_dart(input_file)
        print(f"  Found {len(strings)} strings")

        # English is the template
        is_template = (locale == 'en')
        arb = generate_arb(strings, locale, is_template)

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(arb, f, ensure_ascii=False, indent=2)

        print(f"  Written to {output_file}")

    print("\nDone! Now run: flutter gen-l10n")

if __name__ == '__main__':
    main()
