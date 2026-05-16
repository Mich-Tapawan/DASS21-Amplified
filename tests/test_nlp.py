import unittest

from scripts.nlp import analyze_dass21_symptoms


class TestAnalyzeDass21Symptoms(unittest.TestCase):
    def test_anxious_and_stressed(self):
        result = analyze_dass21_symptoms(
            "I've been feeling really anxious and stressed lately."
        )
        self.assertGreater(result["symptom_counts"]["Anxiety"], 0)
        self.assertGreater(result["symptom_counts"]["Stress"], 0)
        self.assertIn("matched_items", result)

    def test_nothing_to_look_forward_to(self):
        result = analyze_dass21_symptoms("I have nothing to look forward to")
        ids = [item["id"] for item in result["matched_items"]]
        self.assertIn(1, ids)

    def test_hard_to_wind_down(self):
        result = analyze_dass21_symptoms("I find it hard to wind down")
        ids = [item["id"] for item in result["matched_items"]]
        self.assertIn(15, ids)

    def test_not_happy_depression_signal(self):
        result = analyze_dass21_symptoms("I am not happy")
        self.assertGreater(result["symptom_counts"]["Depression"], 0)

    def test_happy_and_calm_no_symptoms(self):
        result = analyze_dass21_symptoms("I feel happy and calm")
        self.assertEqual(len(result["matched_items"]), 0)

    def test_dont_feel_anxious_no_anxiety(self):
        result = analyze_dass21_symptoms("I don't feel anxious at all")
        anxiety_count = result["symptom_counts"]["Anxiety"]
        self.assertEqual(anxiety_count, 0)

    def test_no_false_absence_match(self):
        result = analyze_dass21_symptoms(
            "In the absence of physical exertion my heart races"
        )
        evidences = " ".join(result["matched_symptoms"]["Anxiety"]).lower()
        self.assertNotIn("absence", evidences.split())

    def test_empty_text_raises(self):
        with self.assertRaises(ValueError):
            analyze_dass21_symptoms("   ")

    def test_matched_items_shape(self):
        result = analyze_dass21_symptoms("I feel sad and worried")
        for item in result["matched_items"]:
            self.assertIn("id", item)
            self.assertIn("category", item)
            self.assertIn("label", item)
            self.assertIn("evidence", item)


if __name__ == "__main__":
    unittest.main()
