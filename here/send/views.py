from django.shortcuts import render,HttpResponse
import json
from .models import Data
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
# Create your views here.

@csrf_exempt
def index(request):
    json_data=request.POST['data']
    data1 = json.loads(json_data) 
    for i in data1:
        x=i['x']
        y=i['y']
        z=i['z']
        jid=i['jid']
        timestamp=i['timestamp']
        mocked=i['location']['mocked']
        longitude=i['location']['coords']['longitude']
        latitude=i['location']['coords']['latitude']
        speed=i['location']['coords']['speed']
    
        print(i['x'])
        data=Data(x=x,y=y,z=z,timestamp=timestamp,mocked=mocked,longitude=longitude,latitude=latitude,
        speed=speed,jid=jid
        )
        data.save()
    return HttpResponse('Main page')

@csrf_exempt
def getdata(request,username):
    if username=='-1':
        data=Data.objects.latest('id')
        field_value = getattr(data,'jid')
        temp=Data.objects.filter(jid=field_value)
        list=[]
        for i in temp:
            x1=getattr(i,'x')
            y1=getattr(i,'y')
            z1=getattr(i,'z')
            timestamp1=getattr(i,'timestamp')
            mocked1=getattr(i,'mocked')
            latitude1=getattr(i,'latitude')
            longitude1=getattr(i,'longitude')
            speed1=getattr(i,'speed')
            dict={'x':x1,'y':y1,'z':z1,'timestamp':timestamp1,'mocked':mocked1,'latitude':latitude1,
            'longitude':longitude1,'speed':speed1}
            list.append(dict)
        print(list)
        return JsonResponse(list,safe=False)
    else:
        temp=Data.objects.filter(jid=username)
        field_value = getattr(data,'jid')
        temp=Data.objects.filter(jid=field_value)
        list=[]
        for i in temp:
            x1=getattr(i,'x')
            y1=getattr(i,'y')
            z1=getattr(i,'z')
            timestamp1=getattr(i,'timestamp')
            mocked1=getattr(i,'mocked')
            latitude1=getattr(i,'latitude')
            longitude1=getattr(i,'longitude')
            speed1=getattr(i,'speed')
            dict={'x':x1,'y':y1,'z':z1,'timestamp':timestamp1,'mocked':mocked1,'latitude':latitude1,
            'longitude':longitude1,'speed':speed1}
            list.append(dict)
        print(list)
        return JsonResponse(list,safe=False)
    return HttpResponse('ok')