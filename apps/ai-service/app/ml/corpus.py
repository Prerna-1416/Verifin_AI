"""Synthetic Indian financial scam corpus (deterministic, zero real PII).

Generates labeled training/validation examples for the ML classifier. Every
personal-data token is a clearly-fake placeholder (e.g. ``PAN: ABCDE1234F``),
so the model is trained on *representative* patterns without ever touching a
real person's data — fully aligned with the DPDP Act's purpose limitation.

A fixed seed makes generation deterministic and reproducible for the demo.
"""

from __future__ import annotations

import random
from typing import Iterator, Tuple

# Deterministic generator.
_rng = random.Random(20260707)

# --------------------------------------------------------------------------- #
# Placeholder building blocks (all synthetic — no real identifiers).
# --------------------------------------------------------------------------- #
_BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank", "PNB"]
_BROKERS = ["Zerodha", "Groww", "Angel One", "Upstox", "Paytm Money", "5paisa"]
_REGULATORS = ["SEBI", "RBI", "NSDL", "CDSL", "Income Tax Dept"]
_PHONE = "+91 98XXX XXXXX"
_PAN = "ABCDE1234F"
_AADHAAR = "XXXX XXXX 1234"
_UPI = "ram@ybl"
_EMAIL = "user@example.com"


def _placeholder_pii(text: str) -> str:
    """Inject a single fake PII token for realism without real data."""
    tokens = [_PHONE, _PAN, _AADHAAR, _UPI, _EMAIL]
    word = _rng.choice(tokens)
    return f"{text} {word}"


def _scam_templates() -> Iterator[Tuple[str, str]]:
    """Yield (template_with_placeholder_slots, label='scam')."""
    t = [
        # KYC / account freeze
        "URGENT: Your {bank} account will be BLOCKED in 24 hours. Click {link} to complete KYC verification immediately or your funds will be frozen.",
        "Dear customer, unusual activity detected on your {bank} account. Verify your identity within 2 hours to avoid permanent suspension. {link}",
        "Your PAN is linked to multiple accounts. Update KYC now at {link} or your {broker} trading access will be revoked today.",
        "Aadhaar not linked to PAN! Last day to update. Visit {link} to avoid penalty under Income Tax rules.",
        "Your {bank} debit card has been blocked due to failed OTP attempts. Reactivate at {link} within 1 hour.",
        # Investment fraud
        "Get 500% GUARANTEED returns on SIP investments. Special SEBI-registered scheme open for 48 hours only. Deposit at {link}.",
        "Limited offer: {stock} will triple in 1 month. Insider tip from {broker} team. Transfer funds to this account to lock your profit.",
        "Double your money in 3 days with our AI trading bot. No risk, 100% guaranteed returns. Invest now via {upi}.",
        "You have been selected for a high-return {broker} portfolio. Minimum investment ₹10,000. Hurry, slots filling fast.",
        "Missed our earlier message about the {stock} pre-IPO allotment. Register at {link} for guaranteed allocation.",
        # Prize / lottery
        "Congratulations! You won ₹25,00,000 in the {bank} lottery. Pay processing fee of ₹9,999 to claim your prize at {link}.",
        "Your mobile number won a lucky draw. Claim your cash prize by sharing OTP at {link} today.",
        "Final notice: You won an iPhone 15 in {broker} anniversary draw. Confirm details and pay shipping at {link}.",
        # Phishing / credential theft
        "Security alert: Your {upi} has been used for an unauthorized payment. Login at {link} to reverse the transaction.",
        "Your {bank} online banking session has expired. Re-authenticate to avoid account suspension: {link}",
        "Verify your email address now or your {broker} account will be closed: {link}",
        "Re-download the new {bank} app to continue transactions. Link: {link}",
        # Impersonation of regulator
        "SEBI has frozen your demat account for unverified transactions. Call our compliance officer to resolve: {phone}",
        "The Income Tax Dept has issued a notice on your PAN. Pay the outstanding amount at {link} to avoid prosecution.",
        "RBI complaint: illegal money transfer from your account. Respond to {email} with your details to appeal.",
        # Gift card / refund scams
        "Your {broker} cashback of ₹4,999 is waiting. Claim at {link} before it expires.",
        "We detected a refund due to you of ₹8,450. Confirm your bank details at {link} to receive it.",
        # SMS OTP fraud
        "Your OTP for {bank} transaction is 481293. Do NOT share with anyone. (This is a legitimate bank message).",
        "OTP {otp} is your {bank} verification code. Never disclose to others.",
        "RBI has detected a fraudulent payment attempt. Reply with OTP to block. OTP: {otp}",
        # Job / earn money
        "Earn ₹2,000/day working from home. Simple data entry job. Register at {link} with your details.",
        "Part-time job: like YouTube videos and earn daily. Deposit security amount at {link}.",
        "Telegram trading group with guaranteed signals. Join and pay monthly fee via {upi}.",
    ]
    for template in t:
        for _ in range(4):
            filled = template.replace("{bank}", _rng.choice(_BANKS))
            filled = filled.replace("{broker}", _rng.choice(_BROKERS))
            filled = filled.replace("{stock}", _rng.choice(["INFY", "TCS", "RELIANCE", "TATASTEEL"]))
            filled = filled.replace("{link}", _rng.choice(["http://verify-{bank}-secure.example/login", "http://update-kyc.example/confirm", "http://claim-reward.example/now"]))
            filled = filled.replace("{upi}", _UPI)
            filled = filled.replace("{phone}", _PHONE)
            filled = filled.replace("{email}", _EMAIL)
            filled = filled.replace("{otp}", str(_rng.randint(100000, 999999)))
            yield _placeholder_pii(filled), "scam"


def _legit_templates() -> Iterator[Tuple[str, str]]:
    """Yield (message, label='legit') — genuine transactional communications."""
    t = [
        "Dear customer, your {bank} monthly statement for June is now available in the app.",
        "Your transaction of ₹1,500 on {bank} card at Swiggy was successful. Available balance: ₹45,320.",
        "Thanks for opening your demat account with {broker}. Your account is now active.",
        "Your KYC documents for {broker} have been verified successfully.",
        "Reminder: your SIP installment of ₹5,000 will be debited on the 5th of next month.",
        "Meeting confirmed: Your financial advisor appointment with {bank} is on Tuesday at 11 AM.",
        "Your {broker} account password was changed successfully. If this was not you, contact support.",
        "Annual report for your mutual fund portfolio is available to download in the app.",
        "Your {bank} credit card bill of ₹12,400 is due on the 28th. Auto-pay is enabled.",
        "Your equity delivery report for {broker} has been generated for the last quarter.",
        "We hope you are satisfied with our service. Rate your recent {bank} visit.",
        "Your nominee details for {broker} are up to date.",
        "Market updates: Sensex closed up 0.4% today at 78,120 points.",
        "Your fixed deposit of ₹1,00,000 matures on 15 August. Renew it from the app.",
        "Statement generated. Download your {bank} savings account statement for April.",
        "Your {broker} account opening form has been submitted for review.",
        "Reminder to update your email preferences for notifications from {bank}.",
        "Your tax-saving ELSS mutual fund investment of ₹50,000 was confirmed.",
        "Dear investor, your quarterly portfolio review with {broker} advisor is scheduled.",
        "Your UPI registration with {upi} was successful.",
        "Your monthly passbook update is ready in the {bank} app.",
        "A new feature is available: Set spending limits on your {bank} cards from the app.",
        "Your {broker} referral code was used successfully. Check your dashboard for rewards.",
        "Your insurance premium linked to {bank} account will auto-debit on the 1st.",
    ]
    for template in t:
        for _ in range(4):
            filled = template.replace("{bank}", _rng.choice(_BANKS))
            filled = template.replace("{broker}", _rng.choice(_BROKERS))
            filled = filled.replace("{upi}", _UPI)
            yield _placeholder_pii(filled), "legit"


def generate_dataset(n_scams: int = 600, n_legit: int = 400) -> Tuple[list, list]:
    """Return ([messages], [labels]) of ``n_scams`` scams + ``n_legit`` legit."""
    scams = [m for m, _ in _scam_templates()][:n_scams]
    legit = [m for m, _ in _legit_templates()][:n_legit]
    while len(scams) < n_scams:
        scams.extend([m for m, _ in _scam_templates()][: n_scams - len(scams)])
    while len(legit) < n_legit:
        legit.extend([m for m, _ in _legit_templates()][: n_legit - len(legit)])

    # Adversarial near-miss cases so the benchmark is realistic, not "perfect".
    # These look scammy but are legitimate (easy to over-flag) and vice-versa.
    adversarial = [
        # Real banks do send OTP texts and support emails.
        ("Your OTP for HDFC Bank is 448291. Do NOT share it. Never disclose your PIN or password to anyone.", "legit"),
        ("A new device has logged into your ICICI account. If this was you, no action is needed.", "legit"),
        ("Your password was changed. If this wasn't you, call support immediately.", "legit"),
        ("Your Zerodha KYC was rejected. Re-upload PAN from the app within 7 days.", "legit"),
        ("Important: Update your nominee details before your next SIP debit.", "legit"),
        ("Alert: your account was temporarily locked after 3 failed OTP attempts. Contact support to unlock.", "legit"),
        ("Your trading password expires in 2 days. Please reset it before then.", "legit"),
        # Scams disguised as innocuous messages (easy to miss).
        ("Hi, I am calling from your bank's rewards team. Kindly share the OTP you received to confirm your cashback.", "scam"),
        ("We noticed you have an unclaimed dividend of Rs 5,000. Share your account number to process it.", "scam"),
        ("Your account has been flagged. This is a reminder — verify your details on the link below or your profits will be suspended.", "scam"),
        ("Congratulations, you have been shortlisted for a government subsidy. Pay a small registration fee to receive the amount.", "scam"),
        ("Your SIM will be blocked today. Call this number to reactivate: 1800-8899-XX", "scam"),
        ("Free one-month subscription to premium trading signals. Just share your email and a colleague will call you.", "scam"),
        ("I'm from SEBI's investor helpline. We recovered Rs 40,000 for you. Send a small processing fee to release it.", "scam"),
        ("Your electricity bill is overdue. Pay immediately via this link to avoid disconnection: http://billpay-now.example/pay", "scam"),
        ("Win a free iPhone every week! Register your details on this secure form to participate.", "scam"),
    ]
    adv_messages, adv_labels = zip(*adversarial) if adversarial else ([], [])
    messages = scams + legit + list(adv_messages)
    labels = ["scam"] * len(scams) + ["legit"] * len(legit) + list(adv_labels)

    combined = list(zip(messages, labels))
    _rng.shuffle(combined)
    messages, labels = zip(*combined) if combined else ([], [])
    return list(messages), list(labels)