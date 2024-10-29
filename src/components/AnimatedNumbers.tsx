import { useEffect, useState, useRef, useCallback, Fragment } from "react";
import {
  View,
  Text,
  Animated
} from "react-native";
import type { LayoutChangeEvent } from "react-native";
import ReAnimated, { ZoomIn, StretchOutX } from 'react-native-reanimated';

import styles from './styles';
import Slot from './Slot';
import type { AnimatedNumbersProps, Position } from './types';
import { formatString } from "./helpers";

const DEFAULT_DURATION = 200;

/**
 * AnimatedNumbers Component
 *
 * This component animates numeric values, transitioning between old and new numbers.
 * It supports animation of individual digits, optional commas, and a customizable prefix.
 * The animation occurs over a defined duration and can be repeated as the value changes.
 *
 * @param {number|string} props.value - The value to animate to. Can be string of numbers.
 * @param {Object} props.fontStyle - The style of the text, passed as a TextStyle object.
 * @param {number} [props.animationDuration=200] - The duration of the animation in milliseconds. Defaults to 200ms.
 * @param {string} [props.prefix=""] - A prefix to the number, such as a currency symbol.
 * @param {boolean} [props.includeComma=false] - Whether to include commas as thousand separators.
 *
 * @returns {JSX.Element} The animated number component with slots for digits and commas.
 */
const AnimatedNumbers = (props: AnimatedNumbersProps) => {

  const idRef = useRef(`slots-${Math.random().toString(36).substring(7)}`);

  const [state, setState] = useState<'idle' | 'animating'>('idle');
  const [oldNumber, setOldNumber] = useState<(number | string)[]>([]);
  const [newNumber, setNewNumber] = useState<(number | string)[]>([]);
  const [animatingValue, setAnimatingValue] = useState<string>();

  // The initial positions of the slots that are animating in
  // -1 indicates above the slot, 0 indicates the slot, 1 indicates below the slot
  const [inZeroPositions, setInZeroPositions] = useState<(Position | undefined)[]>([]);
  // The final positions of the slots animating out
  const [outFinalPositions, setOutFinalPositions] = useState<(Position | undefined)[]>([]);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerWidth = useRef(new Animated.Value(0)).current;
  const containerHeight = useRef(new Animated.Value(0)).current;

  const measureRef = useRef<View>(null);

  useEffect(() => {
    setOldNumber(`${props.prefix || ''}${props.value}`
      .split('')
      .map((val, i) => isNaN(val as any) ? val : parseInt(val)))
  }, [])

  useEffect(() => {
    // Animation is in progress, queue the new value
    if (state === 'idle' && oldNumber.join('') !== formatString(props.value, props.prefix)) {
      setAnimatingValue(formatString(props.value, props.prefix));
    }
  }, [props.value, state])

  useEffect(() => {
    if (!animatingValue) return;
    setState('animating');

    // If the old number is not set, this means it's the initial rendering of this component
    // and the value needs to be loaded
    if (oldNumber?.length === 0) {
      setOldNumber(
        animatingValue
          .split('')
          .map((val, i) => isNaN(val as any) ? val : parseInt(val)))
    }
    // Prepare the new number for animation
    else {
      setNewNumber(
        animatingValue
          .split('')
          .map((val, i) => isNaN(val as any) ? val : parseInt(val)))

      // The positions of the slots that are animating in
      let newValuePositions: (Position | undefined)[] = Array(animatingValue.length).fill(0);
      // Compare from the right to the left
      // * If the slots are the same value, no animation is needed for the slot, just stick it in the -1 position
      // * If one of the slots is a string, the new slot will move down
      // * If the new slot is greater than the old slot, the new slot will move down
      // or up depending on which is greater
      for (let i = 0; i < newValuePositions.length; i++) {
        const oldNum = oldNumber[i];
        const newNum = isNaN(animatingValue.charAt(i) as any)
          ? animatingValue.charAt(i)
          : parseInt(animatingValue.charAt(i));

        if (oldNum === newNum) {
          newValuePositions[i] = undefined;
        } else {
          newValuePositions[i] = typeof oldNum === 'string' || typeof newNum === 'string'
            ? -1
            : oldNum === undefined ? -1 : newNum > oldNum ? -1 : 1;
        }
      }
      setInZeroPositions(newValuePositions);

      setOutFinalPositions([
        ...newValuePositions.slice(0, oldNumber.length).map(val => val ? val * -1 : 0),
        ...Array(Math.max(0, oldNumber.length - animatingValue.length)).fill(-1)
      ])
    }
  }, [animatingValue])

  const onMeasureLayout = useCallback((e: LayoutChangeEvent) => {
    if (containerSize.width === 0) {
      containerWidth.setValue(e.nativeEvent.layout.width);
      containerHeight.setValue(e.nativeEvent.layout.height);
    } else {
      Animated.timing(containerWidth, {
        toValue: e.nativeEvent.layout.width,
        useNativeDriver: false,
        duration: containerSize.width > e.nativeEvent.layout.width ? props.animationDuration || DEFAULT_DURATION : 0
      }).start();
      Animated.timing(containerHeight, {
        toValue: e.nativeEvent.layout.height,
        duration: 100,
        useNativeDriver: false
      }).start();
    }
    setContainerSize(e.nativeEvent.layout);
  }, [])

  const onCompleted = useCallback(() => {
    setOldNumber(newNumber);
    setNewNumber([]);
    setInZeroPositions([]);
    setOutFinalPositions([]);
    setState('idle');
  }, [newNumber])

  return (
    <>
      <Animated.View style={[
        { width: containerWidth, height: containerHeight },
        styles.animatedNumbers
      ]}>
        <View style={styles.slotsContainer}>
          {oldNumber.map((val, i) => (
            <Fragment key={`${idRef}-slot-${i}`}>
              {(oldNumber.length - i) % 3 === 0 && i > 1 && props.includeComma &&
                <ReAnimated.View
                  key={`${idRef}-comma-${i}-old`}
                  entering={ZoomIn.delay(props.animationDuration || DEFAULT_DURATION).withInitialValues({ opacity: 0 })}
                  exiting={StretchOutX.withInitialValues({ opacity: 1 }).duration(props.animationDuration || DEFAULT_DURATION)}
                >
                  <Text style={props.fontStyle}>,</Text>
                </ReAnimated.View>
              }
              <Slot
                key={`${idRef}-${val}-${i}-old`}
                value={val}
                height={containerSize.height}
                initial={0}
                final={outFinalPositions[i] || 0}
                animationDuration={props.animationDuration || DEFAULT_DURATION}
                fontStyle={props.fontStyle}
              />
            </Fragment>
          ))}
        </View>
        <View style={styles.slotsContainer}>
          {newNumber.map((val, i) => (
            <Fragment key={`${idRef}-${val}-${i}-new`}>
              {(newNumber.length - i) % 3 === 0 && i > 1 && props.includeComma &&
                <ReAnimated.View
                  entering={ZoomIn.delay(props.animationDuration || DEFAULT_DURATION)}
                  exiting={StretchOutX.withInitialValues({ opacity: 1 }).duration(props.animationDuration || DEFAULT_DURATION)}
                  style={styles.hiddenComma}
                >
                  <Text style={props.fontStyle}>,</Text>
                </ReAnimated.View>
              }
              <Slot
                value={val}
                initial={inZeroPositions[i] || -1}
                final={inZeroPositions[i] ? 0 : -1}
                height={containerSize.height}
                animationDuration={props.animationDuration || DEFAULT_DURATION}
                fontStyle={props.fontStyle}
                onCompleted={onCompleted}
              />
            </Fragment>
          ))}
        </View>
      </Animated.View>
      {newNumber.length > 0 &&
        <View
          onLayout={onMeasureLayout}
          style={styles.spacer}
          ref={measureRef}
        >
          {props.prefix && <Text style={props.fontStyle}>{props.prefix}</Text>}
          {newNumber.map((val, i) => (
            <Text key={`${val}-${i}`} style={props.fontStyle}>
              {val}
            </Text>
          ))}
        </View>}
    </>
  )
}

/*
Basic logic:

When a new value comes in:

1. If there is an animation currently in progress then queue the new value with any prefix prepended

2. For an animation cycle, split the new number and set the new number state

3. Loop through the new number and old number and compare digits, determing which way the new numbers
and old numers need to animate. There are two versions of the number, one that's visible, and one outside
the visible clipping container. If a slot has the same number between the old and new nummer, it wont be animated.

4. Set the new positions wich will trigger the animations of the slots

5. At the end, clear the new number and set the old number to the new number

6. Pop any queued values and set the formated value, which will retriger the animation cycle

*/

export default AnimatedNumbers;
