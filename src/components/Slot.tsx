import { useRef, useEffect } from 'react';
import { Text, Animated } from 'react-native';

import type { SlotProps } from './types';

const Slot = (props: SlotProps) => {
  const Y = useRef<Animated.Value>(new Animated.Value(props.initial * props.height));

  useEffect(() => {
    if (props.final !== undefined) {
      Animated.timing(Y.current, {
        toValue: props.final * props.height,
        duration: props.animationDuration,
        useNativeDriver: true
      }).start(() => {
        if (props.onCompleted) {
          props.onCompleted();
        }
      });
    }
  }, [props.final])

  return (
    <Animated.View style={[{
      transform: [{ translateY: Y.current }],
      opacity: Y.current.interpolate({
        inputRange: [-1 * props.height, 0, props.height],
        outputRange: [0, 1, 0]
      })
    }]}>
      <Text style={props.fontStyle}>{props.value}</Text>
    </Animated.View>
  )
}

export default Slot;
