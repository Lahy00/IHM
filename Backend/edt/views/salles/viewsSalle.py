from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ...serializer.serializerSalle import SalleSerializer
from ...models import Salle
from datetime import date,datetime,timedelta
from ...services.serviceModel import ServiceModelCrud
class SalleView(APIView):
    def get(self, request):
        salles=Salle.objects.all().order_by('-numSalle')
        donnees=SalleSerializer(salles, many=True).data
        dateActuel=date.today()
        heureActuel=datetime.now().time()
        for i,salle in enumerate(salles):
            edt=salle.edts.filter(date=dateActuel,heureDebut__lte=heureActuel,heureFin__gte=heureActuel).exists()
            if edt == salle.statut:
                donnees[i]["statut"]=not edt
                serializerModif=SalleSerializer(salle,donnees[i])
                if serializerModif.is_valid():
                    serializerModif.save()
                else:
                    return Response(serializerModif.errors,status=status.HTTP_400_BAD_REQUEST)
            edts=salle.edts.all()
            heureTotal=timedelta()
            for edt in edts:
                debut=datetime.combine(datetime.today(), edt.heureDebut)
                fin=datetime.combine(datetime.today(), edt.heureFin)
                heureTotal += (fin - debut)
            donnees[i]["heureTotal"]=heureTotal.total_seconds()
        return Response(donnees)
    
    
    def post(self, request):
        serializer=SalleSerializer(data=request.data)
        if serializer.is_valid():
            salle=serializer.save()
            return Response(SalleSerializer(salle).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, numSalle):
        try:
            salle=Salle.objects.get(pk=numSalle)
        except Salle.DoesNotExist:
            return Response({"erreur":"Salle introuvable"}, status=status.HTTP_404_NOT_FOUND)
        serializer=SalleSerializer(salle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, numSalle):
        try:
            salle=Salle.objects.get(pk=numSalle)
            salle.delete()
            return Response({'message':'Suppression avec succès'}, status=status.HTTP_200_OK)
        except Salle.DoesNotExist:
            return Response({'erreur':'Salle introuvable'}, status=status.HTTP_404_NOT_FOUND)

class SalleDetailView(APIView):
    def post(self, request):
        serviceCrud=ServiceModelCrud(Salle)
        response=serviceCrud.suppressionMutlipe(request.data, "numSalles","Salles")
        return Response(response['context'], status=response['status'])