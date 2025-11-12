import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function MenuScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/textures/ground.png')} 
        style={styles.background}
        resizeMode="repeat"
      />
      <Text style={styles.title}>Меню игры</Text>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Game')}
      >
        <Text style={styles.buttonText}>🎮 Начать игру</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.buttonText}>⚙️ Настройки</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 50,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});