import urllib.request
import urllib.parse
import json

def test_admin_stats():
    # 1. Login
    login_url = 'http://localhost:8000/auth/login'
    login_data = urllib.parse.urlencode({
        'username': 'admin@cargotrack.ro',
        'password': 'Cargo2025!@#'
    }).encode('utf-8')
    
    req = urllib.request.Request(login_url, data=login_data)
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode('utf-8'))
            token = body['access_token']
            print(f"Login successful, token acquired.")
            
            # 2. Get stats
            stats_url = 'http://localhost:8000/admin/stats'
            stats_req = urllib.request.Request(stats_url)
            stats_req.add_header('Authorization', f'Bearer {token}')
            
            with urllib.request.urlopen(stats_req) as stats_res:
                print(f"Stats Status: {stats_res.getcode()}")
                print(f"Stats Response: {stats_res.read().decode('utf-8')}")
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_stats()
