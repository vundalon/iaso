# Generated by Django 2.1.11 on 2020-04-28 06:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0042_merge_20200427_1429")]

    operations = [
        migrations.AlterField(
            model_name="instance", name="correlation_id", field=models.BigIntegerField(blank=True, null=True)
        )
    ]