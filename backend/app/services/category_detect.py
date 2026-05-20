"""Lightweight category tagging until RAG metadata is wired."""

_KEYWORDS: dict[str, list[str]] = {
    "HR": ["연차", "휴가", "인사", "채용", "근태", "입사"],
    "복리후생": ["복리", "경조", "건강검진", "복지", "육아"],
    "프로젝트": ["프로젝트", "요구사항", "변경관리", "산출물", "PM"],
    "이슈": ["재택", "출장", "이슈", "장애", "문의"],
}


def detect_category(text: str) -> str:
    for category, keywords in _KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            return category
    return "이슈"
