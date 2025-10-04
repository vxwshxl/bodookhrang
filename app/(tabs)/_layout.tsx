import React from 'react'
import { Tabs } from 'expo-router'
import TabBar from '@/components/TabBar'

const TabLayout = () => {
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>
        <Tabs.Screen name='index' options={{title: 'Home', headerShown: false}} />
        <Tabs.Screen name='camera' options={{title: 'Camera', headerShown: false}} />
        <Tabs.Screen name='okhrangpt' options={{title: 'Okhrangpt', headerShown: false}} />
    </Tabs>
  )
}

export default TabLayout