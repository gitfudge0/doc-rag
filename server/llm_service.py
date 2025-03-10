import os
import anthropic
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()


class LLMService:
    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")

        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-opus-20240229"  # Can be adjusted based on needs

    def generate_response(
        self,
        query: str,
        context_docs: List[Dict[str, Any]],
        conversation_history: List[Dict[str, str]] = None,
    ) -> str:
        """
        Generate a response using the Anthropic API with retrieved context documents.

        Args:
            query: The user's question
            context_docs: List of retrieved documents from the vector store
            conversation_history: Previous messages in the conversation

        Returns:
            The generated response
        """
        # Build the context from retrieved documents
        context_text = "\n\n".join([doc["text"] for doc in context_docs])

        # Build system prompt
        system_prompt = f"""You are an assistant specializing in providing information.

Your knowledge is STRICTLY limited to the information provided in the context below. 
If asked about something not explicitly covered in this context, respond ONLY with "I don't have enough information to answer that question."

When answering:
1. Be extremely concise - provide short, direct answers using only necessary words
2. Be accurate and factual, citing ONLY information from the provided context
3. NEVER make up information or hallucinate details not explicitly in the context
4. Do not provide speculative answers or assumptions
5. If multiple contradictory pieces of information exist, acknowledge this
6. If asked about medical advice beyond the device information, respond with "I don't have enough information to answer that question. Please consult a healthcare provider."
7. NEVER begin your answers with phrases like "Based on the provided context," or "According to the information provided," - just give the answer directly as if you're speaking to a human in a natural conversation

Context information:
{context_text}
"""

        # Build the message history
        messages = []

        # Add conversation history if available
        if conversation_history:
            for message in conversation_history:
                if message["role"] == "user":
                    messages.append({"role": "user", "content": message["content"]})
                elif message["role"] == "assistant":
                    messages.append(
                        {"role": "assistant", "content": message["content"]}
                    )

        # Add the current query
        messages.append({"role": "user", "content": query})

        # Send request to Anthropic
        response = self.client.messages.create(
            model=self.model,
            system=system_prompt,
            messages=messages,
            max_tokens=1000,
            temperature=0.0,  # Zero temperature for deterministic, factual responses
        )

        return response.content[0].text

