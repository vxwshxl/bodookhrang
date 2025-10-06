import { Feather } from '@expo/vector-icons';
import React from 'react';

export const icon = {
    index: (props: any) => (
        <Feather name='compass' size={24} {...props} />
    ),
    camera: (props: any) => (
        <Feather name='camera' size={24} {...props} />
    ),
    translate: (props: any) => (
        <Feather name='compass' size={24} {...props} />
    ),
    profile: (props: any) => (
        <Feather name='user' size={24} {...props} />
    ),
}