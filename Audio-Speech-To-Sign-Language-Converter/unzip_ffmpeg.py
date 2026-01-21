import zipfile
import shutil
import os

print("Extracting ffmpeg.zip...")
with zipfile.ZipFile('ffmpeg.zip', 'r') as zip_ref:
    zip_ref.extractall('.')

print("Searching for ffmpeg.exe...")
found = False
for root, dirs, files in os.walk('.'):
    if 'ffmpeg.exe' in files:
        src = os.path.join(root, 'ffmpeg.exe')
        dst = 'ffmpeg.exe'
        print(f"Moving {src} to {dst}")
        shutil.move(src, dst)
        found = True
        break

if found:
    print("Success: ffmpeg.exe extracted.")
else:
    print("Error: ffmpeg.exe not found in zip.")
