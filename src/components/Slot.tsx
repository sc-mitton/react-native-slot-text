import { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSequence,
  useAnimatedStyle,
  interpolate,
  runOnJS
} from 'react-native-reanimated';

import styles from './styles';
import type { SlotProps } from './types';

const Slot = (props: SlotProps) => {
  const [value1, setValue1] = useState<number | null>();
  const [value2, setValue2] = useState<number | null>();
  const margin = useSharedValue(0);
  const y = useSharedValue(0);
  const incomingY = useSharedValue(0);
  const commaScale = useSharedValue(0);
  const commaWidth = useSharedValue(0);

  // React to slot value changes
  useLayoutEffect(() => {
    if (!props.slot) {
      return;
    }

    const incomingValue = props.slot[1];
    const currentValue = props.slot[0];

    if (incomingValue === undefined) {
      y.value = 0;
      incomingY.value = props.height;
      margin.value = 0;
    }
    // Removing slot
    else if (incomingValue === null) {
      y.value = withTiming(
        -1 * props.height,
        { duration: props.animationDuration },
        () => {
          props.onCompleted && runOnJS(props.onCompleted)()
        }
      )
      margin.value = withTiming(
        -1 * props.charSizes[currentValue!],
        { duration: props.animationDuration / 2 }
      )
    }
    // Adding slot
    else if (currentValue === null) {
      margin.value = withTiming(
        props.charSizes[incomingValue],
        { duration: props.animationDuration / 2 }
      )
      incomingY.value = withSequence(
        withTiming(-1 * props.height, { duration: 0 }),
        withTiming(
          0,
          { duration: props.animationDuration },
          () => {
            props.onCompleted && runOnJS(props.onCompleted)()
          }
        )
      )
    }
    // Animating slot
    else {
      margin.value = withTiming(
        (props.charSizes[incomingValue] - props.charSizes[currentValue]),
        { duration: props.animationDuration / 2 }
      )
      if (incomingValue > currentValue) {
        y.value = withTiming(props.height, { duration: props.animationDuration });
        incomingY.value = withSequence(
          withTiming(-1 * props.height, { duration: 0 }),
          withTiming(
            0,
            { duration: props.animationDuration },
            () => { props.onCompleted && runOnJS(props.onCompleted)() }
          )
        );
      } else if (incomingValue < currentValue) {
        y.value = withTiming(-1 * props.height, { duration: props.animationDuration });
        incomingY.value = withSequence(
          withTiming(1 * props.height, { duration: 0 }),
          withTiming(
            0,
            { duration: props.animationDuration },
            () => { props.onCompleted && runOnJS(props.onCompleted)() }
          )
        );
      }
    }
  }, [props.slot]);

  useLayoutEffect(() => {
    if (props.slot) {
      setValue1(props.slot[0]);
      setValue2(props.slot[1]);
    }
  }, [props.slot]);

  useLayoutEffect(() => {
    if (props.commaPositions?.[props.index] === 1) {
      commaScale.value = withTiming(
        1,
        { duration: props.animationDuration },
      );
      commaWidth.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(props.commaWidth, { duration: props.animationDuration })
      )
    } else if (props.commaPositions?.[props.index] === -1) {
      commaScale.value = withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(0, { duration: props.animationDuration })
      )
      const timeout = setTimeout(() => {
        commaWidth.value = withTiming(
          0,
          { duration: props.animationDuration }
        );
      }, 0);
      return () => clearTimeout(timeout);
    } else if (props.commaPositions?.[props.index] === 0) {
      commaScale.value = 1;
      commaWidth.value = props.commaWidth;
    } else {
      commaScale.value = 0;
      commaWidth.value = 0;
    }
  }, [props.commaPositions, props.commaWidth]);

  const commaStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commaScale.value }],
    width: commaWidth.value
  }));

  const currentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.value },
      { scale: interpolate(y.value, [-1 * props.height, 0, props.height], [0, 1, 0]) }
    ],
    marginRight: margin.value,
    opacity: interpolate(y.value, [-1 * Math.pow(props.height, .95), 0, Math.pow(props.height, .95)], [0, 1, 0]),
  }));

  const incomingStyle = useAnimatedStyle(() => {
    return ({
      transform: [
        { translateY: incomingY.value },
        { scale: interpolate(incomingY.value, [-1 * props.height, 0, props.height], [0, 1, 0]) },
      ],
      opacity: interpolate(incomingY.value, [-1 * Math.pow(props.height, .95), 0, Math.pow(props.height, .95)], [0, 1, 0]),
      position: 'absolute'
    })
  });

  const incomingTextStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${interpolate(incomingY.value, [-1 * props.height / 2, 0, props.height / 2], [90, 0, -90])}deg` }]
  }));
  const currentTextStyle = useAnimatedStyle(() => ({
    transform: [{ rotateX: `${interpolate(y.value, [-1 * props.height / 2, 0, props.height / 2], [90, 0, -90])}deg` }]
  }));

  return (
    <View style={styles.slotContainer}>
      <Animated.View style={currentStyle} >
        {Number.isFinite(value1) &&
          <Animated.Text style={[props.fontStyle, currentTextStyle]}>
            {value1}
          </Animated.Text>}
      </Animated.View>
      <Animated.View style={incomingStyle}>
        {Number.isFinite(value2) &&
          <Animated.Text style={[props.fontStyle, incomingTextStyle]}>
            {value2}
          </Animated.Text>}
      </Animated.View>
      <Text style={styles.hiddenSlot}>1</Text>
      <Animated.View style={commaStyle}>
        <Text style={props.fontStyle}>,</Text>
      </Animated.View>
    </View>
  )
}

export default Slot;
