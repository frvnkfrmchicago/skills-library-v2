import os
import sqlite3
import subprocess
import shutil
import json
import sys
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def get_chrome_key():
    cmd = ['security', 'find-generic-password', '-w', '-s', 'Chrome Safe Storage', '-a', 'Chrome']
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise Exception("Failed to get Keychain key from macOS. Please approve access.")
    return res.stdout.strip().encode('utf-8')

def decrypt_value(encrypted_value, key):
    if not encrypted_value:
        return ""
    if encrypted_value.startswith(b'v10') or encrypted_value.startswith(b'v11'):
        ciphertext = encrypted_value[3:]
        iv = b' ' * 16
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA1(),
            length=16,
            salt=b'saltysalt',
            iterations=1003
        )
        derived_key = kdf.derive(key)
        cipher = Cipher(algorithms.AES(derived_key), modes.CBC(iv))
        decryptor = cipher.decryptor()
        decrypted = decryptor.update(ciphertext) + decryptor.finalize()
        decrypted = decrypted[32:]
        padding_len = decrypted[-1]
        if padding_len < 1 or padding_len > 16:
            return decrypted.decode('utf-8', errors='ignore')
        return decrypted[:-padding_len].decode('utf-8', errors='ignore')
    return encrypted_value.decode('utf-8', errors='ignore')

def main():
    profile_folder = "Profile 1"
    if len(sys.argv) > 1:
        profile_folder = sys.argv[1]

    cookie_db = os.path.expanduser(f'~/Library/Application Support/Google/Chrome/{profile_folder}/Cookies')
    if not os.path.exists(cookie_db):
        print(f"Error: Chrome cookie database not found for {profile_folder} at {cookie_db}")
        return

    print(f"Requesting Chrome key for profile: {profile_folder}...")
    try:
        key = get_chrome_key()
    except Exception as e:
        print(f"Keychain error: {e}")
        return

    temp_db = '/tmp/chrome_chatgpt_cookies_temp'
    shutil.copyfile(cookie_db, temp_db)

    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    # Query for OpenAI and ChatGPT sessions
    query = """
    SELECT host_key, name, path, is_secure, is_httponly, expires_utc, encrypted_value, samesite
    FROM cookies
    WHERE host_key LIKE '%openai.com' 
       OR host_key LIKE '%chatgpt.com' 
       OR host_key LIKE '%oaistatic.com'
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    if os.path.exists(temp_db):
        os.remove(temp_db)

    formatted_cookies = []
    print(f"Found {len(rows)} cookies in Chrome database.")

    for row in rows:
        host, name, path, secure, httponly, expires_utc, enc_val, samesite_val = row
        try:
            val = decrypt_value(enc_val, key)
        except Exception:
            continue
            
        same_site = "Lax"
        if samesite_val == -1 or samesite_val == 0:
            same_site = "None"
        elif samesite_val == 1:
            same_site = "Lax"
        elif samesite_val == 2:
            same_site = "Strict"

        expires = 0
        if expires_utc > 0:
            expires = (expires_utc / 1000000) - 11644473600
            
        cookie_obj = {
            "name": name,
            "value": val,
            "domain": host,
            "path": path,
            "expires": expires,
            "httpOnly": bool(httponly),
            "secure": bool(secure),
            "sameSite": same_site
        }
        formatted_cookies.append(cookie_obj)

    output_file = "/Users/franklawrencejr./Downloads/skills-library-v2 2/chatgpt_cookies_profile1.json"
    with open(output_file, "w") as f:
        json.dump({"cookies": formatted_cookies}, f, indent=2)
        
    print(f"\n[SUCCESS] Decrypted and saved ChatGPT cookies to: {output_file}")
    print("You can now SCP this file to your VM for the content agents to use.")

if __name__ == '__main__':
    main()
