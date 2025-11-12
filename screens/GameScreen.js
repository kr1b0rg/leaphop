/**
 * ИСПРАВЛЕННЫЙ ГОРИЗОНТАЛЬНЫЙ ПЛАТФОРМЕР С РАБОЧЕЙ ВИБРАЦИЕЙ И ПИКСЕЛЬНЫМ СТИЛЕМ
 */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Dimensions, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text,
  Animated,
  Vibration,
  Platform
} from 'react-native';
import AppContext from '../AppContext';

// Размеры экрана
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const LEVEL_WIDTH = screenWidth * 3;

export default function GameScreen({ navigation }) {
  const { gameSettings, saveSettings } = useContext(AppContext);

  // СОСТОЯНИЕ ИГРЫ - только для отображения
  const [gameState, setGameState] = useState('playing');
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: screenHeight - 150 });
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [cameraOffset, setCameraOffset] = useState(0);
  
  // Игровые объекты
  const [platforms, setPlatforms] = useState([]);
  const [coinsList, setCoinsList] = useState([]);
  const [enemies, setEnemies] = useState([]);

  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Игровые константы
  const GRAVITY = 0.8;
  const JUMP_STRENGTH = -18;
  const PLAYER_SPEED = 8;
  const GAME_LOOP_INTERVAL = 16;

  // ССЫЛКИ ДЛЯ РЕАЛЬНОГО ВРЕМЕНИ - все изменяемые значения храним в useRef
  const gameStateRef = useRef('playing');
  const playerXRef = useRef(100);
  const playerYRef = useRef(screenHeight - 150);
  const playerVelocityRef = useRef({ x: 0, y: 0 });
  const isGroundedRef = useRef(false);
  const keysPressedRef = useRef({ left: false, right: false });
  const gameLoopInterval = useRef(null);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameTimeRef = useRef(0);
  const saveSettingsTimeoutRef = useRef(null);

  // Паттерны вибрации для разных событий
  const vibrationPatterns = {
    buttonPress: Platform.OS === 'ios' ? [50] : [50],
    coinCollected: Platform.OS === 'ios' ? [100, 50, 100] : [100, 50, 100],
    enemyDefeated: Platform.OS === 'ios' ? [200] : [200, 100, 200],
    gameOver: Platform.OS === 'ios' ? [400] : [400, 200, 400, 200],
  };

  /**
   * БЕЗОПАСНАЯ ВИБРАЦИЯ
   */
  const safeVibrate = (pattern) => {
    if (!gameSettings.vibrationEnabled) return;
    
    try {
      if (Platform.OS === 'web') {
        console.log('Vibration not supported on web');
        return;
      }
      
      if (Platform.OS === 'ios') {
        Vibration.vibrate(100);
      } else {
        Vibration.vibrate(pattern);
      }
    } catch (error) {
      console.log('Vibration error:', error);
    }
  };

  useEffect(() => {
    initializeGame();
    startGameLoop();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => {
      if (gameLoopInterval.current) {
        clearInterval(gameLoopInterval.current);
      }
      if (saveSettingsTimeoutRef.current) {
        clearTimeout(saveSettingsTimeoutRef.current);
      }
    };
  }, []);

  /**
   * ИНИЦИАЛИЗАЦИЯ ИГРЫ
   */
  const initializeGame = () => {
    // ПЛАТФОРМЫ
    const initialPlatforms = [
      { id: 1, x: 0, y: screenHeight - 80, width: LEVEL_WIDTH, height: 80, type: 'ground' },
      { id: 2, x: 300, y: screenHeight - 200, width: 120, height: 20, type: 'platform' },
      { id: 3, x: 500, y: screenHeight - 300, width: 120, height: 20, type: 'platform' },
      { id: 4, x: 800, y: screenHeight - 250, width: 150, height: 20, type: 'platform' },
      { id: 5, x: 1100, y: screenHeight - 350, width: 120, height: 20, type: 'platform' },
      { id: 6, x: 1400, y: screenHeight - 280, width: 140, height: 20, type: 'platform' },
      { id: 7, x: 1700, y: screenHeight - 380, width: 120, height: 20, type: 'platform' },
      { id: 8, x: 2000, y: screenHeight - 220, width: 180, height: 20, type: 'platform' },
    ];
    
    // МОНЕТЫ
    const initialCoins = [
      { id: 1, x: 350, y: screenHeight - 250, collected: false },
      { id: 2, x: 550, y: screenHeight - 350, collected: false },
      { id: 3, x: 850, y: screenHeight - 300, collected: false },
      { id: 4, x: 1150, y: screenHeight - 400, collected: false },
      { id: 5, x: 1450, y: screenHeight - 330, collected: false },
      { id: 6, x: 1750, y: screenHeight - 430, collected: false },
      { id: 7, x: 2050, y: screenHeight - 270, collected: false },
    ];

    // ВРАГИ
    const initialEnemies = [
      { id: 1, x: 400, y: screenHeight - 220, width: 40, height: 40, speed: 2, direction: 1, platformId: 2 },
      { id: 2, x: 900, y: screenHeight - 270, width: 40, height: 40, speed: 3, direction: -1, platformId: 4 },
      { id: 3, x: 1500, y: screenHeight - 320, width: 40, height: 40, speed: 2, direction: 1, platformId: 6 },
    ];

    setPlatforms(initialPlatforms);
    setCoinsList(initialCoins);
    setEnemies(initialEnemies);
    
    // Инициализация всех ссылок
    const initialPosition = { x: 100, y: screenHeight - 140 };
    playerXRef.current = initialPosition.x;
    playerYRef.current = initialPosition.y;
    playerVelocityRef.current = { x: 0, y: 0 };
    isGroundedRef.current = false;
    keysPressedRef.current = { left: false, right: false };
    gameStateRef.current = 'playing';
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameTimeRef.current = 0;
    
    // Обновление состояния для отображения
    setPlayerPosition(initialPosition);
    setScore(0);
    setCoins(0);
    setGameTime(0);
    setCameraOffset(0);
  };

  const startGameLoop = () => {
    gameLoopInterval.current = setInterval(() => {
      if (gameStateRef.current === 'playing') {
        updateGame();
      }
    }, GAME_LOOP_INTERVAL);
  };

  /**
   * ОБНОВЛЕНИЕ КАМЕРЫ
   */
  const updateCamera = () => {
    const targetOffset = Math.max(0, playerXRef.current - screenWidth / 2);
    setCameraOffset(prev => prev + (targetOffset - prev) * 0.1);
  };

  /**
   * ОСНОВНОЙ ИГРОВОЙ ЦИКЛ
   */
  const updateGame = () => {
    updateMovement();
    updatePhysics();
    updateEnemies();
    checkCollisions();
    updateGameTime();
    updateCamera();
  };

  /**
   * ОБНОВЛЕНИЕ ДВИЖЕНИЯ - на основе нажатых клавиш
   */
  const updateMovement = () => {
    if (gameStateRef.current !== 'playing') return;

    let newVelocityX = 0;
    
    if (keysPressedRef.current.left && !keysPressedRef.current.right) {
      newVelocityX = -PLAYER_SPEED;
    } else if (keysPressedRef.current.right && !keysPressedRef.current.left) {
      newVelocityX = PLAYER_SPEED;
    }
    
    playerVelocityRef.current.x = newVelocityX;
  };

  /**
   * ФИЗИКА - полностью переписанная с использованием useRef
   */
  const updatePhysics = () => {
    let newX = playerXRef.current + playerVelocityRef.current.x;
    let newY = playerYRef.current + playerVelocityRef.current.y;

    if (!isGroundedRef.current) {
      playerVelocityRef.current.y += GRAVITY;
    }

    let grounded = false;
    
    for (const platform of platforms) {
      if (checkCollision(
        { x: newX, y: newY, width: 40, height: 40 },
        platform
      )) {
        if (playerYRef.current <= platform.y - 40 && playerVelocityRef.current.y >= 0) {
          newY = platform.y - 40;
          playerVelocityRef.current.y = 0;
          grounded = true;
          break;
        } else if (playerYRef.current >= platform.y + platform.height && playerVelocityRef.current.y <= 0) {
          newY = platform.y + platform.height;
          playerVelocityRef.current.y = 0;
        } else if (playerVelocityRef.current.x !== 0) {
          if (playerXRef.current <= platform.x - 40 && newX >= platform.x - 40) {
            newX = platform.x - 40;
          } else if (playerXRef.current >= platform.x + platform.width && newX <= platform.x + platform.width) {
            newX = platform.x + platform.width;
          }
        }
      }
    }

    playerXRef.current = newX;
    playerYRef.current = newY;
    isGroundedRef.current = grounded;

    playerXRef.current = Math.max(0, Math.min(playerXRef.current, LEVEL_WIDTH - 40));
    
    if (playerYRef.current > screenHeight + 100) {
      gameOver();
      return;
    }

    setPlayerPosition({ x: playerXRef.current, y: playerYRef.current });
  };

  /**
   * ОБНОВЛЕНИЕ ВРАГОВ
   */
  const updateEnemies = () => {
    setEnemies(prev => 
      prev.map(enemy => {
        const platform = platforms.find(p => p.id === enemy.platformId);
        if (!platform) return enemy;
        
        let newX = enemy.x + enemy.speed * enemy.direction;
        
        if (newX < platform.x || newX + enemy.width > platform.x + platform.width) {
          return { ...enemy, direction: -enemy.direction };
        }
        
        const newY = platform.y - enemy.height;
        
        return { ...enemy, x: newX, y: newY };
      })
    );
  };

  /**
   * ПРОВЕРКА СТОЛКНОВЕНИЙ
   */
  const checkCollisions = () => {
    checkCoinCollisions();
    checkEnemyCollisions();
  };

  const checkCoinCollisions = () => {
    setCoinsList(prev => 
      prev.map(coin => {
        if (!coin.collected && checkCollision(
          { x: playerXRef.current, y: playerYRef.current, width: 40, height: 40 },
          { x: coin.x, y: coin.y, width: 30, height: 30 }
        )) {
          collectCoin(coin.id);
          return { ...coin, collected: true };
        }
        return coin;
      })
    );
  };

  const checkEnemyCollisions = () => {
    const currentEnemies = [...enemies];
    
    currentEnemies.forEach(enemy => {
      if (checkCollision(
        { x: playerXRef.current, y: playerYRef.current, width: 40, height: 40 },
        enemy
      )) {
        if (playerVelocityRef.current.y > 0 && playerYRef.current + 20 <= enemy.y) {
          setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          playerVelocityRef.current.y = JUMP_STRENGTH * 0.7;
          addScore(200);
          safeVibrate(vibrationPatterns.enemyDefeated);
        } else {
          gameOver();
        }
      }
    });
  };

  /**
   * ФУНКЦИЯ ПРОВЕРКИ СТОЛКНОВЕНИЙ
   */
  const checkCollision = (obj1, obj2) => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  };

  const collectCoin = (coinId) => {
    if (gameStateRef.current !== 'playing') return;
    
    addScore(100);
    coinsRef.current += 1;
    setCoins(coinsRef.current);
    safeVibrate(vibrationPatterns.coinCollected);
  };

  /**
   * ДОБАВЛЕНИЕ ОЧКОВ С ЗАЩИТОЙ ОТ КОНКУРЕНТНОГО ОБНОВЛЕНИЯ
   */
  const addScore = (points) => {
    if (gameStateRef.current !== 'playing') return;
    
    scoreRef.current += points;
    setScore(scoreRef.current);
    
    if (saveSettingsTimeoutRef.current) {
      clearTimeout(saveSettingsTimeoutRef.current);
    }
    
    saveSettingsTimeoutRef.current = setTimeout(() => {
      if (scoreRef.current > gameSettings.bestScore) {
        saveSettings({ ...gameSettings, bestScore: scoreRef.current });
      }
    }, 0);
  };

  const updateGameTime = () => {
    gameTimeRef.current += GAME_LOOP_INTERVAL;
    setGameTime(gameTimeRef.current);
  };

  /**
   * ЗАВЕРШЕНИЕ ИГРЫ С ЗАЩИТОЙ ОТ МНОГОКРАТНОГО ВЫЗОВА
   */
  const gameOver = () => {
    if (gameStateRef.current === 'game-over') return;
    
    gameStateRef.current = 'game-over';
    
    if (saveSettingsTimeoutRef.current) {
      clearTimeout(saveSettingsTimeoutRef.current);
    }
    
    if (gameLoopInterval.current) {
      clearInterval(gameLoopInterval.current);
      gameLoopInterval.current = null;
    }
    
    safeVibrate(vibrationPatterns.gameOver);
    
    setGameState('game-over');
    
    if (scoreRef.current > gameSettings.bestScore) {
      setTimeout(() => {
        saveSettings({ ...gameSettings, bestScore: scoreRef.current });
      }, 0);
    }
  };

  /**
   * УПРАВЛЕНИЕ
   */
  const moveLeft = () => {
    if (gameStateRef.current === 'playing') {
      keysPressedRef.current.left = true;
      safeVibrate(vibrationPatterns.buttonPress);
    }
  };

  const moveRight = () => {
    if (gameStateRef.current === 'playing') {
      keysPressedRef.current.right = true;
      safeVibrate(vibrationPatterns.buttonPress);
    }
  };

  const stopMoving = () => {
    keysPressedRef.current.left = false;
    keysPressedRef.current.right = false;
  };

  const jumpLeft = () => {
    if (gameStateRef.current === 'playing' && isGroundedRef.current) {
      playerVelocityRef.current.y = JUMP_STRENGTH;
      isGroundedRef.current = false;
      safeVibrate(vibrationPatterns.buttonPress);
    }
  };

  const jumpRight = () => {
    if (gameStateRef.current === 'playing' && isGroundedRef.current) {
      playerVelocityRef.current.y = JUMP_STRENGTH;
      isGroundedRef.current = false;
      safeVibrate(vibrationPatterns.buttonPress);
    }
  };

  /**
   * ПЕРЕЗАПУСК ИГРЫ
   */
  const restartGame = () => {
    if (gameLoopInterval.current) {
      clearInterval(gameLoopInterval.current);
      gameLoopInterval.current = null;
    }
    
    if (saveSettingsTimeoutRef.current) {
      clearTimeout(saveSettingsTimeoutRef.current);
      saveSettingsTimeoutRef.current = null;
    }
    
    gameStateRef.current = 'playing';
    const initialPosition = { x: 100, y: screenHeight - 140 };
    playerXRef.current = initialPosition.x;
    playerYRef.current = initialPosition.y;
    playerVelocityRef.current = { x: 0, y: 0 };
    isGroundedRef.current = false;
    keysPressedRef.current = { left: false, right: false };
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameTimeRef.current = 0;
    
    setGameState('playing');
    setPlayerPosition(initialPosition);
    setScore(0);
    setCoins(0);
    setGameTime(0);
    setCameraOffset(0);
    
    initializeGame();
    startGameLoop();
  };

  const togglePause = () => {
    const newState = gameStateRef.current === 'playing' ? 'paused' : 'playing';
    gameStateRef.current = newState;
    setGameState(newState);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  /**
   * ФУНКЦИЯ ДЛЯ ОТРИСОВКИ С УЧЕТОМ КАМЕРЫ
   */
  const renderWithCameraOffset = (x) => {
    return x - cameraOffset;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* ФОН — небо с облаками */}
      <Image 
        source={require('../assets/textures/sky.png')} 
        style={styles.background}
        resizeMode="repeat"
      />

      {/* ЛОГО ИГРЫ — в верхней части, коричневый текст */}
      <Text style={styles.gameLogo}>Simple Runner</Text>
      
      {/* HUD — прозрачный, коричневый текст, в одну строку */}
      <View style={styles.hud}>
        <Text style={styles.hudText}>Счет: {score}</Text>
        <Text style={styles.hudText}>|</Text>
        <Text style={styles.hudText}>Монеты: {coins}</Text>
        <Text style={styles.hudText}>|</Text>
        <Text style={styles.hudText}>Время: {formatTime(gameTime)}</Text>
        <Text style={styles.hudText}>|</Text>
        <Text style={styles.hudText}>Рекорд: {gameSettings.bestScore}</Text>
      </View>
      
      {/* ПЛАТФОРМЫ — теперь с текстурой земли и травой, НЕ растянутой */}
      {platforms.map(platform => (
        <Image
          key={platform.id}
          source={require('../assets/textures/ground.png')}
          style={[
            platform.type === 'ground' ? styles.platformImage : styles.floatingPlatformImage,
            {
              left: renderWithCameraOffset(platform.x),
              top: platform.y,
              width: platform.width,
              height: platform.height,
            }
          ]}
          resizeMode="repeat" // ← ← ← КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: НЕ stretch, а repeat!
        />
      ))}
      
      {/* МОНЕТЫ */}
      {coinsList.map(coin => !coin.collected && (
        <Image
          key={coin.id}
          source={require('../assets/images/coin.png')}
          style={[
            styles.coin,
            {
              left: renderWithCameraOffset(coin.x),
              top: coin.y,
            }
          ]}
        />
      ))}
      
      {/* ВРАГИ */}
      {enemies.map(enemy => (
        <Image
          key={enemy.id}
          source={require('../assets/images/enemy.png')}
          style={[
            styles.enemy,
            {
              left: renderWithCameraOffset(enemy.x),
              top: enemy.y,
              width: enemy.width,
              height: enemy.height,
            }
          ]}
        />
      ))}
      
      {/* ИГРОК */}
      <Image 
        source={require('../assets/images/player.png')} 
        style={[
          styles.player, 
          { 
            left: renderWithCameraOffset(playerPosition.x),
            top: playerPosition.y,
            transform: [{ scaleX: playerVelocityRef.current.x < 0 ? -1 : 1 }]
          }
        ]} 
      />
      
      {/* ПАУЗА */}
      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseTitle}>ПАУЗА</Text>
          <TouchableOpacity style={styles.menuButton} onPress={togglePause}>
            <Text style={styles.menuButtonText}>Продолжить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={restartGame}>
            <Text style={styles.menuButtonText}>Начать заново</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.menuButtonText}>В меню</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* КОНЕЦ ИГРЫ */}
      {gameState === 'game-over' && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>ИГРА ОКОНЧЕНА</Text>
          <Text style={styles.gameOverScore}>Ваш счет: {score}</Text>
          <Text style={styles.gameOverCoins}>Собрано монет: {coins}</Text>
          <TouchableOpacity style={styles.menuButton} onPress={restartGame}>
            <Text style={styles.menuButtonText}>Играть снова</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Menu')}>
            <Text style={styles.menuButtonText}>В меню</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* УПРАВЛЕНИЕ — ДВЕ КНОПКИ ПРЫЖКА НАД ЛЕВОЙ И ПРАВОЙ КНОПКАМИ */}
      <View style={styles.controlContainer}>
        {/* КНОПКА ПРЫЖКА ЛЕВАЯ — над левой кнопкой движения */}
        <TouchableOpacity 
          style={styles.jumpLeftButton}
          onPress={jumpLeft}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>↑</Text>
        </TouchableOpacity>

        {/* КНОПКА ПРЫЖКА ПРАВАЯ — над правой кнопкой движения */}
        <TouchableOpacity 
          style={styles.jumpRightButton}
          onPress={jumpRight}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>↑</Text>
        </TouchableOpacity>

        {/* КНОПКА ВЛЕВО — левый нижний угол */}
        <TouchableOpacity 
          style={styles.leftButton}
          onPressIn={moveLeft}
          onPressOut={stopMoving}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>←</Text>
        </TouchableOpacity>

        {/* КНОПКА ВПРАВО — правый нижний угол */}
        <TouchableOpacity 
          style={styles.rightButton}
          onPressIn={moveRight}
          onPressOut={stopMoving}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>→</Text>
        </TouchableOpacity>
      </View>
      
      {/* КНОПКИ УПРАВЛЕНИЯ ИГРОЙ (в правом верхнем углу) */}
      <View style={styles.gameControls}>
        <TouchableOpacity 
          style={styles.gameControlButton}
          onPress={togglePause}
          activeOpacity={0.7}
        >
          <Text style={styles.gameControlButtonText}>⏸️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.gameControlButton}
          onPress={restartGame}
          activeOpacity={0.7}
        >
          <Text style={styles.gameControlButtonText}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.gameControlButton}
          onPress={() => navigation.navigate('Menu')}
          activeOpacity={0.7}
        >
          <Text style={styles.gameControlButtonText}>🚪</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    overflow: 'hidden',
  },
  background: { 
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'repeat'
  },
  gameLogo: {
    position: 'absolute',
    top: 10,
    left: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // ← ← ← КОРИЧНЕВЫЙ (сепия)
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    fontFamily: 'monospace',
    zIndex: 200,
  },
  hud: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // ← ← ← ПРОЗРАЧНО!
    borderWidth: 1,
    borderColor: '#8B4513', // ← ← ← Тонкая коричневая рамка
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 200,
    flexWrap: 'nowrap',
  },
  hudText: {
    color: '#8B4513', // ← ← ← ВСЁ — КОРИЧНЕВЫЙ!
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginHorizontal: 5,
  },
  player: { 
    width: 40, 
    height: 40, 
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 100,
  },
  platformImage: {
    position: 'absolute',
    borderRadius: 0,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  floatingPlatformImage: {
    position: 'absolute',
    borderRadius: 0,
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  coin: {
    width: 30,
    height: 30,
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 20,
  },
  enemy: {
    position: 'absolute',
    resizeMode: 'contain',
    zIndex: 50,
  },
  controlContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    flexDirection: 'column',
    gap: 10,
  },
  jumpLeftButton: {
    position: 'absolute',
    left: 55,
    bottom: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  jumpRightButton: {
    position: 'absolute',
    right: 55,
    bottom: 90,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 20,
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  leftButton: {
    position: 'absolute',
    left: 30,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 25,
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  rightButton: {
    position: 'absolute',
    right: 30,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 25,
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  controlButtonText: {
    color: '#8B4513', // ← ← ← КОРИЧНЕВЫЙ!
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  gameControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 200,
  },
  gameControlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    marginLeft: 10,
    borderRadius: 10,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  gameControlButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'monospace',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
  },
  pauseTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B4513', // ← ← ← КОРИЧНЕВЫЙ!
    marginBottom: 40,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameOverTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8B4513', // ← ← ← КОРИЧНЕВЫЙ!
    marginBottom: 20,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gameOverScore: {
    fontSize: 24,
    color: '#8B4513',
    marginBottom: 10,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gameOverCoins: {
    fontSize: 20,
    color: '#8B4513',
    marginBottom: 40,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuButton: {
    backgroundColor: 'rgba(139, 69, 19, 0.7)', // ← ← ← ТЕМНО-КОРИЧНЕВЫЙ
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B4513',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});