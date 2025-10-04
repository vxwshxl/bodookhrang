import { icon } from '@/constants/icon'
import { PlatformPressable } from '@react-navigation/elements'
import React, { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

const TabBarButton = (
    {
        onPress, onLongPress, isFocused, routeName, color
    } : {
        onPress:Function;
        onLongPress:Function;
        isFocused:boolean;
        routeName:string;
        color:string
    }) => {
        const scale = useSharedValue(0);

        useEffect(() => {
            scale.value = withSpring(
                typeof isFocused === 'boolean' ? (isFocused ? 1 : 0) : isFocused,
                { duration: 350 }
            );
        }, [scale, isFocused])

        const animatedIconStyle = useAnimatedStyle(() => {
            const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])

            return {
                transform: [{
                    scale: scaleValue
                }]
            }
        });

        return (
            <PlatformPressable
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabbarItem}
                >
                <Animated.View style={animatedIconStyle}>
                    {icon[routeName]({
                        color: isFocused ? "#29292B" : "#C9C7BA"
                    })}
                </Animated.View>
            </PlatformPressable>
        )
}

export default TabBarButton

const styles = StyleSheet.create({
    tabbarItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
    }
})