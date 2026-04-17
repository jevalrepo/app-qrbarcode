import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory } from '@/hooks/useHistory';
import { detectType } from '@/lib/detectType';
import { useT, useAccent } from '@/context/SettingsContext';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.68;
const CORNER = 24;
const BORDER_W = 2.5;
const MAX_ZOOM = 0.9;

export default function ScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraZoom, setCameraZoom] = useState(0);
  const { addToHistory } = useHistory();
  const t = useT();
  const s = t.scanner;
  const accent = useAccent();

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const frameScale = useRef(new Animated.Value(1)).current;
  const currentZoomRef = useRef(0);
  const startZoomRef = useRef(0);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const isSecureContext = Platform.OS !== 'web'
    || (typeof window !== 'undefined' && window.isSecureContext);

  const setZoom = useCallback((val: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(0, val));
    currentZoomRef.current = next;
    setCameraZoom(next);
  }, []);

  const getPinchDistance = useCallback((touches: readonly { pageX: number; pageY: number }[]) => {
    if (touches.length < 2) return null;
    const [a, b] = touches;
    const dx = a.pageX - b.pageX;
    const dy = a.pageY - b.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => gestureState.numberActiveTouches >= 2,
      onStartShouldSetPanResponderCapture: (_, gestureState) => gestureState.numberActiveTouches >= 2,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.numberActiveTouches >= 2,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => gestureState.numberActiveTouches >= 2,
      onPanResponderGrant: (evt) => {
        const distance = getPinchDistance(evt.nativeEvent.touches);
        if (distance === null) return;
        pinchStartDistanceRef.current = distance;
        startZoomRef.current = currentZoomRef.current;
      },
      onPanResponderMove: (evt) => {
        const distance = getPinchDistance(evt.nativeEvent.touches);
        if (distance === null || pinchStartDistanceRef.current === null) return;

        const delta = (distance - pinchStartDistanceRef.current) / 240;
        setZoom(startZoomRef.current + delta);
      },
      onPanResponderRelease: () => {
        pinchStartDistanceRef.current = null;
        startZoomRef.current = currentZoomRef.current;
      },
      onPanResponderTerminate: () => {
        pinchStartDistanceRef.current = null;
        startZoomRef.current = currentZoomRef.current;
      },
    }),
  ).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [scanLineAnim]);

  const handleBarcode = useCallback(
    async (result: BarcodeScanningResult) => {
      if (scanned) return;
      setScanned(true);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Animated.sequence([
        Animated.timing(frameScale, { toValue: 1.06, duration: 100, useNativeDriver: true }),
        Animated.timing(frameScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const data = result.data;
      const type = detectType(data);
      await addToHistory({ data, type });

      router.replace({ pathname: '/result', params: { data, type } });
    },
    [scanned, frameScale, addToHistory, router],
  );

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    const title = isSecureContext ? s.camTitle : s.camWebSecureTitle;
    const description = isSecureContext ? s.camDesc : s.camWebSecureDesc;

    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-outline" size={56} color={accent} />
        <Text className="text-white text-xl font-medium text-center mt-6 mb-2">{title}</Text>
        <Text className="text-gray-400 text-sm text-center mb-8">{description}</Text>
        {isSecureContext && (
          <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: accent }} className="px-8 py-4 rounded-2xl">
            <Text className="text-white font-medium text-base">{s.allow}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-8 py-3">
          <Text className="text-gray-400 text-sm">{s.cancel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 2],
  });

  const showZoomLabel = cameraZoom > 0.02;
  const zoomLabel = `${(1 + cameraZoom * 4).toFixed(1)}×`;

  return (
    <View className="flex-1 bg-black" {...panResponder.panHandlers}>
      <CameraView
        style={{ flex: 1 }}
        zoom={cameraZoom}
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr', 'ean13', 'ean8', 'upc_a', 'upc_e',
            'code128', 'code39', 'pdf417', 'aztec', 'datamatrix', 'itf14',
          ],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcode}
      />

      {/* dark overlay */}
      <View className="absolute inset-0" pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        <View style={{ flexDirection: 'row', height: FRAME_SIZE }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
          <Animated.View
            style={{
              width: FRAME_SIZE,
              height: FRAME_SIZE,
              transform: [{ scale: frameScale }],
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: 0, right: 0,
                height: 2,
                backgroundColor: accent,
                opacity: 0.8,
                transform: [{ translateY: scanLineY }],
              }}
            />
            {[
              { top: 0, left: 0 },
              { top: 0, right: 0 },
              { bottom: 0, left: 0 },
              { bottom: 0, right: 0 },
            ].map((pos, i) => (
              <View
                key={i}
                style={[
                  { position: 'absolute', width: CORNER, height: CORNER, borderColor: accent },
                  pos,
                  i === 0 && { borderTopWidth: BORDER_W, borderLeftWidth: BORDER_W, borderTopLeftRadius: 4 },
                  i === 1 && { borderTopWidth: BORDER_W, borderRightWidth: BORDER_W, borderTopRightRadius: 4 },
                  i === 2 && { borderBottomWidth: BORDER_W, borderLeftWidth: BORDER_W, borderBottomLeftRadius: 4 },
                  i === 3 && { borderBottomWidth: BORDER_W, borderRightWidth: BORDER_W, borderBottomRightRadius: 4 },
                ]}
              />
            ))}
          </Animated.View>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
        </View>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      </View>

      {/* header */}
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-5 pb-4"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        >
          <Ionicons name="close" size={22} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-medium text-base">{s.title}</Text>
        <TouchableOpacity
          onPress={() => setTorch((t) => !t)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: torch ? accent : 'rgba(0,0,0,0.4)' }}
        >
          <Ionicons name={torch ? 'flash' : 'flash-outline'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* zoom label */}
      {showZoomLabel && (
        <View
          className="absolute self-center rounded-xl px-3 py-1"
          style={{ bottom: 112, backgroundColor: 'rgba(0,0,0,0.55)' }}
        >
          <Text className="text-white text-sm font-medium">{zoomLabel}</Text>
        </View>
      )}

      {/* hint */}
      <View className="absolute bottom-0 left-0 right-0 items-center pb-16">
        <Text className="text-white/60 text-sm">
          {showZoomLabel ? s.hintZoom : s.hint}
        </Text>
        {scanned && (
          <TouchableOpacity
            onPress={() => setScanned(false)}
            className="mt-4 bg-accent px-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-medium">{s.scanAgain}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
