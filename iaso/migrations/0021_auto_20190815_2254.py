# Generated by Django 2.2.4 on 2019-08-15 22:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [("iaso", "0020_auto_20190814_2327")]

    operations = [
        migrations.RemoveField(model_name="instancefile", name="device"),
        migrations.AddField(model_name="device", name="test_device", field=models.BooleanField(default=False)),
        migrations.AddField(
            model_name="instance",
            name="device",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, to="iaso.Device"
            ),
        ),
    ]
