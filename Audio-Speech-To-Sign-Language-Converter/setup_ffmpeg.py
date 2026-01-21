import urllib.request
import zipfile
import shutil
import os
import ssl

# Bypass SSL verification if needed (sometimes helps with custom certs/proxies)
ssl._create_default_https_context = ssl._create_unverified_context

url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
zip_path = "ffmpeg.zip"

print(f"Downloading {url}...")
try:
    urllib.request.urlretrieve(url, zip_path)
    print("Download complete.")

    print("Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall('ffmpeg_temp')

    print("Searching for ffmpeg.exe...")
    found = False
    for root, dirs, files in os.walk('ffmpeg_temp'):
        if 'ffmpeg.exe' in files:
            src = os.path.join(root, 'ffmpeg.exe')
            dst = 'ffmpeg.exe'
            print(f"Moving {src} to {dst}")
            if os.path.exists(dst):
                os.remove(dst)
            shutil.move(src, dst)
            found = True
            break

    if found:
        print("Success: ffmpeg.exe installed.")
    else:
        print("Error: ffmpeg.exe not found in zip.")

    # Cleanup
    print("Cleaning up...")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    if os.path.exists('ffmpeg_temp'):
        shutil.rmtree('ffmpeg_temp')

except Exception as e:
    print(f"FAILED: {e}")
