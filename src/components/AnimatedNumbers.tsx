import { useState, useRef, Fragment, useLayoutEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { useSharedValue } from 'react-native-reanimated';

import styles from './styles';
import Slot from './Slot';
import type { AnimatedNumbersProps, CommaPosition, SlotValue } from './types';
import { getNewSlots, getNewCommaPositions } from './helpers';

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
  // [number] : static number
  /// [number, null]: removing slot
  // [null, number]: adding slot
  // [number, number]: animating slot

  const idRef = useRef(`slots-${Math.random().toString(36).substring(7)}`);

  // Indexes of slots that have finished animating
  const slotsTrashBin = useSharedValue<number[]>([]);
  const queuedNumber = useSharedValue<typeof props.value | null>(null);

  const [slots, setSlots] = useState<SlotValue[]>([]);
  const [commaPositions, setCommaPositions] = useState<CommaPosition[]>([]);
  const [commaWidth, setCommaWidth] = useState(0);
  const [sizesMeasured, setSizesMeasured] = useState(false);
  const [keys, setKeys] = useState<number[]>(Array.from({ length: props.value.toString().length }).map((_, i) => i));
  const [slotHeight, setSlotHeight] = useState(0);
  const [charSizes, setCharSizes] = useState<number[]>(Array.from({ length: 10 }).map((_, i) => 0));

  useLayoutEffect(() => {
    if (slots.some(s => s.length > 1)) {
      queuedNumber.value = props.value;
    } else {
      const parseFromLeft = props.value.toString()[0] === slots[0]?.[0]?.toString();
      if (props.includeComma) {
        const newCommaPositions = getNewCommaPositions(
          props.value.toString(),
          commaPositions,
          parseFromLeft
        );
        setCommaPositions(newCommaPositions);
      }
      const newSlots = getNewSlots(props.value, slots, parseFromLeft);
      setKeys(Array.from({ length: newSlots.length }).map((_, i) => i));
      setSlots(newSlots);
    }
  }, [props.value]);

  const onCompleted = useCallback(() => {
    const cleanedSlots = slots
      .filter(s => (Number.isFinite(s[0]) && s[1] !== null) || Number.isFinite(s[1]))
      .map(s => Number.isFinite(s[1]) ? [s[1]] as SlotValue : [s[0]] as SlotValue)

    const numberOfSlotsRemoved = Math.max(slots.length - cleanedSlots.length, 0);
    const cleanedCommas = commaPositions
      .map(c => c === -1 ? null : c === 1 ? 0 : c)
      .slice(slots[0]?.[1] === null ? numberOfSlotsRemoved : 0) // Trim from left
      .slice(0, slots[slots.length - 1]?.[1] === null ? -1 * numberOfSlotsRemoved : undefined) // Trim from right

    if (cleanedSlots.length < slots.length) {
      setKeys(prev => prev.slice(-1 * cleanedSlots.length));
    } else {
      setKeys(Array.from({ length: cleanedSlots.length }).map((_, i) => i));
    }
    setSlots(cleanedSlots);
    setCommaPositions(cleanedCommas);

    slotsTrashBin.value = [];
  }, [slots, commaPositions]);

  return (
    <>
      <View style={styles.slotsContainer}>
        {props.prefix && (
          <Text style={props.fontStyle}>
            {props.prefix}
          </Text>
        )}
        {slots.map((slot, i) => {
          const callback = i === slots.findIndex(s => s.length > 1) ? onCompleted : undefined;
          return (
            <Slot
              slot={slot}
              index={i}
              key={`${idRef.current}-${keys[i]}`}
              height={slotHeight}
              charSizes={charSizes}
              commaWidth={commaWidth}
              commaPositions={props.includeComma && commaPositions.length ? commaPositions : undefined}
              onCompleted={callback}
              animationDuration={(props.animationDuration || DEFAULT_DURATION)}
              fontStyle={props.fontStyle}
            />
          )
        })}
        {/* Spacer Text to make sure container height sizes right */}
        <Text style={[styles.spacer, props.fontStyle]}>1</Text>
      </View>
      {!sizesMeasured && Array.from({ length: 10 }).concat(',').map((_, i) => (
        <Fragment key={`measure-slot-${i}`}>
          <Text
            key={`slot-${i}`}
            style={[styles.hiddenSlot, props.fontStyle]}
            onLayout={(e) => {
              setSlotHeight(e.nativeEvent.layout.height);
              if (i === 10) {
                setCommaWidth(e.nativeEvent.layout.width);
              } else {
                const charSize = e.nativeEvent.layout.width;
                setCharSizes(prev => {
                  const newSizes = [...prev];
                  newSizes[i] = charSize;
                  return newSizes;
                });
                setSizesMeasured(true);
              }
            }}
          >
            {i === 10 ? ',' : i}
          </Text>
        </Fragment>
      ))}
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
