import type { StyleProp, TextStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type Position = -1 | 0 | 1;

export type SlotValue = [number] | [number | null, number | null]

export interface SlotProps {
  slot: SlotValue;
  index: number;
  animationDuration: number;
  fontStyle?: StyleProp<TextStyle>;
  commaWidth: number;
  onCompleted?: () => void;
  commaPositions?: CommaPosition[];
  charSizes: number[];
  height: number;
}

// 1 indicates entering, -1 indicates exiting, 0 indicates idle, null indicates no comma
export type CommaPosition = 1 | -1 | 0 | null;

export interface CommaProps {
  isEntering: boolean;
  isExiting: boolean;
  width: SharedValue<number>;
  animationDuration: number;
  fontStyle?: StyleProp<TextStyle>;
  onExited: () => void;
  onEntered: () => void;
}

export interface AnimatedNumbersProps {
  value: number;
  fontStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  prefix?: string;
  includeComma?: boolean;
}
