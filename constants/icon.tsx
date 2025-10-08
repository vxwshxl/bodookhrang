import { Feather, MaterialIcons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import React from 'react';

export const icon = {
    index: (props: any) => (
        <MaterialIcons name="dashboard" size={24} {...props} />
    ),
    translate: (props: any) => (
        <MaterialCommunityIcons name="translate" size={24} {...props} />
    ),
    bodoland: (props: any) => (
        <FontAwesome6 name="1" size={24} {...props} />
    ),
    profile: (props: any) => (
        <Fontisto name="user-secret" size={24} {...props} />
    ),
}