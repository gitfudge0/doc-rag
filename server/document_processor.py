import os
import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any

class DocumentProcessor:
    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir
        
    def load_document(self, file_path: str) -> str:
        """Load and parse an HTML document, extracting clean text."""
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        # Get text and clean it
        text = soup.get_text()
        
        # Clean the text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def get_document_metadata(self, file_path: str) -> Dict[str, Any]:
        """Extract metadata from the document."""
        filename = os.path.basename(file_path)
        article_id = re.search(r'article_(\d+)\.html', filename)
        article_number = int(article_id.group(1)) if article_id else None
        
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        soup = BeautifulSoup(content, 'html.parser')
        title_tag = soup.find('title')
        title = title_tag.get_text() if title_tag else filename
        
        # Try to extract document ID (e.g., "UC202307604 EN")
        doc_id_pattern = r'UC\d+ EN'
        doc_id_match = re.search(doc_id_pattern, content)
        doc_id = doc_id_match.group(0) if doc_id_match else None
        
        return {
            "filename": filename,
            "article_number": article_number,
            "title": title,
            "doc_id": doc_id,
            "source_path": file_path
        }
    
    def chunk_document(self, text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
        """Split document text into overlapping chunks."""
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = min(start + chunk_size, text_length)
            
            # If we're not at the beginning, extend start backwards to create overlap
            if start > 0:
                start = max(0, start - chunk_overlap)
                
            # Find a good breaking point (end of sentence or paragraph)
            if end < text_length:
                # Try to find the end of a sentence
                sentence_end = text.rfind('.', start, end)
                paragraph_end = text.rfind('\n', start, end)
                
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1  # Include the period
                elif paragraph_end > start + chunk_size // 2:
                    end = paragraph_end + 1  # Include the newline
            
            chunks.append(text[start:end])
            start = end
            
        return chunks
    
    def process_all_documents(self) -> List[Dict[str, Any]]:
        """Process all documents in the data directory."""
        all_chunks = []
        
        for filename in os.listdir(self.data_dir):
            if filename.endswith('.html'):
                file_path = os.path.join(self.data_dir, filename)
                metadata = self.get_document_metadata(file_path)
                
                # Load and chunk the document
                document_text = self.load_document(file_path)
                chunks = self.chunk_document(document_text)
                
                # Add each chunk with metadata
                for i, chunk_text in enumerate(chunks):
                    all_chunks.append({
                        "text": chunk_text,
                        "metadata": {
                            **metadata,
                            "chunk_index": i,
                            "total_chunks": len(chunks)
                        }
                    })
        
        return all_chunks