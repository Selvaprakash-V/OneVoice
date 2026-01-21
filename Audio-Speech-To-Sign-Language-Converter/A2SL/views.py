from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login,logout
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
from django.contrib.staticfiles import finders
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
import speech_recognition as sr
from pydub import AudioSegment
import os, time
import tempfile

def home_view(request):
	return render(request,'home.html')


def about_view(request):
	return render(request,'about.html')


def contact_view(request):
	return render(request,'contact.html')

@login_required(login_url="login")
def animation_view(request):
	if request.method == 'POST':
		text = request.POST.get('sen')
		words = process_speech_to_sign(text)
		return render(request,'animation.html',{'words':words,'text':text})
	else:
		return render(request,'animation.html')


@csrf_exempt
def animation_api(request):
	if request.method == 'POST':
		try:
			# Handle both JSON and Form data
			if request.content_type == 'application/json':
				data = json.loads(request.body)
				text = data.get('sen')
			else:
				text = request.POST.get('sen')

			if not text:
				return JsonResponse({'error': 'No text provided'}, status=400)

			words = process_speech_to_sign(text)
			return JsonResponse({'words': words, 'text': text, 'status': 'success'})
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	return JsonResponse({'error': 'POST method required'}, status=405)


import base64
import cv2
import numpy as np
from .SignRecog import recognizer

@csrf_exempt
def predict_sign_view(request):
    """
    Receives a Base64 image, runs it through the Sign Language Model,
    and returns the predicted letter.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image_b64 = data.get('image')
            
            if not image_b64:
                return JsonResponse({'error': 'No image provided'}, status=400)

            # Decode Base64 to Image
            image_bytes = base64.b64decode(image_b64)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                return JsonResponse({'error': 'Invalid image format'}, status=400)

            # PREDICT
            prediction = recognizer.predict(frame)
            
            return JsonResponse({
                'prediction': prediction,
                'status': 'success'
            })

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'POST method required'}, status=405)


@csrf_exempt
def speech_to_text_api(request):
    def safe_remove(path):
        if not path: return
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            try:
                time.sleep(0.5)
                if os.path.exists(path):
                    os.remove(path)
            except OSError as e:
                print(f"Warning: Could not remove {path}: {e}")

    # Configure pydub to look for ffmpeg in the current directory
    ffmpeg_exe = 'ffmpeg.exe'
    project_root = os.path.dirname(os.path.abspath(__file__)) # A2SL directory
    base_dir = os.path.dirname(project_root) # Main Django folder
    
    # Try multiple paths for ffmpeg
    possible_paths = [
        os.path.join(base_dir, ffmpeg_exe),
        os.path.join(project_root, ffmpeg_exe),
        r"C:\ffmpeg\bin\ffmpeg.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            AudioSegment.converter = path
            break

    if request.method == 'POST':
        try:
            if 'audio' not in request.FILES:
                return JsonResponse({'error': 'No audio file provided'}, status=400)
            
            audio_file = request.FILES['audio']
            
            # Save temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as temp_audio:
                for chunk in audio_file.chunks():
                    temp_audio.write(chunk)
                temp_audio_path = temp_audio.name

            # Find ffmpeg again for subprocess usage
            ffmpeg_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    ffmpeg_path = path
                    break
            
            if not ffmpeg_path:
                 return JsonResponse({
                    'error': 'ffmpeg.exe not found. Please place it in the project root.'
                }, status=500)

            # Convert to WAV using subprocess (more robust than pydub if ffprobe is missing)
            wav_path = temp_audio_path.replace('.m4a', '.wav')
            try:
                import subprocess
                # ffmpeg -i input -ac 1 (mono) output.wav -y (overwrite)
                command = [
                    ffmpeg_path, 
                    '-y', 
                    '-i', temp_audio_path, 
                    '-ac', '1', 
                    wav_path
                ]
                print(f"Executing: {' '.join(command)}")
                
                # Run ffmpeg with captured output for debugging
                result = subprocess.run(
                    command, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE,
                    text=True,
                    check=True
                )
                
            except subprocess.CalledProcessError as e:
                safe_remove(temp_audio_path)
                print(f"FFMPEG ERROR: {e.stderr}")
                return JsonResponse({
                    'error': f'Audio conversion failed (ffmpeg error). Details: {e.stderr[-200:]}'
                }, status=500)
            except Exception as e:
                safe_remove(temp_audio_path)
                print(f"Conversion Exception: {str(e)}")
                import traceback
                traceback.print_exc()
                return JsonResponse({
                    'error': f'Audio conversion internal error: {str(e)}'
                }, status=500)

            # --- GOOGLE CLOUD SPEECH PROCESS ---
            from google.cloud import speech
            
            # Path to your service account key
            key_path = os.path.join(base_dir, 'A2SL', 'credentials', 'service_account.json')
            
            if not os.path.exists(key_path):
                 safe_remove(temp_audio_path)
                 safe_remove(wav_path)
                 return JsonResponse({
                    'error': 'Missing Google Cloud Key. Please put "service_account.json" in A2SL/credentials/'
                 }, status=500)

            # Initialize Client
            client = speech.SpeechClient.from_service_account_json(key_path)

            # Read the WAV file
            with open(wav_path, "rb") as audio_file:
                content = audio_file.read()

            audio = speech.RecognitionAudio(content=content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
                language_code="en-US",
                enable_automatic_punctuation=False,
            )

            try:
                response = client.recognize(config=config, audio=audio)
                
                # Cleanup files
                safe_remove(temp_audio_path)
                safe_remove(wav_path)

                if not response.results:
                    return JsonResponse({'text': '', 'status': 'success'})

                # Get transcript from first result
                transcript = response.results[0].alternatives[0].transcript
                return JsonResponse({'text': transcript, 'status': 'success'})

            except Exception as google_error:
                safe_remove(temp_audio_path)
                safe_remove(wav_path)
                return JsonResponse({'error': f'Google API Error: {str(google_error)}'}, status=500)

        except Exception as e:
            print(f"OUTER ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
            
    return JsonResponse({'error': 'POST method required'}, status=405)


import re
import string

def process_speech_to_sign(text):
	#tokenizing the sentence
	text = text.lower()
	#remove punctuation
	text = re.sub(r'[^\w\s]', '', text)
	#tokenizing the sentence
	words = word_tokenize(text)

	tagged = nltk.pos_tag(words)
	tense = {}
	tense["future"] = len([word for word in tagged if word[1] == "MD"])
	tense["present"] = len([word for word in tagged if word[1] in ["VBP", "VBZ","VBG"]])
	tense["past"] = len([word for word in tagged if word[1] in ["VBD", "VBN"]])
	tense["present_continuous"] = len([word for word in tagged if word[1] in ["VBG"]])

	#stopwords that will be removed
	stop_words = set(["mightn't", 're', 'wasn', 'wouldn', 'be', 'has', 'that', 'does', 'shouldn', 'do', "you've",'off', 'for', "didn't", 'm', 'ain', 'haven', "weren't", 'are', "she's", "wasn't", 'its', "haven't", "wouldn't", 'don', 'weren', 's', "you'd", "don't", 'doesn', "hadn't", 'is', 'was', "that'll", "should've", 'a', 'then', 'the', 'mustn', 'i', 'nor', 'as', "it's", "needn't", 'd', 'am', 'have',  'hasn', 'o', "aren't", "you'll", "couldn't", "you're", "mustn't", 'didn', "doesn't", 'll', 'an', 'hadn', 'whom', 'y', "hasn't", 'itself', 'couldn', 'needn', "shan't", 'isn', 'been', 'such', 'shan', "shouldn't", 'aren', 'being', 'were', 'did', 'ma', 't', 'having', 'mightn', 've', "isn't", "won't"])

	#removing stopwords and applying lemmatizing nlp process to words
	lr = WordNetLemmatizer()
	filtered_text = []
	for w,p in zip(words,tagged):
		if w not in stop_words:
			if p[1]=='VBG' or p[1]=='VBD' or p[1]=='VBZ' or p[1]=='VBN' or p[1]=='NN':
				filtered_text.append(lr.lemmatize(w,pos='v'))
			elif p[1]=='JJ' or p[1]=='JJR' or p[1]=='JJS'or p[1]=='RBR' or p[1]=='RBS':
				filtered_text.append(lr.lemmatize(w,pos='a'))

			else:
				filtered_text.append(lr.lemmatize(w))

	#adding the specific word to specify tense
	words = filtered_text
	temp=[]
	for w in words:
		if w=='I':
			temp.append('Me')
		else:
			temp.append(w)
	words = temp
	probable_tense = max(tense,key=tense.get)

	if probable_tense == "past" and tense["past"]>=1:
		temp = ["Before"]
		temp = temp + words
		words = temp
	elif probable_tense == "future" and tense["future"]>=1:
		if "Will" not in words:
				temp = ["Will"]
				temp = temp + words
				words = temp
		else:
			pass
	elif probable_tense == "present":
		if tense["present_continuous"]>=1:
			temp = ["Now"]
			temp = temp + words
			words = temp

	filtered_text = []
	for w in words:
		path = w + ".mp4"
		f = finders.find(path)
		#splitting the word if its animation is not present in database
		if not f:
			for c in w:
				filtered_text.append(c)
		#otherwise animation of word
		else:
			filtered_text.append(w)
	words = filtered_text;
	return words




def signup_view(request):
	if request.method == 'POST':
		form = UserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()
			login(request,user)
			# log the user in
			return redirect('animation')
	else:
		form = UserCreationForm()
	return render(request,'signup.html',{'form':form})



def login_view(request):
	if request.method == 'POST':
		form = AuthenticationForm(data=request.POST)
		if form.is_valid():
			#log in user
			user = form.get_user()
			login(request,user)
			if 'next' in request.POST:
				return redirect(request.POST.get('next'))
			else:
				return redirect('animation')
	else:
		form = AuthenticationForm()
	return render(request,'login.html',{'form':form})


def logout_view(request):
	logout(request)
	return redirect("home")
