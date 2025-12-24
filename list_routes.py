from api import app
paths = [route.path for route in app.routes]
paths.sort()
for p in paths:
    print(p)
