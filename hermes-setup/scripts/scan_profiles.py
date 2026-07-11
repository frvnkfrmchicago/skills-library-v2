import os
import sqlite3
import subprocess
import shutil
import json
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
    chrome_dir = os.path.expanduser('~/Library/Application Support/Google/Chrome')
    if not os.path.exists(chrome_dir):
        print("Chrome directory not found.")
        return

    try:
        key = get_chrome_key()
    except Exception as e:
        print(f"Keychain error: {e}")
        return

    profiles = [d for d in os.listdir(chrome_dir) if d == 'Default' or d.startswith('Profile ')]
    
    print(f"{'Profile':<15} | {'Domain':<20} | {'Cookie Name':<12} | {'User ID':<15} | {'Value (truncated)':<30}")
    print("-" * 100)

    for p in profiles:
        cookie_db = os.path.join(chrome_dir, p, 'Cookies')
        if not os.path.exists(cookie_db):
            continue
            
        temp_db = '/tmp/chrome_scan_temp'
        try:
            shutil.copyfile(cookie_db, temp_db)
        except Exception:
            continue

        conn = sqlite3.connect(temp_db)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT host_key, name, encrypted_value 
                FROM cookies 
                WHERE (host_key LIKE '%threads.com' OR host_key LIKE '%threads.net') 
                  AND name IN ('sessionid', 'ds_user_id')
            """)
            rows = cursor.fetchall()
        except Exception:
            rows = []
            
        conn.close()
        if os.path.exists(temp_db):
            os.remove(temp_db)

        for host, name, enc_val in rows:
            try:
                val = decrypt_value(enc_val, key)
            except Exception:
                val = "[Decryption Failed]"
                
            truncated_val = val[:25] + "..." if len(val) > 25 else val
            
            # Extract user id if it's ds_user_id or from sessionid
            uid = ""
            if name == 'ds_user_id':
                uid = val
            elif name == 'sessionid' and '%' in val:
                uid = val.split('%')[0]
                
            print(f"{p:<15} | {host:<20} | {name:<12} | {uid:<15} | {truncated_val:<30}")

if __name__ == '__main__':
    main()
