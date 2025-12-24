import urllib.request
try:
    with urllib.request.urlopen('http://localhost:8000/hello') as res:
        print(res.getcode(), res.read().decode())
except Exception as e:
    print(e)
