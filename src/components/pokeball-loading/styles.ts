import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
});