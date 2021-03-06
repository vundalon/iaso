# Generated by Django 2.2.4 on 2019-09-29 09:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("iaso", "0023_datasource_version")]

    operations = [
        migrations.AlterField(
            model_name="datasource", name="description", field=models.TextField(blank=True, null=True)
        ),
        migrations.AlterField(
            model_name="orgunit",
            name="geom_source",
            field=models.TextField(
                blank=True,
                choices=[
                    ("snis", "SNIS"),
                    ("ucla", "UCLA"),
                    ("pnltha", "PNL THA"),
                    ("derivated", "Derivated from actual data"),
                ],
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="orgunit",
            name="source",
            field=models.TextField(
                blank=True,
                choices=[
                    ("snis", "SNIS"),
                    ("ucla", "UCLA"),
                    ("pnltha", "PNL THA"),
                    ("derivated", "Derivated from actual data"),
                ],
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="sourceversion", name="description", field=models.TextField(blank=True, null=True)
        ),
    ]
