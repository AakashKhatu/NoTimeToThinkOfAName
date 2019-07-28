from django.db import models

# Create your models here.
class Data(models.Model):
    id=models.AutoField(primary_key=True)
    jid=models.CharField(max_length=100,default=0)
    x=models.FloatField(max_length=50)
    y=models.FloatField(max_length=50)
    z=models.FloatField(max_length=50)
    timestamp=models.IntegerField(max_length=50)
    mocked=models.BooleanField(default=True)
    longitude=models.FloatField(max_length=50)
    latitude=models.FloatField(max_length=50)
    speed=models.FloatField(max_length=50)

    