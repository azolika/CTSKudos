import urllib.request
import urllib.parse
import json

def test_login():
    url = 'http://localhost:8000/auth/login'
    data = urllib.parse.urlencode({
        'username': 'admin@cargotrack.ro',
        'password': 'Cargo2025!@#'
    }).encode('utf-8')
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"Status: {status}")
            print(f"Response: {body}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
