import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/textures/ground.png')}
        style={styles.background}
        resizeMode="repeat"
      />
      <Text style={styles.title}>Simple Runner</Text>
      <Image 
        source={require('../assets/player.png')} 
        style={styles.characterImage}
      />
      <Text style={styles.description}>
        Добро пожаловать в увлекательный 2D платформер!
      </Text>
      
      {/* ПРЕДУПРЕЖДЕНИЕ О РЕЖИМЕ */}
      <Text style={styles.orientationWarning}>
        Игра доступна только в горизонтальном режиме
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.buttonText}>Начать игру</Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF', // ← ← ← БЕЛЫЙ ТЕКСТ
    marginBottom: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'monospace',
  },
  characterImage: {
    width: 80,
    height: 80,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#8B4513',
    borderRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF', // ← ← ← БЕЛЫЙ ТЕКСТ
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'monospace',
  },
  orientationWarning: {
    fontSize: 16,
    color: '#FFD700', // ← ← ← ЗОЛОТИСТЫЙ — для привлечения внимания
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'monospace',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: 'rgba(100, 100, 100, 0.7)',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#8B4513', // ← ← ← КОРИЧНЕВЫЙ — контраст с серой кнопкой
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});