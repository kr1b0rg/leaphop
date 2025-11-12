/**
 * ЭКРАН РЕКОРДОВ
 */
import React, { useContext } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import AppContext from '../AppContext';

export default function ScoresScreen({ navigation }) {
  const { gameSettings } = useContext(AppContext);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image 
        source={require('../assets/textures/ground.png')} 
        style={styles.background}
        resizeMode="repeat"
      />
      <Text style={styles.title}>🏆 Рекорды</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Статистика игрока</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Лучший счет:</Text>
          <Text style={styles.statValue}>{gameSettings.bestScore}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Всего монет:</Text>
          <Text style={styles.statValue}>{gameSettings.totalCoins}</Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Уровень сложности:</Text>
          <Text style={styles.statValue}>
            {gameSettings.difficulty === 'easy' ? 'Легкий' : 
             gameSettings.difficulty === 'medium' ? 'Средний' : 'Сложный'}
          </Text>
        </View>
      </View>

      <View style={styles.achievementsCard}>
        <Text style={styles.achievementsTitle}>Достижения</Text>
        
        <View style={styles.achievement}>
          <Text style={styles.achievementIcon}>🥇</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Первый шаг</Text>
            <Text style={styles.achievementDesc}>Наберите 1000 очков</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (gameSettings.bestScore / 1000) * 100)}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.achievement}>
          <Text style={styles.achievementIcon}>💰</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementName}>Коллекционер</Text>
            <Text style={styles.achievementDesc}>Соберите 50 монет</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, (gameSettings.totalCoins / 50) * 100)}%` }]} />
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Назад</Text>
      </TouchableOpacity>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 30,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
  },
  statsCard: {
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
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  statLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontFamily: 'monospace',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  achievementsCard: {
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
    elevation: 3,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
    color: '#FFFFFF',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 3,
  },
  backButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});