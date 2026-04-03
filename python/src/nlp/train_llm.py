import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
from trl import SFTTrainer

# 1. Cấu hình Model (Ví dụ dùng Llama-3-8B hoặc Mistral-7B)
# Lưu ý: Cần RAM GPU > 16GB. Nếu máy yếu, dùng model nhỏ hơn (ví dụ: Qwen1.5-1.8B)
MODEL_NAME = "meta-llama/Meta-Llama-3-8B-Instruct" 
OUTPUT_DIR = "./models/alchemy_llm_finetuned"

def train():
    print(f"Bắt đầu tải model {MODEL_NAME}...")
    
    # 2. Tải Tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.pad_token = tokenizer.eos_token

    # 3. Tải Model với Quantization 4-bit (Giảm RAM GPU)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME,
        load_in_4bit=True,
        device_map="auto"
    )
    model = prepare_model_for_kbit_training(model)

    # 4. Cấu hình LoRA (Fine-tuning nhẹ)
    lora_config = LoraConfig(
        r=16, 
        lora_alpha=32,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )
    model = get_peft_model(model, lora_config)

    # 5. Tải dữ liệu huấn luyện (từ file JSONL của bạn)
    # Định dạng file: {"text": "<s>[INST] Tạo flashcard cho: Quang hợp [/INST] Mặt trước: Quang hợp là gì? Mặt sau: Quá trình cây xanh dùng ánh sáng tạo ra năng lượng. </s>"}
    dataset = load_dataset("json", data_files={"train": "./data/train_data.jsonl"})

    # 6. Cấu hình Huấn luyện
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-4,
        logging_steps=10,
        max_steps=500, # Tăng lên nếu dữ liệu nhiều
        save_steps=100,
        optim="paged_adamw_8bit",
        fp16=True, # Dùng fp16 để train nhanh hơn
    )

    # 7. Bắt đầu Huấn luyện
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset["train"],
        peft_config=lora_config,
        dataset_text_field="text",
        max_seq_length=512,
        tokenizer=tokenizer,
        args=training_args,
    )

    print("Bắt đầu huấn luyện (Training)...")
    trainer.train()

    # 8. Lưu Model đã train
    print(f"Lưu model tại {OUTPUT_DIR}")
    trainer.model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

if __name__ == "__main__":
    train()
