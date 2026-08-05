from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from datetime import datetime
import os

os.makedirs("reports", exist_ok=True)


def generate_report(result):

    filename = f"reports/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b><font size='18'>VeriFin AI Security Report</font></b>",
            styles["Title"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Generated:</b> {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}",
            styles["Normal"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Prediction:</b> {result['prediction']}",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Threat Level:</b> {result['threat_level']}",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Risk Score:</b> {result['risk_score']}%",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph(
            f"<b>Recommendation:</b> {result['recommendation']}",
            styles["Heading2"]
        )
    )

    story.append(
        Paragraph("<b>Reasons</b>", styles["Heading1"])
    )

    if result["reasons"]:
        for reason in result["reasons"]:
            story.append(
                Paragraph("• " + reason, styles["Normal"])
            )
    else:
        story.append(
            Paragraph(
                "No suspicious indicators detected.",
                styles["Normal"]
            )
        )

        doc.build(story)

    print("PDF saved at:", filename)

    return filename

