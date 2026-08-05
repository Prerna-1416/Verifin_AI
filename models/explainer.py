def generate_explanation(text_result, url_result):

    explanations = []

    # Text explanation
    if text_result["prediction"] != "Safe":
        explanations.append(
            f"Text classified as {text_result['prediction']} with {text_result['confidence']}% confidence."
        )

    # URL explanation
    explanations.extend(url_result.get("reasons", []))

    if not explanations:
        explanations.append("No suspicious indicators detected.")

    return explanations