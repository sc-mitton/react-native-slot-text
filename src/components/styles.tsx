import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  animatedNumbers: {
    overflow: 'hidden',
  },
  spacer: {
    position: 'absolute',
    flexDirection: 'row',
    opacity: 0,
    gap: 2
  },
  slotsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  }
});

export default styles;
