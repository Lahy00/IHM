# Generated by Django 5.0.1 on 2025-05-10 13:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('edt', '0014_alter_action_user_id_alter_avoir_numetablissement_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='professeur',
            name='description',
        ),
    ]
