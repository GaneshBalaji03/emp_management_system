import urllib.parse, urllib.request, urllib.error

url = 'https://zdotapps.com/screeningTest/verify_user_otp.php'
payload = {'email': 'test@example.com', 'otp': '123456', 'system_name': 'isl'}

data = urllib.parse.urlencode(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, method='POST', headers={'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        status = getattr(resp, 'status', None) or resp.getcode()
        body = resp.read().decode('utf-8')
        print('STATUS', status)
        print('BODY')
        print(body)
except urllib.error.HTTPError as e:
    print('HTTPERROR', e.code)
    try:
        print(e.read().decode('utf-8'))
    except Exception:
        pass
except Exception as e:
    print('ERROR', e)
