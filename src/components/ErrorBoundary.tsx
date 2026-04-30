import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { colors, spacing, radius } from '@/src/lib/theme'
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react-native'
export function ErrorState({ title, message, onRetry, type = 'generic', compact = false }: any) {
  const icon = type === 'network' ? <WifiOff size={compact?22:32} color={colors.dim}/> : <AlertTriangle size={compact?22:32} color={colors.amber}/>
  const dTitle = type === 'network' ? 'No connection' : 'Something went wrong'
  const dMsg = type === 'network' ? 'Check your connection and try again.' : 'We couldn\u2019t load this. Try again.'
  return <View style={{paddingVertical:compact?20:40,paddingHorizontal:24,alignItems:'center',gap:12}}>{icon}<Text style={{fontSize:compact?14:16,fontWeight:'600',color:colors.text,textAlign:'center'}}>{title??tTitle}</Text><Text style={{fontSize:14,color:colors.sub,textAlign:'center',lineHeight:20}}>{msg??dMsg}</Text>{onRetry&&<TouchableOpacity onPress={onRetry} style={{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:colors.indigo,paddingHorizontal:16,paddingVertical:10,borderRadius:10}}><RefreshCw size={14} color="#fff"/><Text style={{color:'#fff',fontSize:14,fontWeight: '600'}}>Try again</Text></TouchableOpacity>}</View>
}
export class ErrorBoundary extends React.Component<any,any> {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  reset = () => this.setState({ hasError: false, error: null })
  render() {
    if (this.state.hasError) return <ErrorState title="Screen crashed" onRetry={this.reset}/>
    return this.props.children
  }
}
