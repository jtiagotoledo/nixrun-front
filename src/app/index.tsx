import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function PermissionScreen() {
  const [permissionStatus, setPermissionStatus] = useState('Pendente');

  const solicitarPermissoes = async () => {
    try {
      setPermissionStatus('Solicitando permissão básica...');
      
      // 1. Pede permissão de Primeiro Plano (Foreground)
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (fgStatus !== 'granted') {
        Alert.alert(
          "Permissão Negada", 
          "O Nixrun precisa do GPS para funcionar. Habilite nas configurações do celular."
        );
        setPermissionStatus('Negado (Primeiro Plano)');
        return; // Para o fluxo aqui se o usuário negar
      }

      setPermissionStatus('Solicitando permissão de segundo plano...');

      // 2. Pede permissão de Segundo Plano (Background)
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

      if (bgStatus !== 'granted') {
        Alert.alert(
          "Atenção", 
          "Sem a permissão de segundo plano, a corrida vai parar de gravar se você desligar a tela."
        );
        setPermissionStatus('Apenas Primeiro Plano');
        return;
      }

      // Se chegou aqui, deu tudo certo!
      setPermissionStatus('Tudo Certo! Pronto para correr.');
      Alert.alert("Sucesso!", "Todas as permissões concedidas.");

    } catch (error) {
      console.error("Erro ao solicitar permissões:", error);
      setPermissionStatus('Erro ao solicitar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Nixrun</Text>
      
      <Text style={styles.texto}>
        Para gravar suas corridas com o celular no bolso, precisamos de acesso ao seu GPS o tempo todo.
      </Text>

      <Text style={styles.status}>Status atual: {permissionStatus}</Text>

      <Button 
        title="Conceder Permissões de GPS" 
        onPress={solicitarPermissoes} 
        color="#208AEF"
      />
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
    marginBottom: 20,
  },
  texto: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FF4500',
  }
});