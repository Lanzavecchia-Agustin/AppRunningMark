import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

const Home = () => {
  const [intervals, setIntervals] = useState([]);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(null);
  const [countdownValue, setCountdownValue] = useState({ category: '', minutes: 0, seconds: 0 });
  const [completedSets, setCompletedSets] = useState(0); // Track completed sets

  const animation = new Animated.Value(0);

  useEffect(() => {
    // Simulación de carga de intervalos
    const loadedIntervals = [
      {
        id: '1',
        name: 'Intervalo 1',
        stages: [
          { category: 'Preparación', minutes: 0, seconds: 5 },
          { category: 'Trabajo', minutes: 0, seconds: 3 },
          { category: 'Descanso', minutes: 0, seconds: 2 },
        ],
        sets: 2,
      },
      {
        id: '2',
        name: 'Intervalo 2',
        stages: [
          { category: 'Preparación', minutes: 0, seconds: 3 },
          { category: 'Trabajo', minutes: 0, seconds: 8 },
          { category: 'Descanso', minutes: 0, seconds: 4 },
        ],
        sets: 3,
      },
      {
        id: '3',
        name: 'Intervalo 3',
        stages: [
          { category: 'Preparación', minutes: 0, seconds: 7 },
          { category: 'Trabajo', minutes: 1, seconds: 0 },
          { category: 'Descanso', minutes: 0, seconds: 6 },
        ],
        sets: 2,
      },
    ];

    setIntervals(loadedIntervals);
  }, []);
  
  const startCountdown = ({ category, minutes, seconds }, intervalIndex, stageIndex) => {
    // Calculate remaining time based on initial duration and animation progress (if applicable)
    let totalSeconds = minutes * 60 + seconds;
    let elapsedTime = 0;
    if (stageIndex > 0 && currentIntervalIndex === intervalIndex) {
      const prevStageDuration = intervals[intervalIndex].stages[stageIndex - 1].minutes * 60 + intervals[intervalIndex].stages[stageIndex - 1].seconds;
      elapsedTime = prevStageDuration * animation._value; // Pre-calculate elapsed time
      totalSeconds = Math.max(totalSeconds - elapsedTime, 0); // Ensure non-negative value
    }
  
    setCountdownValue({ category, minutes, seconds });
    animation.setValue(0);
    Animated.timing(animation, {
      toValue: 1,
      duration: totalSeconds * 1000, // Use adjusted totalSeconds
      easing: Easing.linear,
      useNativeDriver: false, // Try setting to false for better compatibility
    }).start(() => {
      // Avanzar al siguiente stage o intervalo si corresponde
      if (stageIndex < intervals[intervalIndex].stages.length - 1) {
        setCurrentStageIndex(stageIndex + 1);
        setCurrentIntervalIndex(intervalIndex);
        const nextStage = intervals[intervalIndex].stages[stageIndex + 1];
        startCountdown(nextStage, intervalIndex, stageIndex + 1);
      } else {
        const currentInterval = intervals[intervalIndex];
        if (currentInterval.sets > completedSets) {
          setCurrentStageIndex(1); // Reiniciar al trabajo para el siguiente set
          setCompletedSets(prevSets => prevSets + 1); // Actualizar el estado usando la función de actualización
          const nextStage = intervals[intervalIndex].stages[1];
          startCountdown(nextStage, intervalIndex, 1);
        } else {
          // Finalizar el intervalo
          setCurrentIntervalIndex(null);
          setCurrentStageIndex(null);
          setCompletedSets(0); // Reset completedSets for the next interval
          animation.stop(); // Stop the animation on interval completion
        }
      }
    });
  
    // Actualizar countdownValue mientras el countdown está en progreso
    animation.addListener((progress) => {
      const remainingSeconds = Math.ceil((1 - progress.value) * (totalSeconds - elapsedTime)); // Use pre-calculated elapsedTime
      const remainingMinutes = Math.floor(remainingSeconds / 60);
      const remainingSecondsInMinute = remainingSeconds % 60;
      setCountdownValue({ category, minutes: remainingMinutes, seconds: remainingSecondsInMinute });
    });
  };
  
  
  const handleIntervalPress = (intervalIndex) => {
    setCurrentIntervalIndex(intervalIndex);
    setCurrentStageIndex(0); // Comenzar con la etapa de preparación
    const stage = intervals[intervalIndex].stages[0];
    startCountdown(stage, intervalIndex, 0);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {intervals.map((interval, intervalIndex) => (
          <TouchableOpacity
            key={interval.id}
            style={styles.intervalContainer}
            onPress={() => handleIntervalPress(intervalIndex)}
          >
            <Text style={styles.intervalName}>{interval.name}</Text>
            {interval.stages.map((stage, stageIndex) => (
              <Text key={stageIndex} style={styles.intervalText}>
                {stage.category}: {stage.minutes} min {stage.seconds} seg
              </Text>
            ))}
            <Text style={styles.intervalText}>Sets: {interval.sets}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {currentIntervalIndex !== null && (
        <View style={styles.countdownContainer}>
          <Animated.View
            style={[
              styles.countdownCircle,
              {
                transform: [
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.countdownText}>
              {countdownValue.category}: {countdownValue.minutes} min {countdownValue.seconds} seg
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  intervalContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
  },
  intervalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  intervalText: {
    fontSize: 16,
    color: 'black',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Home;