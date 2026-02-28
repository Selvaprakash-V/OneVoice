from huggingface_hub import hf_hub_download
import torch
import torch.nn as nn
from torchvision import models, transforms
import cv2
import mediapipe as mp
import numpy as np
import os
from django.conf import settings

# --- CONFIGURATION ---
REPO_ID = "huzaifanasirrr/realtime-sign-language-translator"
FILENAME = "model.pth"  # Adjust if the name is different in the repo
MODEL_DIR = os.path.join(settings.BASE_DIR, 'A2SL', 'models')
MODEL_PATH = os.path.join(MODEL_DIR, FILENAME)

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

class SignLanguageRecognizer:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.labels = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ") # 26 Classes
        
        # MediaPipe Hands
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True, 
            max_num_hands=1, 
            min_detection_confidence=0.5
        )

        # Transformation Pipeline
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self.load_model()

    def download_model_if_needed(self):
        """Downloads the model from Hugging Face if not present."""
        if not os.path.exists(MODEL_PATH):
            print(f"Downloading model form {REPO_ID}...")
            try:
                hf_hub_download(repo_id=REPO_ID, filename=FILENAME, local_dir=MODEL_DIR)
                print("Model downloaded successfully!")
            except Exception as e:
                print(f"FAILED to download model: {e}")
                # Fallback: Create a dummy file or handle error?
                pass
        else:
            print("Model already exists locally.")

    def load_model(self):
        """Loads the ResNet18 model with custom weights."""
        self.download_model_if_needed()
        
        try:
            # Initialize ResNet18
            self.model = models.resnet18(pretrained=False)
            num_ftrs = self.model.fc.in_features
            self.model.fc = nn.Linear(num_ftrs, 26) # 26 classes for A-Z
            
            # Load Weights
            if os.path.exists(MODEL_PATH):
                checkpoint = torch.load(MODEL_PATH, map_location=self.device)
                self.model.load_state_dict(checkpoint)
                self.model.to(self.device)
                self.model.eval()
                print("Sign Language Model Loaded Successfully!")
            else:
                print("Warning: Model file missing. Recognition will not work.")
        
        except Exception as e:
            print(f"Error loading model: {e}")

    def predict(self, frame_np):
        """
        Takes an OpenCV image (numpy array), crops hand, and predicts letter.
        Returns: (str) Predicted Letter or None
        """
        if self.model is None:
            return None

        # 1. Hand Detection
        results = self.hands.process(cv2.cvtColor(frame_np, cv2.COLOR_BGR2RGB))
        
        if not results.multi_hand_landmarks:
            return "No Hand"

        # 2. Crop Hand (Bounding Box)
        h, w, _ = frame_np.shape
        hand_landmarks = results.multi_hand_landmarks[0]
        
        x_min, y_min = w, h
        x_max, y_max = 0, 0
        
        for lm in hand_landmarks.landmark:
            x, y = int(lm.x * w), int(lm.y * h)
            x_min = min(x_min, x)
            y_min = min(y_min, y)
            x_max = max(x_max, x)
            y_max = max(y_max, y)

        # Add Padding
        padding = 20
        x_min = max(0, x_min - padding)
        y_min = max(0, y_min - padding)
        x_max = min(w, x_max + padding)
        y_max = min(h, y_max + padding)

        hand_img = frame_np[y_min:y_max, x_min:x_max]
        
        if hand_img.size == 0:
            return "Error"

        # 3. Predict with Model
        img_tensor = self.transform(hand_img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(img_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_char = self.labels[predicted.item()]
            
        return predicted_char

# Global Instance
recognizer = SignLanguageRecognizer()
