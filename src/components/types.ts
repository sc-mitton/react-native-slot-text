import { Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

export type Position = -1 | 0 | 1;

export interface SlotProps {
  value: number | string;
  animationDuration: number;
  fontStyle?: StyleProp<TextStyle>;
  initial: Position;
  final: Position;
  height: number;
  isNew?: boolean;
  onCompleted?: () => void;
}

export interface AnimatedNumbersProps {
  value: `${number}`;
  fontStyle?: StyleProp<TextStyle>;
  animationDuration?: number;
  prefix?: string;
  includeComma?: boolean;
}
