import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useRunStore } from '../store/useRunStore';

import { LOCATION_TASK_NAME } from '../services/locationTask';

export default function HomeScreen() {
  const [permissionStatus, setPermissionStatus] = useState('Pendente');
  const [isTracking, setIsTracking] = useState(false);
  const currentLocation = useRunStore((state) => state.currentLocation);

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
      // Trava de segurança: verifica a permissão de background antes de tentar ligar o motor
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

      <Text style={styles.texto}>
        Para gravar suas corridas com o celular no bolso, precisamos de acesso ao seu GPS o tempo todo.
      </Text>

      <Text style={styles.status}>Status GPS: {permissionStatus}</Text>

      {/* Botão de Permissões (Pode ser escondido no futuro se o status já for 'granted') */}
      <View style={styles.espacoBotao}>
        <Button
          title="🛡️ Conceder Permissões"
          onPress={solicitarPermissoes}
          color="#555"
        />
      </View>

      {/* Divisória visual */}
      <View style={styles.divisor} />

      {/* Botão de Start */}
      <View style={styles.espacoBotao}>
        <Button
          title={isTracking ? "🏃‍♂️ GRAVANDO..." : "▶️ INICIAR CORRIDA"}
          onPress={iniciarCorrida}
          color="#208AEF"
          disabled={isTracking} // Desabilita o botão se já estiver correndo
        />
      </View>

      {/* Botão de Stop */}
      <View style={styles.espacoBotao}>
        <Button
          title="⏹️ PARAR CORRIDA"
          onPress={pararCorrida}
          color="#FF4500"
          disabled={!isTracking} // Só habilita se estiver correndo
        />
      </View>
      <View style={{ marginVertical: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, width: '90%' }}>
        <Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>Dados do GPS Atual:</Text>
        {currentLocation ? (
          <>
            <Text>Latitude: {currentLocation.latitude}</Text>
            <Text>Longitude: {currentLocation.longitude}</Text>
          </>
        ) : (
          <Text style={{ fontStyle: 'italic', color: '#888', textAlign: 'center' }}>
            A aguardar sinal do satélite...
          </Text>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  texto: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
    marginVertical: 20,
  }
});