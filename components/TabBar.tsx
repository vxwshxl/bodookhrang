import { StyleSheet, View, Dimensions, LayoutChangeEvent } from 'react-native';

import TabBarButton from './TabBarButton';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

function TabBar({ state, descriptors, navigation }: BottomTabBarButtonProps) {

  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / state.routes.length;
  const indicatorWidth = buttonWidth - 20;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width
    })
  };

  const tabPositionX = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }]
    }
  });

  return (
    <View onLayout={onTabbarLayout} style={styles.tabbar}>
      {/* Blur background layer */}
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
  
      {/* Animated indicator */}
      <Animated.View
        style={[
          animatedStyle,
          {
            position: 'absolute',
            backgroundColor: '#fff',
            borderRadius: 50,
            marginHorizontal: 9,
            height: dimensions.height - 15,
            width: indicatorWidth,
          },
        ]}
      />
  
      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel ?? options.title ?? route.name;
  
        const isFocused = state.index === index;
  
        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            damping: 90,
            stiffness: 1000,
          });
  
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
  
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };
  
        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };
  
        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            color={isFocused ? '#29292B' : '#fff'}
            label={label}
          />
        );
      })}
    </View>
  );  
}

export default TabBar

const styles = StyleSheet.create({
  tabbar: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 80,
    paddingVertical: 15,
    borderRadius: 50,
    overflow: 'hidden', // IMPORTANT: ensures blur corners match radius
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // subtle base tint
  },
});