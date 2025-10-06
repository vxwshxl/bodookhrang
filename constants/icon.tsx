import { Feather } from '@expo/vector-icons';
import React from 'react';

export const icon = {
    okhrangpt: (props: any) => (
        <Feather name='compass' size={24} {...props} />
    ),
    index: (props: any) => (
        <Feather name='home' size={24} {...props} />
    ),
    camera: (props: any) => (
        <Feather name='camera' size={24} {...props} />
    ),
}