import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Polyline } from 'react-native-maps';

import { useRunStore } from '../store/useRunStore';
import { LOCATION_TASK_NAME } from '../services/locationTask';

export default function HomeScreen() {
  const [permissionStatus, setPermissionStatus] = useState('Pendente');
  const [isTracking, setIsTracking] = useState(false);

  // 1. Trazendo a rota completa e a função de limpar do Zustand
  const route = useRunStore((state) => state.route);
  const clearRoute = useRunStore((state) => state.clearRoute);

  // A localização atual é sempre o último ponto da nossa lista (se existir)
  const currentLocation = route.length > 0 ? route[route.length - 1] : null;

  useEffect(() => {
    const verificarStatus = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(hasStarted);
    };
    verificarStatus();
  }, []);

  // --- 1. LÓGICA DE PERMISSÕES ---
  const solicitarPermissoes = async () => {
    try {
      setPermissionStatus('Solicitando...');

      // Pede permissão de Notificação (Obrigatório para Android 13+)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const notifStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (notifStatus !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Aviso", "Sem a permissão de notificações, o Android pode fechar o aplicativo ao gravar.");
        }
      }

      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        Alert.alert("Negado", "O Nixrun precisa do GPS para funcionar.");
        setPermissionStatus('Negado (Primeiro Plano)');
        return;
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        Alert.alert("Atenção", "Sem a permissão de segundo plano, a gravação vai parar com a tela desligada.");
        setPermissionStatus('Apenas Primeiro Plano');
        return;
      }

      setPermissionStatus('Tudo Certo! Pronto para correr.');
      Alert.alert("Sucesso!", "Todas as permissões concedidas.");

    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      setPermissionStatus('Erro ao solicitar');
    }
  };

  // --- 2. LÓGICA DE INICIAR A CORRIDA ---
  const iniciarCorrida = async () => {
    try {
      const { status } = await Location.getBackgroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Ops!", "Por favor, conceda as permissões de GPS primeiro.");
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        console.log("Já está gravando!");
        return;
      }

      // Limpa a linha do mapa da corrida anterior
      clearRoute();

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 1,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Nixrun",
          notificationBody: "Gravando sua corrida...",
          notificationColor: "#208AEF",
        },
      });

      setIsTracking(true);
      console.log("🚀 Motor de rastreamento ligado!");
    } catch (error) {
      console.error("Erro ao iniciar rastreamento:", error);
    }
  };

  // --- 3. LÓGICA DE PARAR A CORRIDA ---
  const pararCorrida = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
      console.log("🛑 Rastreamento parado.");
    } catch (error) {
      console.error("Erro ao parar rastreamento:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Nixrun</Text>

      {/* COMPONENTE DO MAPA */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {route.length > 1 && (
            <Polyline
              coordinates={route}
              strokeColor="#FF4500" // Cor da linha (Laranja)
              strokeWidth={5} // Espessura
            />
          )}
        </MapView>
      </View>

      <Text style={styles.status}>Status GPS: {permissionStatus}</Text>

      {currentLocation && (
        <Text style={styles.coords}>
          Lat: {currentLocation.latitude.toFixed(5)} | Lon: {currentLocation.longitude.toFixed(5)}
        </Text>
      )}

      <View style={styles.espacoBotao}>
        <Button
          title="🛡️ Conceder Permissões"
          onPress={solicitarPermissoes}
          color="#555"
        />
      </View>

      <View style={styles.divisor} />

      <View style={styles.espacoBotao}>
        <Button
          title={isTracking ? "🏃‍♂️ GRAVANDO..." : "▶️ INICIAR CORRIDA"}
          onPress={iniciarCorrida}
          color="#208AEF"
          disabled={isTracking}
        />
      </View>

      <View style={styles.espacoBotao}>
        <Button
          title="⏹️ PARAR CORRIDA"
          onPress={pararCorrida}
          color="#FF4500"
          disabled={!isTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 50, // Dá um espaço no topo para o mapa não colar na barra
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  coords: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  espacoBotao: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divisor: {
    height: 1,
    width: '80%',
    backgroundColor: '#ddd',
    marginVertical: 10,
  }
});