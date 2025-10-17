import json

def add_missing_types(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)

    for entry in data:
        if not entry["type"]:
            word = entry["word"]
            definition = entry["definition"]

            # Infer from word endings
            if word.endswith("ly"):
                entry["type"] = "adv"
            elif word.endswith("tion") or word.endswith("ment") or word.endswith("ness") or word.endswith("ity") or word.endswith("cy") or word.endswith("age") or word.endswith("al") or word.endswith("hood") or word.endswith("ship") or word.endswith("ism") or word.endswith("ist") or word.endswith("er") or word.endswith("or"):
                entry["type"] = "n"
            elif word.endswith("able") or word.endswith("ible") or word.endswith("al") or word.endswith("ful") or word.endswith("less") or word.endswith("ous") or word.endswith("ic") or word.endswith("ive") or word.endswith("en") or word.endswith("y") or word.endswith("ly"):
                entry["type"] = "adj"
            elif word.endswith("ize") or word.endswith("en") or word.endswith("ate") or word.endswith("fy") or word.endswith("ish") or word.startswith("be"):
                entry["type"] = "v"

            # Infer from definition
            if not entry["type"]:
                if "စနစ်" in definition or "ခြင်း" in definition or "သူ" in definition or "အရာ" in definition:
                    entry["type"] = "n"
                elif "သော" in definition:
                    entry["type"] = "adj"
                elif "သည်" in definition:
                    entry["type"] = "v"

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    add_missing_types("/Users/thantshweaung/Downloads/LawLex/MyanmarEnglishLawDictionary.json")