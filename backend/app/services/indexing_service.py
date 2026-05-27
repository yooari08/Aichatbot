import asyncio
import hashlib
from typing import Any

from app.core.config import Settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_CHUNK_SIZE = 800
_CHUNK_OVERLAP = 100


def _chunk_text(text: str) -> list[str]:
    if len(text) <= _CHUNK_SIZE:
        return [text]
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + _CHUNK_SIZE])
        start += _CHUNK_SIZE - _CHUNK_OVERLAP
    return chunks


class IndexingService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._collection: Any = None

    def _get_collection(self) -> Any:
        if self._collection is not None:
            return self._collection
        try:
            import chromadb
        except ImportError as exc:
            raise RuntimeError("chromadb 패키지가 필요합니다: pip install chromadb") from exc

        client = chromadb.HttpClient(
            host=self._settings.chroma_host,
            port=self._settings.chroma_port,
        )
        self._collection = client.get_or_create_collection(
            name=self._settings.chroma_collection,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "ChromaDB 연결됨 %s:%s collection=%s",
            self._settings.chroma_host,
            self._settings.chroma_port,
            self._settings.chroma_collection,
        )
        return self._collection

    async def search(self, query: str, n_results: int = 5) -> list[dict[str, Any]]:
        """쿼리와 유사한 문서 청크를 반환합니다. ChromaDB 연결 실패 시 빈 리스트 반환."""
        try:
            collection = await asyncio.to_thread(self._get_collection)
            results = await asyncio.to_thread(
                collection.query,
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"],
            )
        except Exception:
            logger.warning("ChromaDB 검색 실패 — RAG 없이 진행합니다", exc_info=True)
            return []

        docs = results.get("documents", [[]])[0]
        metas = results.get("metadatas", [[]])[0]
        dists = results.get("distances", [[]])[0]
        return [
            {"content": doc, "metadata": meta, "distance": dist}
            for doc, meta, dist in zip(docs, metas, dists, strict=True)
        ]

    async def index_document(
        self,
        doc_id: str,
        content: str,
        metadata: dict[str, Any] | None = None,
    ) -> int:
        """문서를 청크 단위로 분할해 ChromaDB에 upsert합니다. 인덱싱된 청크 수를 반환합니다."""
        chunks = _chunk_text(content)
        base_meta = metadata or {}
        ids = [
            f"{doc_id}::{i}::{hashlib.md5(chunk.encode()).hexdigest()[:8]}"
            for i, chunk in enumerate(chunks)
        ]
        metas = [{**base_meta, "doc_id": doc_id, "chunk_index": i} for i in range(len(chunks))]

        collection = await asyncio.to_thread(self._get_collection)
        await asyncio.to_thread(collection.upsert, ids=ids, documents=chunks, metadatas=metas)
        logger.info("문서 %s — %d개 청크 인덱싱 완료", doc_id, len(chunks))
        return len(chunks)

    async def delete_document(self, doc_id: str) -> None:
        """문서의 모든 청크를 인덱스에서 삭제합니다."""
        collection = await asyncio.to_thread(self._get_collection)
        await asyncio.to_thread(collection.delete, where={"doc_id": doc_id})
        logger.info("문서 %s 인덱스 삭제 완료", doc_id)
