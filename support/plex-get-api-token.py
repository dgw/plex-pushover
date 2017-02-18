import httplib, base64
username = ""
password = ""

base64string = base64.encodestring('%s:%s' % (username, password)).replace('\n', '')
txdata = ""

headers={'Authorization': "Basic %s" % base64string,
                'X-Plex-Client-Identifier': "grahams' Test Webhook",
                'X-Plex-Product': "Test script 356546545",
                'X-Plex-Version': "0.001"}

conn = httplib.HTTPSConnection("plex.tv")
conn.request("POST","/users/sign_in.json",txdata,headers)
response = conn.getresponse()
print response.status, response.reason
data = response.read()
print str(data)
conn.close()
