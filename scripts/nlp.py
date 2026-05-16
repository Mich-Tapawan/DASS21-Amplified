import spacy
from spacy.matcher import PhraseMatcher

from scripts.dass_items import (
    ANTONYM_ITEM_ID,
    ANTONYM_PHRASES,
    DASS_ITEMS,
    _CATEGORY_PHRASE_ITEM,
    _CATEGORY_PHRASES,
)

NEGATIONS = {"not", "no", "never", "nor", "n't", "without"}

_nlp = None
_item_matcher = None
_antonym_matcher = None
_match_key_to_meta = {}


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def _build_matchers():
    global _item_matcher, _antonym_matcher, _match_key_to_meta
    if _item_matcher is not None:
        return

    nlp = _get_nlp()
    _item_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    _antonym_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    _match_key_to_meta = {}

    for item in DASS_ITEMS:
        for idx, phrase in enumerate(item["phrases"]):
            key = f"ITEM_{item['id']}_{idx}"
            _item_matcher.add(key, [nlp.make_doc(phrase.lower())])
            _match_key_to_meta[key] = {
                "type": "item",
                "id": item["id"],
                "category": item["category"],
                "label": item["label"],
            }

    for category, phrases in _CATEGORY_PHRASES.items():
        item_id = _CATEGORY_PHRASE_ITEM[category]
        item = next(i for i in DASS_ITEMS if i["id"] == item_id)
        for idx, phrase in enumerate(phrases):
            key = f"CAT_{category}_{idx}"
            _item_matcher.add(key, [nlp.make_doc(phrase.lower())])
            _match_key_to_meta[key] = {
                "type": "item",
                "id": item_id,
                "category": category,
                "label": item["label"],
            }

    for category, phrases in ANTONYM_PHRASES.items():
        item_id = ANTONYM_ITEM_ID[category]
        item = next(i for i in DASS_ITEMS if i["id"] == item_id)
        for idx, phrase in enumerate(phrases):
            key = f"ANT_{category}_{idx}"
            _antonym_matcher.add(key, [nlp.make_doc(phrase.lower())])
            _match_key_to_meta[key] = {
                "type": "antonym",
                "id": item_id,
                "category": category,
                "label": item["label"],
            }


def is_negated(token, doc):
    """True if token is within scope of negation (deps or immediate neg particle)."""
    if token.dep_ == "neg":
        return True

    for child in token.children:
        if child.dep_ == "neg" or child.lower_ in NEGATIONS:
            return True

    for ancestor in token.ancestors:
        if ancestor.lower_ in NEGATIONS:
            return True
        if any(c.dep_ == "neg" for c in ancestor.children):
            return True

    if token.i > 0 and doc[token.i - 1].lower_ in NEGATIONS:
        return True

    return False


def span_is_negated(span, doc):
    return is_negated(span.root, doc)


def analyze_dass21_symptoms(input_text):
    if not input_text or not str(input_text).strip():
        raise ValueError("Text is required.")

    _build_matchers()
    nlp = _get_nlp()
    doc = nlp(input_text.strip())

    matched_by_id = {}

    for match_id, start, end in _item_matcher(doc):
        key = nlp.vocab.strings[match_id]
        meta = _match_key_to_meta[key]
        span = doc[start:end]

        if span_is_negated(span, doc):
            continue

        evidence = span.text
        item_id = meta["id"]
        if item_id not in matched_by_id:
            matched_by_id[item_id] = {
                "id": item_id,
                "category": meta["category"],
                "label": meta["label"],
                "evidence": evidence,
            }

    for match_id, start, end in _antonym_matcher(doc):
        key = nlp.vocab.strings[match_id]
        meta = _match_key_to_meta[key]
        span = doc[start:end]

        if not span_is_negated(span, doc):
            continue

        evidence = f"not {span.text}"
        item_id = meta["id"]
        if item_id not in matched_by_id:
            matched_by_id[item_id] = {
                "id": item_id,
                "category": meta["category"],
                "label": meta["label"],
                "evidence": evidence,
            }

    matched_items = sorted(matched_by_id.values(), key=lambda x: x["id"])

    matched_symptoms = {"Depression": [], "Anxiety": [], "Stress": []}
    for item in matched_items:
        matched_symptoms[item["category"]].append(item["evidence"])

    symptom_counts = {
        cat: len([i for i in matched_items if i["category"] == cat])
        for cat in ("Depression", "Anxiety", "Stress")
    }

    return {
        "matched_symptoms": matched_symptoms,
        "symptom_counts": symptom_counts,
        "matched_items": matched_items,
    }
