# Generated by Django 2.0 on 2018-12-20 13:58

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [("vector_control", "0011_auto_20181220_1318")]

    operations = [
        migrations.AddField(
            model_name="apiimport",
            name="json_body",
            field=django.contrib.postgres.fields.jsonb.JSONField(default="{}"),
            preserve_default=False,
        )
    ]