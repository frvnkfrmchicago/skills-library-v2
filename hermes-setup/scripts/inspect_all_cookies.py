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

def scan_profile(chrome_dir, profile_folder, key):
    cookie_db = os.path.join(chrome_dir, profile_folder, 'Cookies')
    if not os.path.exists(cookie_db):
        return None
        
    temp_db = f'/tmp/chrome_inspect_{profile_folder}'
    try:
        shutil.copyfile(cookie_db, temp_db)
    except Exception:
        return None

    conn = sqlite3.connect(temp_db)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT host_key, name, encrypted_value FROM cookies")
        rows = cursor.fetchall()
    except Exception:
        rows = []
        
    conn.close()
    if os.path.exists(temp_db):
        os.remove(temp_db)

    # Let's count cookies per domain and look for specific auth markers
    domain_sessions = {}
    for host, name, enc_val in rows:
        # Normalize domain name
        domain = host.lstrip('.')
        if domain not in domain_sessions:
            domain_sessions[domain] = {
                "total_cookies": 0,
                "has_auth": False,
                "auth_keys": []
            }
        
        domain_sessions[domain]["total_cookies"] += 1
        
        # Check for typical session/auth cookie names
        lower_name = name.lower()
        is_auth = any(marker in lower_name for marker in ["session", "sid", "auth", "token", "login", "jwt", "key", "secret"])
        
        # Specific site markers
        if "google" in domain and name in ["SID", "HSID", "SSID", "SAPISID", "APISID"]:
            domain_sessions[domain]["has_auth"] = True
            domain_sessions[domain]["auth_keys"].append(name)
        elif "mobbin" in domain and name in ["session", "token", "next-auth.session-token"]:
            domain_sessions[domain]["has_auth"] = True
            domain_sessions[domain]["auth_keys"].append(name)
        elif is_auth:
            domain_sessions[domain]["auth_keys"].append(name)
            if len(domain_sessions[domain]["auth_keys"]) >= 2 or name in ["sessionid", "csrftoken", "token"]:
                domain_sessions[domain]["has_auth"] = True

    return domain_sessions

def main():
    chrome_dir = os.path.expanduser('~/Library/Application Support/Google/Chrome')
    if not os.path.exists(chrome_dir):
        print("Chrome directory not found.")
        return

    print("Requesting Chrome Safe Storage key from macOS Keychain...")
    try:
        key = get_chrome_key()
    except Exception as e:
        print(f"Keychain error: {e}")
        return

    profiles = [d for d in os.listdir(chrome_dir) if d == 'Default' or d.startswith('Profile ')]
    
    print("\nStarting Chrome Cookie Authentication Scan...")
    print("========================================================================\n")
    
    interesting_domains = ["google.com", "accounts.google.com", "mobbin.com", "mobbin.co", "threads.net", "threads.com", "github.com", "instagram.com"]

    profile_summaries = {}

    for p in sorted(profiles):
        res = scan_profile(chrome_dir, p, key)
        if not res:
            continue
            
        profile_summaries[p] = res
        
        # Look for target domains
        found_targets = []
        for domain, info in res.items():
            for target in interesting_domains:
                if domain == target or domain.endswith("." + target):
                    if info["has_auth"] or len(info["auth_keys"]) > 0:
                        found_targets.append((domain, info["auth_keys"]))
                        
        if found_targets:
            print(f"Profile: {p}")
            print("-" * 50)
            for dom, keys in found_targets:
                print(f"  Authenticated on: {dom} (Auth Keys: {', '.join(keys[:5])})")
            print()

if __name__ == '__main__':
    main()
