def calculate_risk(text_result, url_result):

    text_score = text_result.get("risk_score", 0)
    url_score = url_result.get("risk_score", 0)

    overall = round((text_score + url_score) / 2)

    if overall >= 80:
        level = "High"
    elif overall >= 50:
        level = "Medium"
    else:
        level = "Low"

    return {
        "risk_score": overall,
        "threat_level": level
    }