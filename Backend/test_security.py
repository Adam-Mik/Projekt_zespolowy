import requests
import time

BASE_URL = 'http://127.0.0.1:8000'

def get_token(username):

    user_data = {"username": username, "password": "password123"}
    requests.post(f"{BASE_URL}/users/", json=user_data)

    resp = requests.post(f"{BASE_URL}/api/login/", json=user_data)
    return resp.json()['token']

def run_security_test():
    print("--- ROZPOCZYNAMY TEST BEZPIECZEŃSTWA ---")


    token_victim = get_token(f"ofiara_{int(time.time())}")
    headers_victim = {'Authorization': f'Token {token_victim}'}
    
    g_resp = requests.post(f"{BASE_URL}/api/groups/", 
                           json={"name": "Tajne Finanse Ofiary"}, 
                           headers=headers_victim)
    group_id_victim = g_resp.json()['id']
    print(f"Ofiara utworzyła grupę: {group_id_victim}")

    token_hacker = get_token(f"hacker_{int(time.time())}")
    headers_hacker = {'Authorization': f'Token {token_hacker}'}
    print("Haker zalogowany.")

    print("Haker pobiera listę grup...")
    list_resp = requests.get(f"{BASE_URL}/api/groups/", headers=headers_hacker)
    groups = list_resp.json()
    
    found = False
    for group in groups:
        if group['id'] == group_id_victim:
            found = True
    
    if found:
        print("BŁĄD! Haker widzi grupę ofiary!")
    else:
        print("SUKCES! Haker nie widzi grupy ofiary. Lista grup hakera jest pusta (lub zawiera tylko jego własne).")

    print(f"Haker próbuje wejść w grupę ID: {group_id_victim}...")
    direct_resp = requests.get(f"{BASE_URL}/api/groups/{group_id_victim}/", headers=headers_hacker)
    
    if direct_resp.status_code == 404:
         print(f"SUKCES! Serwer odpowiedział: {direct_resp.status_code} Not Found.")
    else:
         print(f"BŁĄD! Serwer pozwolił na dostęp! Kod: {direct_resp.status_code}")

if __name__ == "__main__":
    run_security_test()