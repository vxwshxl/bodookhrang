import { StyleSheet, View, Dimensions, LayoutChangeEvent } from 'react-native';

import TabBarButton from './TabBarButton';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
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
      <Animated.View style={[animatedStyle, {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 30,
        marginHorizontal: 9,
        height: dimensions.height - 15,
        width: indicatorWidth,
      }]} />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index,
          {
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
            color={isFocused ? "#29292B" : "#fff"}
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
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#29292B',
    marginHorizontal: 80,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
  },
});