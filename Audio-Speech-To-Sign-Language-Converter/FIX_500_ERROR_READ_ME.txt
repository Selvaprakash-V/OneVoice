CRITICAL: FFmpeg is required for Speech-to-Text conversion.

The "500 Internal Server Error" is occurring because the server cannot find `ffmpeg.exe` to convert your audio recording.

HOW TO FIX:

1. Download FFmpeg Essentials:
   https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip

2. Extract the ZIP file.

3. Go into the 'bin' folder of the extracted files.

4. COPY "ffmpeg.exe" (and "ffprobe.exe" if you want).

5. PASTE it into THIS directory (where manage.py is located):
   d:\Vscode\sign language\onevoice\OneVoice\Audio-Speech-To-Sign-Language-Converter\

6. Restart the server:
   Use Ctrl+C to stop it, then run: python manage.py runserver 0.0.0.0:8000

Once ffmpeg.exe is in this folder, the app will work perfectly!
