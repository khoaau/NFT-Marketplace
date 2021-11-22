# Generated by Django 3.2.9 on 2021-11-21 01:11

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='NFT',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_uri', models.CharField(max_length=500)),
            ],
        ),
        migrations.CreateModel(
            name='NFTMetadata',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('favorites', models.IntegerField(default=0)),
                ('token_uri', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.nft')),
            ],
        ),
    ]