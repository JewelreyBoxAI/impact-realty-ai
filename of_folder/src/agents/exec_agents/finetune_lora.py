"""
LoRA Finetuning Script for Persona Consistency in Social Media Content Generation.

Features:
- LoRA (Low-Rank Adaptation) finetuning using PEFT library
- Multi-platform persona training data preparation
- 4-bit quantization for memory efficiency
- Custom dataset handling for social media content
- Evaluation metrics for persona consistency
- Model validation and testing
"""

import os
import json
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
from datasets import Dataset as HFDataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    BitsAndBytesConfig,
    EarlyStoppingCallback
)
from peft import (
    get_peft_model,
    LoraConfig,
    TaskType,
    prepare_model_for_kbit_training
)
import wandb
from sklearn.metrics import accuracy_score, f1_score
import matplotlib.pyplot as plt
import seaborn as sns


@dataclass
class LoRATrainingConfig:
    """LoRA training configuration."""
    # Model settings
    base_model_name: str = "microsoft/DialoGPT-medium"
    model_max_length: int = 512
    
    # LoRA settings
    lora_r: int = 16
    lora_alpha: int = 32
    lora_dropout: float = 0.1
    target_modules: List[str] = field(default_factory=lambda: ["q_proj", "v_proj", "k_proj", "o_proj"])
    
    # Training settings
    num_train_epochs: int = 3
    per_device_train_batch_size: int = 4
    per_device_eval_batch_size: int = 4
    gradient_accumulation_steps: int = 4
    learning_rate: float = 2e-4
    weight_decay: float = 0.01
    warmup_ratio: float = 0.1
    
    # Optimization
    use_4bit_quantization: bool = True
    use_gradient_checkpointing: bool = True
    fp16: bool = True
    
    # Data settings
    train_split: float = 0.8
    val_split: float = 0.1
    test_split: float = 0.1
    
    # Output settings
    output_dir: str = "./lora_models"
    logging_steps: int = 10
    eval_steps: int = 100
    save_steps: int = 500
    
    # Wandb settings
    use_wandb: bool = False
    wandb_project: str = "agentic-social-media-lora"


class SocialMediaDataset(Dataset):
    """Dataset for social media content with persona consistency."""
    
    def __init__(
        self,
        data: List[Dict[str, Any]],
        tokenizer,
        max_length: int = 512,
        platform_specific: bool = True
    ):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.platform_specific = platform_specific
        
        # Prepare data
        self.prepared_data = self._prepare_data()
    
    def _prepare_data(self) -> List[Dict[str, Any]]:
        """Prepare data for training."""
        prepared = []
        
        for item in self.data:
            # Create persona-aware prompt
            persona_info = item.get("persona_context", {})
            platform = item.get("platform", "general")
            content = item.get("content", "")
            
            # Format input
            if self.platform_specific:
                prompt = self._create_platform_prompt(persona_info, platform, item.get("prompt", ""))
            else:
                prompt = self._create_general_prompt(persona_info, item.get("prompt", ""))
            
            # Create input-output pair
            full_text = f"{prompt}\n\nContent: {content}"
            
            prepared.append({
                "input_text": prompt,
                "target_text": content,
                "full_text": full_text,
                "persona_id": persona_info.get("persona_id", "default"),
                "platform": platform
            })
        
        return prepared
    
    def _create_platform_prompt(self, persona_info: Dict[str, Any], platform: str, prompt: str) -> str:
        """Create platform-specific prompt."""
        persona_description = persona_info.get("description", "")
        tone = persona_info.get("tone", "casual")
        style = persona_info.get("style", "engaging")
        
        platform_instructions = {
            "onlyfans": "Create exclusive, engaging content that encourages subscriber interaction and tips.",
            "x": "Create concise, engaging content optimized for Twitter's format and hashtags.",
            "instagram": "Create visually-focused content with engaging captions and relevant hashtags.",
            "reddit": "Create authentic, community-focused content that adds value to the discussion.",
            "snapchat": "Create casual, authentic content that appeals to a younger audience."
        }
        
        instruction = platform_instructions.get(platform, "Create engaging social media content.")
        
        return f"""Persona: {persona_description}
Tone: {tone}
Style: {style}
Platform: {platform.title()}
Instruction: {instruction}
Request: {prompt}"""
    
    def _create_general_prompt(self, persona_info: Dict[str, Any], prompt: str) -> str:
        """Create general persona prompt."""
        persona_description = persona_info.get("description", "")
        tone = persona_info.get("tone", "casual")
        
        return f"""Persona: {persona_description}
Tone: {tone}
Request: {prompt}"""
    
    def __len__(self) -> int:
        return len(self.prepared_data)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.prepared_data[idx]
        
        # Tokenize the full text
        encoding = self.tokenizer(
            item["full_text"],
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        
        # For causal LM, labels are the same as input_ids
        labels = encoding["input_ids"].clone()
        
        # Mask the input portion for loss calculation
        input_encoding = self.tokenizer(
            item["input_text"],
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )
        input_length = input_encoding["input_ids"].shape[1]
        labels[:, :input_length] = -100  # Ignore input tokens in loss
        
        return {
            "input_ids": encoding["input_ids"].squeeze(),
            "attention_mask": encoding["attention_mask"].squeeze(),
            "labels": labels.squeeze()
        }


class PersonaConsistencyTrainer:
    """
    LoRA Trainer for Persona Consistency in Social Media Content.
    
    Features:
    - LoRA finetuning with 4-bit quantization
    - Persona consistency evaluation
    - Multi-platform training data support
    - Custom evaluation metrics
    - Model validation and testing
    
    Rick's signature: LoRA mastery, persona perfection ☠️
    """
    
    def __init__(
        self,
        config: LoRATrainingConfig,
        log_level: str = "INFO"
    ):
        """Initialize LoRA trainer."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🎯 PersonaConsistencyTrainer initializing - LoRA mastery mode ☠️")
        
        self.config = config
        
        # Initialize components
        self.tokenizer = None
        self.model = None
        self.peft_model = None
        self.trainer = None
        
        # Data
        self.train_dataset = None
        self.val_dataset = None
        self.test_dataset = None
        
        # Device setup
        self.device = self._setup_device()
        
        # Initialize model and tokenizer
        self._initialize_model()
        
        # Initialize Wandb if enabled
        if self.config.use_wandb:
            self._initialize_wandb()
        
        self.logger.info("✅ PersonaConsistencyTrainer initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.LoRATrainer")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ LORA - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _setup_device(self) -> torch.device:
        """Setup compute device."""
        if torch.cuda.is_available():
            device = torch.device("cuda")
            self.logger.info(f"🖥️ Using CUDA: {torch.cuda.get_device_name()}")
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            device = torch.device("mps")
            self.logger.info("🖥️ Using Apple MPS")
        else:
            device = torch.device("cpu")
            self.logger.info("🖥️ Using CPU")
        
        return device
    
    def _initialize_model(self):
        """Initialize base model and tokenizer."""
        try:
            self.logger.info(f"🤖 Loading model: {self.config.base_model_name}")
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.config.base_model_name,
                trust_remote_code=True
            )
            
            # Set pad token
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Configure quantization
            quantization_config = None
            if self.config.use_4bit_quantization and self.device.type == "cuda":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_use_double_quant=True
                )
                self.logger.info("⚡ Using 4-bit quantization")
            
            # Load model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.config.base_model_name,
                quantization_config=quantization_config,
                device_map="auto" if self.device.type == "cuda" else None,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device.type == "cuda" else torch.float32
            )
            
            # Prepare for k-bit training
            if quantization_config:
                self.model = prepare_model_for_kbit_training(self.model)
            
            # Enable gradient checkpointing
            if self.config.use_gradient_checkpointing:
                self.model.gradient_checkpointing_enable()
            
            self.logger.info("✅ Model and tokenizer loaded successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Model initialization failed: {str(e)}")
            raise
    
    def _initialize_wandb(self):
        """Initialize Weights & Biases."""
        try:
            wandb.init(
                project=self.config.wandb_project,
                config=self.config.__dict__,
                name=f"lora-finetune-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            )
            self.logger.info("📊 Wandb initialized")
        except Exception as e:
            self.logger.warning(f"⚠️ Wandb initialization failed: {str(e)}")
    
    def prepare_training_data(
        self,
        training_data: List[Dict[str, Any]],
        validation_data: Optional[List[Dict[str, Any]]] = None
    ):
        """Prepare training and validation datasets."""
        try:
            self.logger.info(f"📊 Preparing training data: {len(training_data)} samples")
            
            # Split data if validation not provided
            if validation_data is None:
                # Shuffle data
                import random
                random.shuffle(training_data)
                
                # Split
                train_size = int(len(training_data) * self.config.train_split)
                val_size = int(len(training_data) * self.config.val_split)
                
                train_data = training_data[:train_size]
                val_data = training_data[train_size:train_size + val_size]
                test_data = training_data[train_size + val_size:]
            else:
                train_data = training_data
                val_data = validation_data
                test_data = []
            
            # Create datasets
            self.train_dataset = SocialMediaDataset(
                train_data,
                self.tokenizer,
                self.config.model_max_length
            )
            
            self.val_dataset = SocialMediaDataset(
                val_data,
                self.tokenizer,
                self.config.model_max_length
            )
            
            if test_data:
                self.test_dataset = SocialMediaDataset(
                    test_data,
                    self.tokenizer,
                    self.config.model_max_length
                )
            
            self.logger.info(f"✅ Datasets prepared - Train: {len(self.train_dataset)}, Val: {len(self.val_dataset)}")
            
        except Exception as e:
            self.logger.error(f"❌ Data preparation failed: {str(e)}")
            raise
    
    def configure_lora(self) -> LoraConfig:
        """Configure LoRA parameters."""
        lora_config = LoraConfig(
            r=self.config.lora_r,
            lora_alpha=self.config.lora_alpha,
            lora_dropout=self.config.lora_dropout,
            target_modules=self.config.target_modules,
            bias="none",
            task_type=TaskType.CAUSAL_LM
        )
        
        self.logger.info(f"🎯 LoRA config: r={self.config.lora_r}, alpha={self.config.lora_alpha}")
        return lora_config
    
    def setup_training(self):
        """Setup LoRA model and trainer."""
        try:
            # Configure LoRA
            lora_config = self.configure_lora()
            
            # Create PEFT model
            self.peft_model = get_peft_model(self.model, lora_config)
            
            # Print trainable parameters
            self.peft_model.print_trainable_parameters()
            
            # Training arguments
            training_args = TrainingArguments(
                output_dir=self.config.output_dir,
                num_train_epochs=self.config.num_train_epochs,
                per_device_train_batch_size=self.config.per_device_train_batch_size,
                per_device_eval_batch_size=self.config.per_device_eval_batch_size,
                gradient_accumulation_steps=self.config.gradient_accumulation_steps,
                learning_rate=self.config.learning_rate,
                weight_decay=self.config.weight_decay,
                warmup_ratio=self.config.warmup_ratio,
                fp16=self.config.fp16,
                logging_steps=self.config.logging_steps,
                eval_steps=self.config.eval_steps,
                save_steps=self.config.save_steps,
                evaluation_strategy="steps",
                save_strategy="steps",
                load_best_model_at_end=True,
                metric_for_best_model="eval_loss",
                greater_is_better=False,
                report_to="wandb" if self.config.use_wandb else None,
                remove_unused_columns=False,
                dataloader_pin_memory=False  # For compatibility with quantized models
            )
            
            # Data collator
            data_collator = DataCollatorForLanguageModeling(
                tokenizer=self.tokenizer,
                mlm=False  # Causal LM, not masked LM
            )
            
            # Create trainer
            self.trainer = Trainer(
                model=self.peft_model,
                args=training_args,
                train_dataset=self.train_dataset,
                eval_dataset=self.val_dataset,
                data_collator=data_collator,
                callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
            )
            
            self.logger.info("✅ Training setup completed")
            
        except Exception as e:
            self.logger.error(f"❌ Training setup failed: {str(e)}")
            raise
    
    def train(self):
        """Train the LoRA model."""
        try:
            self.logger.info("🚀 Starting LoRA training")
            
            # Start training
            train_result = self.trainer.train()
            
            # Save the final model
            self.trainer.save_model()
            
            # Log training results
            self.logger.info(f"✅ Training completed in {train_result.metrics['train_runtime']:.2f} seconds")
            self.logger.info(f"📊 Final training loss: {train_result.metrics['train_loss']:.4f}")
            
            return train_result
            
        except Exception as e:
            self.logger.error(f"❌ Training failed: {str(e)}")
            raise
    
    def evaluate(self) -> Dict[str, float]:
        """Evaluate the trained model."""
        try:
            self.logger.info("📊 Evaluating model")
            
            # Standard evaluation
            eval_results = self.trainer.evaluate()
            
            # Custom persona consistency evaluation
            persona_metrics = self._evaluate_persona_consistency()
            
            # Combine results
            all_metrics = {**eval_results, **persona_metrics}
            
            self.logger.info(f"✅ Evaluation completed - Loss: {eval_results.get('eval_loss', 0):.4f}")
            
            return all_metrics
            
        except Exception as e:
            self.logger.error(f"❌ Evaluation failed: {str(e)}")
            return {}
    
    def _evaluate_persona_consistency(self) -> Dict[str, float]:
        """Evaluate persona consistency across generations."""
        try:
            if not self.test_dataset:
                return {}
            
            self.logger.info("🎭 Evaluating persona consistency")
            
            # Generate samples for each persona
            persona_scores = {}
            total_consistency = 0
            sample_count = 0
            
            # Sample test cases
            test_samples = self.test_dataset.prepared_data[:50]  # Limit for efficiency
            
            for sample in test_samples:
                persona_id = sample["persona_id"]
                
                # Generate content
                generated_content = self._generate_sample_content(sample["input_text"])
                
                # Evaluate consistency (simplified metric)
                consistency_score = self._calculate_consistency_score(
                    sample["target_text"],
                    generated_content,
                    sample["persona_id"]
                )
                
                if persona_id not in persona_scores:
                    persona_scores[persona_id] = []
                
                persona_scores[persona_id].append(consistency_score)
                total_consistency += consistency_score
                sample_count += 1
            
            # Calculate averages
            avg_consistency = total_consistency / sample_count if sample_count > 0 else 0
            
            persona_averages = {
                f"persona_{pid}_consistency": sum(scores) / len(scores)
                for pid, scores in persona_scores.items()
            }
            
            metrics = {
                "persona_consistency_overall": avg_consistency,
                **persona_averages
            }
            
            self.logger.info(f"🎭 Persona consistency: {avg_consistency:.3f}")
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"❌ Persona consistency evaluation failed: {str(e)}")
            return {}
    
    def _generate_sample_content(self, input_text: str) -> str:
        """Generate sample content for evaluation."""
        try:
            # Tokenize input
            inputs = self.tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=self.config.model_max_length // 2
            ).to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.peft_model.generate(
                    **inputs,
                    max_new_tokens=200,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode
            generated_text = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            )
            
            return generated_text.strip()
            
        except Exception as e:
            self.logger.error(f"❌ Sample generation failed: {str(e)}")
            return ""
    
    def _calculate_consistency_score(
        self,
        target_text: str,
        generated_text: str,
        persona_id: str
    ) -> float:
        """Calculate persona consistency score (simplified)."""
        # This is a simplified consistency metric
        # In practice, you'd want more sophisticated evaluation
        
        # Basic similarity check
        target_words = set(target_text.lower().split())
        generated_words = set(generated_text.lower().split())
        
        if len(target_words) == 0:
            return 0.0
        
        # Jaccard similarity
        intersection = len(target_words.intersection(generated_words))
        union = len(target_words.union(generated_words))
        
        similarity = intersection / union if union > 0 else 0.0
        
        # Length penalty
        length_ratio = min(len(generated_text), len(target_text)) / max(len(generated_text), len(target_text), 1)
        
        # Combined score
        consistency_score = (similarity * 0.7) + (length_ratio * 0.3)
        
        return consistency_score
    
    def test_model(self, test_prompts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Test the model with custom prompts."""
        try:
            self.logger.info(f"🧪 Testing model with {len(test_prompts)} prompts")
            
            results = []
            
            for prompt_data in test_prompts:
                # Create test dataset
                test_sample = [prompt_data]
                test_dataset = SocialMediaDataset(
                    test_sample,
                    self.tokenizer,
                    self.config.model_max_length
                )
                
                # Generate content
                input_text = test_dataset.prepared_data[0]["input_text"]
                generated_content = self._generate_sample_content(input_text)
                
                result = {
                    "input": prompt_data,
                    "input_text": input_text,
                    "generated_content": generated_content,
                    "quality_score": self._evaluate_generation_quality(generated_content)
                }
                
                results.append(result)
                
                self.logger.info(f"✅ Generated content for {prompt_data.get('platform', 'general')} prompt")
            
            return results
            
        except Exception as e:
            self.logger.error(f"❌ Model testing failed: {str(e)}")
            return []
    
    def _evaluate_generation_quality(self, generated_content: str) -> float:
        """Evaluate quality of generated content."""
        score = 0.5  # Base score
        
        # Length check
        if 50 <= len(generated_content) <= 500:
            score += 0.2
        
        # Engagement indicators
        engagement_words = ["!", "?", "💯", "🔥", "amazing", "great", "love"]
        if any(word in generated_content.lower() for word in engagement_words):
            score += 0.1
        
        # Coherence check (simplified)
        if len(generated_content.split()) > 5:
            score += 0.1
        
        # No repetition check
        words = generated_content.split()
        unique_ratio = len(set(words)) / len(words) if words else 0
        if unique_ratio > 0.8:
            score += 0.1
        
        return min(1.0, score)
    
    def save_model(self, save_path: Optional[str] = None):
        """Save the trained LoRA model."""
        try:
            if save_path is None:
                save_path = os.path.join(
                    self.config.output_dir,
                    f"lora_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                )
            
            Path(save_path).mkdir(parents=True, exist_ok=True)
            
            # Save LoRA model
            self.peft_model.save_pretrained(save_path)
            
            # Save tokenizer
            self.tokenizer.save_pretrained(save_path)
            
            # Save config
            config_path = os.path.join(save_path, "training_config.json")
            with open(config_path, 'w') as f:
                json.dump(self.config.__dict__, f, indent=2, default=str)
            
            self.logger.info(f"💾 Model saved to: {save_path}")
            return save_path
            
        except Exception as e:
            self.logger.error(f"❌ Model saving failed: {str(e)}")
            return None
    
    def load_model(self, model_path: str):
        """Load a trained LoRA model."""
        try:
            from peft import PeftModel
            
            # Load base model first
            self._initialize_model()
            
            # Load LoRA adapter
            self.peft_model = PeftModel.from_pretrained(
                self.model,
                model_path,
                device_map="auto" if self.device.type == "cuda" else None
            )
            
            self.logger.info(f"📂 Model loaded from: {model_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Model loading failed: {str(e)}")
            return False


def create_sample_training_data() -> List[Dict[str, Any]]:
    """Create sample training data for testing."""
    sample_data = [
        {
            "prompt": "Create content about fitness motivation",
            "content": "💪 Start your day with intention! Every rep, every step, every healthy choice is an investment in your future self. You've got this! 🔥 #FitnessMotivation #MondayMotivation",
            "platform": "instagram",
            "persona_context": {
                "persona_id": "fitness_influencer",
                "description": "Energetic fitness coach who motivates through positivity",
                "tone": "enthusiastic",
                "style": "motivational",
                "hashtags": ["#FitnessMotivation", "#HealthyLifestyle", "#WorkoutWednesday"]
            }
        },
        {
            "prompt": "Share a business tip",
            "content": "🚀 Pro tip: Your network is your net worth. But it's not about collecting contacts - it's about building genuine relationships. Quality > Quantity always. Who inspired you this week?",
            "platform": "x",
            "persona_context": {
                "persona_id": "business_coach",
                "description": "Experienced entrepreneur sharing business wisdom",
                "tone": "professional yet approachable",
                "style": "educational",
                "hashtags": ["#BusinessTips", "#Entrepreneur", "#Networking"]
            }
        },
        # Add more sample data...
    ]
    
    return sample_data


def main():
    """Main training function."""
    parser = argparse.ArgumentParser(description="LoRA Finetuning for Social Media Personas")
    parser.add_argument("--config", type=str, help="Path to config file")
    parser.add_argument("--data", type=str, help="Path to training data")
    parser.add_argument("--output", type=str, default="./lora_models", help="Output directory")
    parser.add_argument("--test", action="store_true", help="Run with sample data")
    
    args = parser.parse_args()
    
    # Load config
    if args.config and os.path.exists(args.config):
        with open(args.config, 'r') as f:
            config_dict = json.load(f)
        config = LoRATrainingConfig(**config_dict)
    else:
        config = LoRATrainingConfig()
    
    # Override output directory
    if args.output:
        config.output_dir = args.output
    
    # Initialize trainer
    trainer = PersonaConsistencyTrainer(config)
    
    # Load training data
    if args.test:
        print("🧪 Using sample training data")
        training_data = create_sample_training_data()
        # Duplicate for more training samples
        training_data = training_data * 20
    elif args.data and os.path.exists(args.data):
        print(f"📂 Loading training data from: {args.data}")
        with open(args.data, 'r') as f:
            training_data = json.load(f)
    else:
        print("❌ No training data provided. Use --test for sample data or --data for custom data.")
        return
    
    # Prepare data
    trainer.prepare_training_data(training_data)
    
    # Setup training
    trainer.setup_training()
    
    # Train model
    train_result = trainer.train()
    
    # Evaluate model
    eval_results = trainer.evaluate()
    
    # Save model
    model_path = trainer.save_model()
    
    # Test with sample prompts
    test_prompts = [
        {
            "prompt": "Create motivational fitness content",
            "platform": "instagram",
            "persona_context": {
                "persona_id": "fitness_influencer",
                "description": "Energetic fitness coach",
                "tone": "enthusiastic"
            }
        }
    ]
    
    test_results = trainer.test_model(test_prompts)
    
    print("\n🎯 Training Results:")
    print(f"Training Loss: {train_result.metrics.get('train_loss', 0):.4f}")
    print(f"Evaluation Loss: {eval_results.get('eval_loss', 0):.4f}")
    print(f"Persona Consistency: {eval_results.get('persona_consistency_overall', 0):.3f}")
    print(f"Model saved to: {model_path}")
    
    print("\n🧪 Test Generation:")
    for result in test_results:
        print(f"Platform: {result['input']['platform']}")
        print(f"Generated: {result['generated_content']}")
        print(f"Quality Score: {result['quality_score']:.3f}")
        print("-" * 50)


if __name__ == "__main__":
    main() 