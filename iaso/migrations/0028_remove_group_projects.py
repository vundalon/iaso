# Generated by Django 2.1.11 on 2019-12-18 16:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("iaso", "0027_put_devices_in_projects")]

    operations = [migrations.RemoveField(model_name="group", name="projects")]