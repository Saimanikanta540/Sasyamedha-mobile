import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

/**
 * NativeWind only auto-patches its own known core React Native components
 * (View, Text, Image, ...) to accept `className` — third-party native
 * components like expo-linear-gradient's LinearGradient silently ignore it
 * unless explicitly registered with cssInterop. Without this, `className`
 * on a bare `<LinearGradient>` does nothing: the component gets no size/
 * style at all, collapses to nothing, and whatever text sits on top of it
 * (usually white, styled for the gradient) goes invisible against
 * whatever's actually behind it. Import LinearGradient from here instead
 * of 'expo-linear-gradient' directly, anywhere `className` is used on it.
 */
// cssInterop returns a *new* wrapped component — it does not patch
// ExpoLinearGradient in place, so the return value is what must be exported.
export const LinearGradient = cssInterop(ExpoLinearGradient, { className: 'style' });
