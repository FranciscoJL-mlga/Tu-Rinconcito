import re
import argparse
from collections import OrderedDict


def normalize_css_properties(properties):
    props = []
    for prop in properties.split(';'):
        prop = prop.strip()
        if prop:
            props.append(prop)
    return '; '.join(sorted(props))


def remove_duplicate_css(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        css = file.read()

    pattern = re.compile(r'([^{]+)\{([^}]*)\}', re.DOTALL)

    unique_rules = OrderedDict()
    output_rules = []

    for match in pattern.finditer(css):
        selector = match.group(1).strip()
        properties = match.group(2).strip()

        normalized_props = normalize_css_properties(properties)
        key = (selector, normalized_props)

        if key not in unique_rules:
            unique_rules[key] = True
            output_rules.append(
                f"{selector} {{\n    {properties.strip()}\n}}\n"
            )

    with open(output_file, 'w', encoding='utf-8') as file:
        file.write('\n'.join(output_rules))

    print(f"CSS optimizado guardado en: {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Elimina reglas CSS duplicadas"
    )
    parser.add_argument("input", help="Archivo CSS de entrada")
    parser.add_argument(
        "-o",
        "--output",
        default="styles_clean.css",
        help="Archivo CSS de salida"
    )

    args = parser.parse_args()
    remove_duplicate_css(args.input, args.output)