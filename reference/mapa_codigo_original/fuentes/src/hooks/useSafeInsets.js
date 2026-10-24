import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IOS_STANDALONE_TOP = 47;
const IOS_STANDALONE_BOTTOM = 34;

function isIOSStandaloneWeb() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return (
    window.navigator.standalone === true ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  );
}

export function useSafeInsets() {
  const measured = useSafeAreaInsets();
  const standalone = isIOSStandaloneWeb();

  return {
    top: measured.top > 0 ? measured.top : standalone ? IOS_STANDALONE_TOP : 0,
    bottom: measured.bottom > 0 ? measured.bottom : standalone ? IOS_STANDALONE_BOTTOM : 0,
    left: measured.left,
    right: measured.right,
  };
}
