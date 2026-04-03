import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
import uvicorn

# --- CÁC MODULE AI (Sẽ được load khi server chạy) ---
# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import easyocr
# import whisper
# from sentence_transformers import SentenceTransformer

app = FastAPI(title="LearnAI / Alchemy Custom ML Backend")

# --- 1. LLM (Flashcards, Quizzes, Summaries) ---
class LLMRequest(BaseModel):
    prompt: str
    task: str # 'flashcard', 'quiz', 'summary'

@app.post("/api/generate")
async def generate_text(request: LLMRequest):
    """
    Gọi mô hình LLM đã được bạn Fine-tune (từ thư mục models/alchemy_llm_finetuned)
    """
    # TODO: Load model đã train (AutoModelForCausalLM.from_pretrained("./models/alchemy_llm_finetuned"))
    # TODO: Chạy model.generate()
    
    # Giả lập kết quả trả về
    if request.task == 'flashcard':
        return {"result": [{"front": "Khái niệm", "back": "Định nghĩa từ AI của bạn"}]}
    return {"result": f"AI của bạn đã xử lý: {request.prompt}"}


# --- 2. OCR (Quét ảnh thành chữ) ---
@app.post("/api/ocr")
async def extract_text_from_image(file: UploadFile = File(...)):
    """
    Dùng EasyOCR hoặc TrOCR để đọc chữ từ ảnh.
    """
    # TODO: Load EasyOCR (reader = easyocr.Reader(['vi', 'en']))
    # TODO: Đọc file ảnh và chạy reader.readtext(image)
    
    return {"text": "Đoạn văn bản được AI OCR của bạn đọc ra từ ảnh."}


# --- 3. Speech-to-Text (Ghi âm) ---
@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Dùng Whisper (OpenAI) để chuyển giọng nói thành văn bản.
    """
    # TODO: Load Whisper (model = whisper.load_model("base"))
    # TODO: Lưu file audio tạm và chạy model.transcribe(audio_path)
    
    return {"transcript": "Đoạn văn bản được AI Whisper của bạn nghe được."}


# --- 4. Semantic Resonance (Tìm kiếm ngữ nghĩa) ---
class EmbeddingRequest(BaseModel):
    text: str

@app.post("/api/embeddings")
async def get_embeddings(request: EmbeddingRequest):
    """
    Dùng SentenceTransformers để biến câu văn thành Vector số (Embeddings).
    Dùng cho tính năng Semantic Resonance (Tìm node liên quan).
    """
    # TODO: Load model (model = SentenceTransformer('all-MiniLM-L6-v2'))
    # TODO: Chạy model.encode(request.text)
    
    # Giả lập trả về vector 384 chiều
    return {"embedding": [0.1, 0.2, -0.5, 0.8] * 96}

if __name__ == "__main__":
    print("Khởi động AI Server tại http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
