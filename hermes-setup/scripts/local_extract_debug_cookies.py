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
        raise Exception("Failed to get Keychain key.")
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
    cookie_db = os.path.expanduser('~/.chrome-debug-profile/Default/Cookies')
    if not os.path.exists(cookie_db):
        print(f"Error: Chrome debug cookie database not found at {cookie_db}")
        return

    print("Requesting Chrome key...")
    try:
        key = get_chrome_key()
    except Exception as e:
        print(e)
        return

    temp_db = '/tmp/chrome_debug_cookies_temp'
    shutil.copyfile(cookie_db, temp_db)

    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT host_key, name, path, is_secure, is_httponly, expires_utc, encrypted_value, samesite
        FROM cookies
        WHERE host_key LIKE '%threads.com' OR host_key LIKE '%threads.net' OR host_key LIKE '%instagram.com' OR host_key LIKE '%facebook.com'
    """)
    rows = cursor.fetchall()
    conn.close()
    if os.path.exists(temp_db):
        os.remove(temp_db)

    formatted_cookies = []
    threads_com_cookies = []
    threads_net_cookies = []

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
        if host.endswith("threads.com"):
            threads_com_cookies.append(cookie_obj)
        elif host.endswith("threads.net"):
            threads_net_cookies.append(cookie_obj)

    net_names = {c["name"] for c in threads_net_cookies}
    for c in threads_com_cookies:
        if c["name"] not in net_names:
            dup = c.copy()
            dup["domain"] = c["domain"].replace("threads.com", "threads.net")
            formatted_cookies.append(dup)

    com_names = {c["name"] for c in threads_com_cookies}
    for c in threads_net_cookies:
        if c["name"] not in com_names:
            dup = c.copy()
            dup["domain"] = c["domain"].replace("threads.net", "threads.com")
            formatted_cookies.append(dup)

    output_file = "/Users/franklawrencejr./Downloads/skills-library-v2 2/threads_cookies_grazzhopper_fresh.json"
    with open(output_file, "w") as f:
        json.dump({"cookies": formatted_cookies}, f, indent=2)
    print(f"Decrypted and saved cookies to {output_file}")

if __name__ == '__main__':
    main()
