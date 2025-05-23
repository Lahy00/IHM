from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from ..models import Classe
from django.core.exceptions import ValidationError

class ClasseSerializer(serializers.ModelSerializer):
    niveau = serializers.CharField()
    class Meta:
        model=Classe
        fields=["numClasse","niveau","groupe"]
    def validate_niveau(self, value):
        if value.upper() not in ["L1","L2","L3","M1","M2"]:
            raise serializers.ValidationError({"niveau":"Niveau invalide !"})
        return value.upper()
    def validate_groupe(self, value):
        if value:
            groupes=value.strip().split()
            if len(groupes) > 1:
                if "groupe"==groupes[0]:return value.strip().capitalize()
            return f"Groupe {value.strip().lower()}"
        return value
    def validate(self, data):
        return data
    def create(self, validated_data):
        return Classe.objects.create(**validated_data)