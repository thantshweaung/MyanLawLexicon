
import json

def clean_dictionary_words_only(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)

    corrections = {
        "abolishion": "abolition",
        "86075022008805 (ဒဏ်ရာရ) မှု။ တိုက်ဆိုင်မှု။ by accident": "accident",
        "acitvity": "activity",
        "administeration": "administration",
        "admissable": "admissible",
        "adverrising": "advertising",
        "advoacy": "advocacy",
        "afortiori": "a fortiori",
        "analsis": "analysis",
        "antagonisitic": "antagonistic",
        "apprenhend": "apprehend",
        "attitide": "attitude",
        "baward": "award",
        "bookeeper": "bookkeeper",
        "bombrad": "bombard",
        "cpmmander": "commander",
        "cheif": "chief",
        "cliquy": "cliquey",
        "coliect": "collect",
        "comple": "compel",
        "confderate": "confederate",
        "consultaion": "consultation",
        "cprrespondent": "correspondent",
        "counsle": "counsel",
        "courter-espionage": "counter-espionage",
        "demeratize": "democratize",
        "depotism": "despotism",
        "destory": "destroy",
        "detecive": "detective",
        "eyecuritness": "eyewitness",
        "hiljack": "hijack",
        "huslings": "hustings",
        "imprpper": "improper",
        "informantion": "information",
        "interrogaive": "interrogative",
        "kidanpper": "kidnapper",
        "manslaugther": "manslaughter",
        "mufit": "mufti",
        "negotiabte": "negotiable",
        "personlity": "personality",
        "plactory": "placatory",
        "POlyeharous": "Polyandrous",
        "proscirbe": "proscribe",
        "resarch": "research",
        "rigth": "right",
        "ssduce": "seduce",
        "self-detence": "self-defence",
        "settement": "settlement",
        "sobdivide": "subdivide",
        "srangulation": "strangulation",
        "substaniate": "substantiate",
        "supension": "suspension",
        "tansiate": "translate",
        "trasformation": "transformation",
        "tule": "rule",
        "Mesllnony": "testimony",
        "unsitable": "unsuitable"
    }

    for entry in data:
        if entry["word"] in corrections:
            entry["word"] = corrections[entry["word"]]

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    clean_dictionary_words_only("/Users/thantshweaung/Downloads/LawLex/MyanmarEnglishLawDictionary.json")
