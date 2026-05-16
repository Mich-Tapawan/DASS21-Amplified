import spacy
from spacy.matcher import PhraseMatcher

def analyze_dass21_symptoms(input_text):
    # Initialize spaCy component
    nlp = spacy.load("en_core_web_sm")

    # Define the DASS-21 categories and associated keywords
    DASS21_KEYWORDS = {
        "Depression": [
            "downheart", "feel downheart", "felt downheart", "feeling downheart",
            "blue", "feel blue", "felt blue", "feeling blue",
            "sad", "feel sad", "felt sad", "feeling sad",
            "meaningless", "feel meaningless", "felt meaningless", "feeling meaningless",
            "dishearten", "feel dishearten", "felt dishearten", "feeling dishearten",
            "worthless", "feel worthless", "felt worthless", "feeling worthless",
            "feel nothing", "felt nothing", "feeling nothing",
            "hopeless", "feel hopeless", "felt hopeless", "feeling hopeless",
            "feeling empty", "feel empty", "felt empty",
            "purposeless", "feel purposeless", "felt purposeless", "feeling purposeless",
            "no purpose", "feel no purpose", "felt no purpose", "feeling no purpose",
            "depress", "feel depress", "felt depress", "feeling depress",
            "depressed", "feel depressed", "felt depressed", "feeling depressed"
        ],
        "Anxiety": [
            "tremble", "feel tremble", "felt tremble", "feeling tremble",
            "scare", "feel scare", "felt scare", "feeling scare",
            "scary", "feel scary", "felt scary", "feeling scary",
            "panic", "feel panic", "felt panic", "feeling panic",
            "absence", "feel absence", "felt absence", "feeling absence",
            "worried", "feel worried", "felt worried", "feeling worried",
            "dry mouth", "feel dry mouth", "felt dry mouth", "feeling dry mouth",
            "dryness of my mouth", "feel dryness of my mouth", "felt dryness of my mouth", "feeling dryness of my mouth",
            "hard to breathe", "feel hard to breathe", "felt hard to breathe", "feeling hard to breathe",
            "difficult to breathe", "feel difficult to breathe", "felt difficult to breathe", "feeling difficult to breathe",
            "difficulty breathing", "feel difficulty breathing", "felt difficulty breathing", "feeling difficulty breathing",
            "anxiety", "feel anxiety", "felt anxiety", "feeling anxiety",
            "anxious", "feel anxious", "felt anxious", "feeling anxious"
        ],
        "Stress": [
            "agitate", "feel agitate", "felt agitate", "feeling agitate",
            "difficult to relax", "feel difficult to relax", "felt difficult to relax", "feeling difficult to relax",
            "difficult to calm down", "feel difficult to calm down", "felt difficult to calm down", "feeling difficult to calm down",
            "difficult to stay calm", "feel difficult to stay calm", "felt difficult to stay calm", "feeling difficult to stay calm",
            "hard to calm down", "feel hard to calm down", "felt hard to calm down", "feeling hard to calm down",
            "hard to stay calm", "feel hard to stay calm", "felt hard to stay calm", "feeling hard to stay calm",
            "nervous", "feel nervous", "felt nervous", "feeling nervous",
            "overreact", "feel overreact", "felt overreact", "feeling overreact",
            "irritate", "feel irritate", "felt irritate", "feeling irritate",
            "stress", "feel stress", "felt stress", "feeling stress",
            "stressed", "feel stressed", "felt stressed", "feeling stressed"
        ]
    }


    # Define antonyms for detecting negated antonyms
    DASS21_ANTONYMS = {
        "Depression": [
            "happy", "feel happy", "felt happy", "feeling happy",
            "joyful", "feel joyful", "felt joyful", "feeling joyful",
            "cheerful", "feel cheerful", "felt cheerful", "feeling cheerful",
            "optimistic", "feel optimistic", "felt optimistic", "feeling optimistic",
            "fulfilled", "feel fulfilled", "felt fulfilled", "feeling fulfilled",
            "satisfied", "feel satisfied", "felt satisfied", "feeling satisfied",
            "content", "feel content", "felt content", "feeling content",
            "hopeful", "feel hopeful", "felt hopeful", "feeling hopeful",
            "enthusiastic", "feel enthusiastic", "felt enthusiastic", "feeling enthusiastic",
            "motivated", "feel motivated", "felt motivated", "feeling motivated",
            "positive outlook", "feel positive outlook", "felt positive outlook", "feeling positive outlook",
            "energetic", "feel energetic", "felt energetic", "feeling energetic",
            "vibrant", "feel vibrant", "felt vibrant", "feeling vibrant",
            "uplifted", "feel uplifted", "felt uplifted", "feeling uplifted",
            "inspired", "feel inspired", "felt inspired", "feeling inspired",
            "feeling purposeful", "feel purposeful", "felt purposeful", 
            "feeling meaningful", "feel meaningful", "felt meaningful"
        ],
        "Anxiety": [
            "calm", "feel calm", "felt calm", "feeling calm",
            "relaxed", "feel relaxed", "felt relaxed", "feeling relaxed",
            "secure", "feel secure", "felt secure", "feeling secure",
            "unworried", "feel unworried", "felt unworried", "feeling unworried",
            "fearless", "feel fearless", "felt fearless", "feeling fearless",
            "confident", "feel confident", "felt confident", "feeling confident",
            "tranquil", "feel tranquil", "felt tranquil", "feeling tranquil",
            "untroubled", "feel untroubled", "felt untroubled", "feeling untroubled",
            "collected", "feel collected", "felt collected", "feeling collected",
            "cool-headed", "feel cool-headed", "felt cool-headed", "feeling cool-headed",
            "assured", "feel assured", "felt assured", "feeling assured",
            "grounded", "feel grounded", "felt grounded", "feeling grounded",
            "self-assured", "feel self-assured", "felt self-assured", "feeling self-assured",
            "composed", "feel composed", "felt composed", "feeling composed",
            "steady", "feel steady", "felt steady", "feeling steady",
            "balanced", "feel balanced", "felt balanced", "feeling balanced",
            "level-headed", "feel level-headed", "felt level-headed", "feeling level-headed"
        ],
        "Stress": [
            "peaceful", "feel peaceful", "felt peaceful", "feeling peaceful",
            "chill", "feel chill", "felt chill", "feeling chill",
            "easy-going", "feel easy-going", "felt easy-going", "feeling easy-going",
            "carefree", "feel carefree", "felt carefree", "feeling carefree",
            "laid-back", "feel laid-back", "felt laid-back", "feeling laid-back",
            "unbothered", "feel unbothered", "felt unbothered", "feeling unbothered",
            "undisturbed", "feel undisturbed", "felt undisturbed", "feeling undisturbed",
            "serene", "feel serene", "felt serene", "feeling serene",
            "at ease", "feel at ease", "felt at ease", "feeling at ease",
            "unruffled", "feel unruffled", "felt unruffled", "feeling unruffled",
            "centered", "feel centered", "felt centered", "feeling centered",
            "poised", "feel poised", "felt poised", "feeling poised",
            "free of tension", "feel free of tension", "felt free of tension", "feeling free of tension",
            "unpressured", "feel unpressured", "felt unpressured", "feeling unpressured",
            "effortless", "feel effortless", "felt effortless", "feeling effortless",
            "smooth-going", "feel smooth-going", "felt smooth-going", "feeling smooth-going",
            "light-hearted", "feel light-hearted", "felt light-hearted", "feeling light-hearted"
        ]
    }


    # Phrase matcher for multi-word phrases
    def build_phrase_matcher(keywords):
        matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
        for phrase in keywords:
            doc = nlp(phrase)
            matcher.add(phrase, [doc])
        return matcher

    PHRASE_MATCHERS = {category: build_phrase_matcher(keywords) for category, keywords in DASS21_KEYWORDS.items()}
    ANTONYM_MATCHERS = {category: build_phrase_matcher(keywords) for category, keywords in DASS21_ANTONYMS.items()}

    # Negation detection
    def has_negation(token):
        negations = {"not", "no", "never", "n't"}
        return any(tok.text.lower() in negations for tok in token.lefts) or (
            token.i > 0 and doc[token.i - 1].text.lower() in negations
        )

    # Analyze input text
    doc = nlp(input_text.lower())
    matched_symptoms = {"Depression": set(), "Anxiety": set(), "Stress": set()}
    matched_tokens = set()  # Track tokens already matched in phrases

    # Phrase matching (multi-word phrases prioritized)
    for category, matcher in PHRASE_MATCHERS.items():
        matches = matcher(doc)
        for _, start, end in matches:
            phrase = doc[start:end]
            if not has_negation(phrase[0]):  # Skip if negated
                matched_symptoms[category].add(phrase.text)
                matched_tokens.update(range(start, end))

    # Antonym detection for negation (detect "not happy" as a symptom)
    for category, matcher in ANTONYM_MATCHERS.items():
        matches = matcher(doc)
        for _, start, end in matches:
            phrase = doc[start:end]
            if has_negation(phrase[0]):  # Only include if negated
                matched_symptoms[category].add("not " + phrase.text)
                matched_tokens.update(range(start, end))

    # Single-word detection (exclude tokens already matched in phrases)
    for category, keywords in DASS21_KEYWORDS.items():
        for token in doc:
            if token.i in matched_tokens:  # Skip tokens already part of a phrase
                continue
            lemma = token.lemma_
            if lemma in keywords:
                if not has_negation(token):  # Skip if negated
                    matched_symptoms[category].add(token.text)

    # Convert sets to lists to avoid duplication
    matched_symptoms = {category: list(symptoms) for category, symptoms in matched_symptoms.items()}

    # Count symptoms
    symptom_counts = {category: len(symptoms) for category, symptoms in matched_symptoms.items()}

    return {
        "matched_symptoms": matched_symptoms,
        "symptom_counts": symptom_counts
    }
