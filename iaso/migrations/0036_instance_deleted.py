# Generated by Django 2.1.11 on 2020-03-12 14:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0035_form_and_versions_fine_tuning")]

    operations = [migrations.AddField(model_name="instance", name="deleted", field=models.BooleanField(default=False))]