/**
 * ЭКРАН НАСТРОЕК
 */
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, Image,Switch, TouchableOpacity, ScrollView,Alert } from 'react-native';
import AppContext from '../AppContext';

export default function SettingsScreen() {
  const { gameSettings, saveSettings } = useContext(AppContext);
  
  const [localSettings, setLocalSettings] = useState(gameSettings);

  const updateSetting = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const handleSaveSettings = () => {
    saveSettings(localSettings);
    Alert.alert('Успех', 'Настройки сохранены!');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Сброс настроек',
      'Вы уверены, что хотите сбросить все настройки?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
              soundEnabled: true,
              musicEnabled: true,
              vibrationEnabled: true,
              difficulty: 'medium',
              bestScore: gameSettings.bestScore,
              totalCoins: gameSettings.totalCoins
            };
            setLocalSettings(defaultSettings);
            saveSettings(defaultSettings);
          }
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Сброс прогресса',
      'Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: () => {
            const resetSettings = {
              ...localSettings,
              bestScore: 0,
              totalCoins: 0
            };
            setLocalSettings(resetSettings);
            saveSettings(resetSettings);
          }
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require('../assets/textures/ground.png')} 
        style={styles.background}
        resizeMode="repeat"
      />
      <Text style={styles.title}>Настройки игры</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔊 Звук</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Звуковые эффекты</Text>
          <Switch
            value={localSettings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={localSettings.soundEnabled ? '#3498DB' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Фоновая музыка</Text>
          <Switch
            value={localSettings.musicEnabled}
            onValueChange={(value) => updateSetting('musicEnabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={localSettings.musicEnabled ? '#3498DB' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Вибрация</Text>
          <Switch
            value={localSettings.vibrationEnabled}
            onValueChange={(value) => updateSetting('vibrationEnabled', value)}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={localSettings.vibrationEnabled ? '#3498DB' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Тестирование</Text>
        
        <TouchableOpacity 
          style={styles.dataButton}
          onPress={() => {
            const deviceInfo = PlatformUtils.getDeviceInfo();
            const capabilities = PlatformUtils.checkDeviceCapabilities();
            
            PlatformUtils.showAlert(
              'Информация об устройстве',
              `Платформа: ${deviceInfo.platform}\n` +
              `Устройство: ${deviceInfo.deviceName}\n` +
              `Версия: ${deviceInfo.version}\n` +
              `Тип: ${deviceInfo.isTablet ? 'Планшет' : 'Телефон'}\n` +
              `Эмулятор: ${deviceInfo.isEmulator ? 'Да' : 'Нет'}\n\n` +
              `Возможности:\n` +
              `• Вибрация: ${capabilities.vibration ? '✅' : '❌'}\n` +
              `• Темная тема: ${capabilities.darkMode ? '✅' : '❌'}\n` +
              `• Биометрия: ${capabilities.biometrics ? '✅' : '❌'}`
            );
          }}
        >
          <Text style={styles.dataButtonText}>📱 Информация об устройстве</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dataButton}
          onPress={() => {
            const tests = PlatformUtils.runCompatibilityTests();
            PlatformUtils.showAlert(
              'Тест совместимости',
              `Платформа: ${tests.platform}\n` +
              `Ориентация: ${tests.orientation}\n` +
              `Разрешение: ${tests.screenDimensions.width}x${tests.screenDimensions.height}\n` +
              `Производительность: ${tests.performance.score}\n` +
              `Время теста: ${tests.performance.duration}ms`
            );
          }}
        >
          <Text style={styles.dataButtonText}>⚡ Тест производительности</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Геймплей</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Сложность игры</Text>
          <View style={styles.difficultyContainer}>
            {[
              { value: 'easy', label: 'Легко' },
              { value: 'medium', label: 'Нормально' },
              { value: 'hard', label: 'Сложно' }
            ].map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.difficultyButton,
                  localSettings.difficulty === level.value && styles.difficultyButtonActive
                ]}
                onPress={() => updateSetting('difficulty', level.value)}
              >
                <Text style={[
                  styles.difficultyText,
                  localSettings.difficulty === level.value && styles.difficultyTextActive
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Данные</Text>
        
        <TouchableOpacity 
          style={styles.dataButton}
          onPress={handleResetProgress}
        >
          <Text style={styles.dataButtonText}>🔄 Сбросить прогресс</Text>
        </TouchableOpacity>
        
        <View style={styles.dataInfo}>
          <Text style={styles.dataInfoText}>Лучший счет: {gameSettings.bestScore}</Text>
          <Text style={styles.dataInfoText}>Всего монет: {gameSettings.totalCoins}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>💾 Сохранить настройки</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetSettings}
        >
          <Text style={styles.resetButtonText}>🔄 Сбросить настройки</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>О приложении</Text>
        <Text style={styles.infoText}>Simple Runner v2.0.0</Text>
        <Text style={styles.infoText}>Разработано с ❤️ для мобильных платформ</Text>
        <Text style={styles.infoText}>© 2024 Все права защищены</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'transparent',
    padding: 20,
    zIndex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'repeat',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  settingText: {
    fontSize: 16,
    color: '#CCCCCC',
    flex: 1,
    fontFamily: 'monospace',
  },
  difficultyContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: 4,
  },
  difficultyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(52, 152, 219, 0.7)',
    borderColor: '#4A90E2',
  },
  difficultyText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  difficultyTextActive: {
    color: 'white',
  },
  dataButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  dataButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  dataInfo: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dataInfoText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  actions: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: 'rgba(39, 174, 96, 0.7)',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  resetButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  infoSection: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});