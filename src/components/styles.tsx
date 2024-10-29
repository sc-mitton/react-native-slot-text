import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  animatedNumbers: {
    overflow: 'hidden',
  },
  spacer: {
    position: 'absolute',
    flexDirection: 'row',
    opacity: 0,
  },
  slotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hiddenComma: {
    opacity: 0,
  }
});

export default styles;
