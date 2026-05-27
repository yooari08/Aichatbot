import asyncio
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

    def _boto_session_kwargs(self) -> dict[str, str]:
        """Build aioboto3 session kwargs from Settings (.env is not auto-exported to os.environ)."""
        kwargs: dict[str, str] = {"region_name": self._settings.aws_region}
        if self._settings.aws_access_key_id and self._settings.aws_secret_access_key:
            kwargs["aws_access_key_id"] = self._settings.aws_access_key_id
            kwargs["aws_secret_access_key"] = self._settings.aws_secret_access_key
            if self._settings.aws_session_token:
                kwargs["aws_session_token"] = self._settings.aws_session_token
        return kwargs

    async def stream_completion(
        self,
        *,
        messages: list[dict[str, str]],
        rag_context: str | None = None,
    ) -> AsyncIterator[str]:
        if self._settings.bedrock_mock_enabled:
            async for chunk in self._mock_stream(messages, rag_context=rag_context):
                yield chunk
            return

        async for chunk in self._bedrock_stream(messages, rag_context=rag_context):
            yield chunk

    async def _mock_stream(
        self,
        messages: list[dict[str, str]],
        rag_context: str | None = None,
    ) -> AsyncIterator[str]:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        rag_note = (
            f"\nRAG: {rag_context.count('[문서')}개 관련 문서를 참조했습니다."
            if rag_context
            else "\nRAG: 참조 문서 없음 (ChromaDB에 인덱싱된 문서가 없습니다)."
        )
        reply = (
            f"[개발 모드 응답] '{last_user[:80]}'에 대한 답변입니다.{rag_note}\n"
            "Bedrock 연동 전 mock 스트리밍입니다. `BEDROCK_MOCK_ENABLED=false` 및 AWS 자격증명 설정 후 "
            "실제 Claude Sonnet 4.6 응답을 받을 수 있습니다."
        )
        for word in reply.split(" "):
            yield word + " "
            await asyncio.sleep(0.03)

    async def _bedrock_stream(
        self,
        messages: list[dict[str, str]],
        rag_context: str | None = None,
    ) -> AsyncIterator[str]:
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

        system_text = SYSTEM_PROMPT
        if rag_context:
            system_text = f"{SYSTEM_PROMPT}\n\n참고 문서 (답변 시 활용하세요):\n{rag_context}"

        session_kwargs = self._boto_session_kwargs()
        if "aws_access_key_id" not in session_kwargs:
            logger.warning(
                "Bedrock: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not set in Settings — "
                "boto3 default credential chain will be used"
            )

        session = aioboto3.Session(**session_kwargs)
        async with session.client("bedrock-runtime") as client:
            response = await client.converse_stream(
                modelId=self._settings.bedrock_model_id,
                system=[{"text": system_text}],
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
