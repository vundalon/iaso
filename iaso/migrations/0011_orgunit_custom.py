# Generated by Django 2.0 on 2019-06-28 12:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0010_orgunit_uuid")]

    operations = [migrations.AddField(model_name="orgunit", name="custom", field=models.BooleanField(default=False))]
