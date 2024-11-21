import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  spacer: {
    width: 0,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  slotContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  hiddenSlot: {
    position: 'absolute',
    opacity: 0,
  }
});

export default styles;
