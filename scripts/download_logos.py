import urllib.request
import urllib.parse
import json
import re
import os

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "logos"))
os.makedirs(OUT_DIR, exist_ok=True)

headers = {
    'User-Agent': 'CashOutChargeApp/1.0 (https://tanymbarakah.github.io; contact@tanymbarakah.me)'
}

def download_file(url, filename):
    dest = os.path.join(OUT_DIR, filename)
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
        f.write(resp.read())
    print(f"Downloaded {filename} ({os.path.getsize(dest)} bytes)")
    return dest

# Check bKash website
try:
    req = urllib.request.Request('https://www.bkash.com/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        matches = re.findall(r'src=["\']([^"\']*(?:logo|Logo)[^"\']*)["\']', html)
        print("bKash matches:", matches[:10])
        for m in matches:
            if 'logo' in m.lower():
                full_url = m if m.startswith('http') else urllib.parse.urljoin('https://www.bkash.com/', m)
                print("Downloading bKash from:", full_url)
                ext = 'svg' if 'svg' in m.lower() else 'png'
                download_file(full_url, f'bkash.{ext}')
                break
except Exception as e:
    print("bKash error:", e)

# Check Upay website
try:
    req = urllib.request.Request('https://www.upaybd.com/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        matches = re.findall(r'src=["\']([^"\']*(?:logo|Logo)[^"\']*)["\']', html)
        print("Upay matches:", matches[:10])
        for m in matches:
            if 'logo' in m.lower():
                full_url = m if m.startswith('http') else urllib.parse.urljoin('https://www.upaybd.com/', m)
                print("Downloading Upay from:", full_url)
                ext = 'svg' if 'svg' in m.lower() else 'png'
                download_file(full_url, f'upay.{ext}')
                break
except Exception as e:
    print("Upay error:", e)
