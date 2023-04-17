from django.urls import path
from . import views

urlpatterns = [
    path('get_classification/', views.get_classification),
    path('', views.index)
]

