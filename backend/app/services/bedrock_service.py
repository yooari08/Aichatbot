import asyncio
import json
from collections.abc import AsyncIterator

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)

SYSTEM_PROMPT = (
    "You are an enterprise internal assistant for company HR, benefits, project standards, "
    "and workplace policies. Answer in Korean unless the user writes in another language. "
    "Be concise and accurate. If you lack context, say you are not sure and suggest "
    "checking official documents. Do not invent policy details."
)


class BedrockService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def stream_completion(
        self,
        *,
        messages: list[dict[str, str]],
    ) -> AsyncIterator[str]:
        if self._settings.bedrock_mock_enabled:
            async for chunk in self._mock_stream(messages):
                yield chunk
            return

        async for chunk in self._bedrock_stream(messages):
            yield chunk

    async def _mock_stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        reply = (
            f"[개발 모드 응답] '{last_user[:80]}'에 대한 답변입니다.\n"
            "Bedrock 연동 전 mock 스트리밍입니다. `BEDROCK_MOCK_ENABLED=false` 및 AWS 자격증명 설정 후 "
            "실제 Claude Sonnet 4.6 응답을 받을 수 있습니다."
        )
        for word in reply.split(" "):
            yield word + " "
            await asyncio.sleep(0.03)

    async def _bedrock_stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        try:
            import aioboto3
        except ImportError as exc:
            raise RuntimeError("aioboto3 is required for Bedrock streaming") from exc

        bedrock_messages = [
            {
                "role": "user" if m["role"] == "user" else "assistant",
                "content": [{"text": m["content"]}],
            }
            for m in messages
        ]

        session = aioboto3.Session()
        async with session.client(
            "bedrock-runtime",
            region_name=self._settings.aws_region,
        ) as client:
            response = await client.converse_stream(
                modelId=self._settings.bedrock_model_id,
                system=[{"text": SYSTEM_PROMPT}],
                messages=bedrock_messages,
                inferenceConfig={
                    "maxTokens": self._settings.bedrock_max_tokens,
                    "temperature": self._settings.bedrock_temperature,
                },
            )

            stream = response.get("stream")
            if stream is None:
                return

            async for event in stream:
                if "contentBlockDelta" not in event:
                    continue
                delta = event["contentBlockDelta"].get("delta", {})
                text = delta.get("text")
                if text:
                    yield text
