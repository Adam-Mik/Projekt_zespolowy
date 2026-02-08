import requests
import time
from datetime import datetime

# Konfiguracja
BASE_URL = 'http://127.0.0.1:8000' # Bez /api, bo dodajemy w kodzie
USERNAME = f"test_user_{int(time.time())}" # Unikalna nazwa za każdym razem
PASSWORD = "password123"

def print_step(step_name):
    print(f"\n{'='*10} {step_name} {'='*10}")

def run_test():
    print_step("1. Rejestracja i Logowanie")
    
    reg_data = {"username": USERNAME, "password": PASSWORD}
    print(f"Próba rejestracji użytkownika: {USERNAME}")
    
    reg_resp = requests.post(f"{BASE_URL}/users/", json=reg_data)
    
    if reg_resp.status_code != 201:
        print(f"BŁĄD REJESTRACJI! Kod: {reg_resp.status_code}")
        print("Treść błędu:", reg_resp.text)
        return
    else:
        print("Rejestracja udana.")

    auth_resp = requests.post(f"{BASE_URL}/api/login/", json=reg_data)
    
    if auth_resp.status_code != 200:
        print("Błąd logowania!", auth_resp.text)
        return

    token = auth_resp.json()['token']
    headers = {'Authorization': f'Token {token}'}
    print(f"Zalogowano! Token: {token[:10]}...")

    print_step("2. Tworzenie Grupy")
    group_data = {"name": "Testowa Grupa"}
    group_resp = requests.post(f"{BASE_URL}/api/groups/", json=group_data, headers=headers)
    
    if group_resp.status_code != 201:
        print(f"BŁĄD TWORZENIA GRUPY! Kod: {group_resp.status_code}")
        print("Treść błędu z serwera:", group_resp.text)
        return

    group_id = group_resp.json()['id']
    print(f"Utworzono grupę: {group_data['name']} (ID: {group_id})")

    print_step("3. Zapisujemy czas ostatniej synchronizacji")

    last_sync_time = datetime.utcnow().isoformat() + "Z"
    print(f"Czas synchronizacji telefonu: {last_sync_time}")
    time.sleep(2) 

    print_step("4. Ktoś dodaje wydatek na serwerze...")
    
    expense_data = {
        "name": "Pizza",
        "amount": "45.50",
        "group": group_id,
        "description": "Wieczorne kodowanie"
    }
    exp_resp = requests.post(f"{BASE_URL}/api/expenses/", json=expense_data, headers=headers)
    expense_id = exp_resp.json()['id']
    print(f"Dodano wydatek na serwerze: Pizza (ID: {expense_id})")

    print_step("5. Telefon pyta: 'Co się zmieniło od ostatniej synchronizacji?'")
    
    sync_url = f"{BASE_URL}/api/expenses/?last_sync={last_sync_time}"
    sync_resp = requests.get(sync_url, headers=headers)
    
    data = sync_resp.json()
    print(f"Serwer zwrócił {len(data)} nowych elementów.")
    
    if len(data) > 0:
        print(f"Szczegóły: {data[0]['name']} - updated_at: {data[0]['updated_at']}")
        if data[0]['id'] == expense_id:
            print("SUKCES! Telefon pobrał nowy wydatek.")
    else:
        print("BŁĄD! Telefon nie widzi nowego wydatku.")

    print_step("6. Usuwamy wydatek na serwerze")

    last_sync_time_2 = datetime.utcnow().isoformat() + "Z"
    time.sleep(2)
    
    requests.delete(f"{BASE_URL}/api/expenses/{expense_id}/", headers=headers)
    print("Wydatek usunięty (DELETE request wysłany).")

    print_step("7. Telefon pyta o zmiany po usunięciu")
    
    sync_url_2 = f"{BASE_URL}/api/expenses/?last_sync={last_sync_time_2}"
    sync_resp_2 = requests.get(sync_url_2, headers=headers)
    
    data_deleted = sync_resp_2.json()
    
    if len(data_deleted) > 0:
        item = data_deleted[0]
        print(f"Pobrany element: ID={item['id']}, is_deleted={item['is_deleted']}")
        
        if item['is_deleted'] is True:
            print("SUKCES! Telefon wie, że musi usunąć ten wydatek lokalnie.")
        else:
            print("BŁĄD! is_deleted jest False.")
    else:
        print("BŁĄD! Serwer nie zwrócił usuniętego elementu.")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"\nWystąpił błąd połączenia: {e}")
        print("Upewnij się, że serwer działa na porcie 8000.")