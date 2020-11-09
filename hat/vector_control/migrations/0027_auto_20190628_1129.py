# Generated by Django 2.0 on 2019-06-28 11:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("vector_control", "0026_auto_20190531_0744")]

    operations = [
        migrations.AlterField(
            model_name="apiimport",
            name="import_type",
            field=models.TextField(
                blank=True,
                choices=[
                    ("trap", "Trap"),
                    ("site", "Site"),
                    ("catch", "Catch"),
                    ("target", "Target"),
                    ("orgUnit", "Org Unit"),
                ],
                max_length=25,
                null=True,
            ),
        )
    ]