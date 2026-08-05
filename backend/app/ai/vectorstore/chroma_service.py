import chromadb

from app.ai.embeddings.embedding_service import (
    EmbeddingService,
)


class ChromaService:

    def __init__(self):

        self.client = chromadb.PersistentClient(
            path="chromadb",
        )

        self.collection = (
            self.client.get_or_create_collection(
                name="evaluate-yourself",
            )
        )

        self.embedding_service = EmbeddingService()

    # ==========================================
    # Add Document
    # ==========================================
    def add_document(
        self,
        document_id: str,
        text: str,
        metadata: dict,
    ):

        embedding = (
            self.embedding_service.generate_embedding(
                text,
            )
        )

        self.collection.add(
            ids=[document_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[metadata],
        )

    # ==========================================
    # Search Documents
    # ==========================================
    def search(
        self,
        query: str,
        top_k: int = 5,
        metadata: dict | None = None,
    ):

        query_embedding = (
            self.embedding_service.generate_embedding(
                query,
            )
        )

        query_params = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
        }

        # Apply Metadata Filter
        if metadata is not None:
            query_params["where"] = metadata

        results = self.collection.query(
            **query_params
        )

        documents = results.get(
            "documents",
            [[]],
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]],
        )[0]

        ids = results.get(
            "ids",
            [[]],
        )[0]

        distances = results.get(
            "distances",
            [[]],
        )[0]

        search_results = []

        for doc_id, document, meta, distance in zip(
            ids,
            documents,
            metadatas,
            distances,
        ):

            search_results.append(
                {
                    "id": doc_id,
                    "text": document,
                    "metadata": meta,
                    "distance": distance,
                }
            )

        return search_results

    # ==========================================
    # Delete Documents
    # ==========================================
    def delete_documents(
        self,
        metadata: dict,
    ):

        self.collection.delete(
            where=metadata,
        )

    # ==========================================
    # Count Documents
    # ==========================================
    def count_documents(
        self,
    ):

        return self.collection.count()