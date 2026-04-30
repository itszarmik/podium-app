import React, { useRef, useState } from 'react'
import { View, Text, Dimensions, TouchableOpacity, Animated, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { colors, spacing, radius } from '../src/lib/theme'
import { Trophy, Zap, Users, Share2 } from 'lucide-react-native'
const { width, height } = Dimensions.get('window')
const SLIDES = [
{ key: 'compete', icon: Trophy, iconColor: colors.amber, iconBg: `${colors.amber}20`, title: 'Compete on\nlive leaderboards', sub: 'Track scores, ranks and streaks in real time.', accent: colors.amber },
{ key: 'realtime', icon: Zap, iconColor: colors.indigoGlow, iconBg: `${colors.indigo}25`, title: 'Watch rankings\nchange live', sub: 'See rank changes as they happen in real time.', accent: colors.indigoGlow },
{ key: 'teams', icon: Users, iconColor: colors.teal, iconBg: `${colors.teal}20`, title: 'Build boards\nfor your team', sub: 'Create a custom leaderboard in seconds and invite anyone.', accent: colors.teal },
{ key: 'share', icon: Share2, iconColor: colors.green, iconBg: `${colors.green}20`, title: 'Share and\ngo viral', sub: 'One tap to share your board link.', accent: colors.green },
]
export const ONBOARDING_KEY = 'podium_onboarding_done'
export default function OnboardingScreen() {
  const [index, setIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const flatRef = useRef(null)
  const goNext = async () => {
    if (index < SLIDES.length - 1) { Haptics.selectionAsync(); flatRef.current?.scrollToIndex({ index: index+1, animated: true }) }
    else { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); await AsyncStorage.setItem(ONBOARDING_KEY, '1'); router.replace('/auth/login') }
  }
  const isLast = index === SLIDES.length - 1
  return (
    <SafeAreaView style={{flex:1,backgroundColor:colors.black}} edges={['top','bottom']}>
      {!isLast&&<TouchableOpacity style={{position:'absolute',top:52,right:20,zIndex:10,paddingHorizontal:14,paddingVertical:7,backgroundColor:colors.surface,borderRadius:999}} onPress={async()=>{await AsyncStorage.setItem(ONBOARDING_KEY,'1');router.replace('/auth/login')}}><Text style={{color:colors.sub,fontSize:13,fontWeight:'600'}}>Skip</Text></TouchableOpacity>}
      <Animated.FlatList ref={flatRef} data={SLIDES} keyExtractor={(s)=>s.key} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16} onScroll={Animated.event([{nativeEvent:{contentOffset:{x:scrollX}}}],{useNativeDriver:false})} onMomentumScrollEnd={(e)=>setIndex(Math.round(e.nativeEvent.contentOffset.x/width))} renderItem={({item})=><view style={{width,paddingHorizontal:24,paddingTop:height*0.08,alignItems:'center'}}><view style={{width:120,height:120,borderRadius:32,alignItems:'center',justifyContent:'center',backgroundColor:item.iconBg,borderWidth:1,borderColor:`${item.iconColor}30`,marginBottom:32}}><item.icon size={52} color={item.iconColor} strokeWidth={1.5}/></view><text style={{fontSize:32,fontWeight:'800',color:colors.text,textAlign:'center',lineHeight:40,letterSpacing:-0.8,marginBottom:16}}>{item.title}</text><text style={{fontSize:16,color:colors.sub,textAlign:'center',lineHeight:24}}>{item.sub}</text></view>}/>
      <View style={{paddingHorizontal:24,paddingBottom:Platform.OS==='ios'?16:24,alignItems:'center',gap:16}}>
        <View style={{flexDirection:"row",gap:6,alignItems:'center'}}>
          {SLIDES.map((_,i)=><view key={i} style={[{height:8,borderRadius:4},{width:i===index?24:8,backgroundColor:i===index?SLIDES[index].accent:colors.border,opacity:i===index?1:0.35}]} />)}
        </View>
        <TouchableOpacity onPress={goNext} style={{width:'100%',paddingVertical:17,borderRadius:14,alignItems:'center',backgroundColor:SLIDES[index].accent}} activeOpacity={0.85}>
          <Text style={{fontSize:17,fontWeight:'800',color:'#fff',letterSpacing:-0.3}}>{isLast?'Get started free':'Next'}</Text>
        </TouchableOpacity>
        {isLast&&<TouchableOpacity onPress={()=>router.replace('/auth/login')}><Text style={{fontSize:14,color:colors.dim}}>Already have an account? <Text style={{color:colors.indigoGlow}}>Sign in</Text></Text></TouchableOpacity>}
      </View>
    </SafeAreaView>
  )
}
