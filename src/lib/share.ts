import { Share, Platform } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
const APP_URL = 'https://podium-web-two.vercel.app'
export async function shareBoard(board: any) {
  const url = board.inviteCode ? `${APP_URL}/join/${board.inviteCode}` : `${APP_URL}/board/${board.id}`
  const msg = board.inviteCode ? `Join me on "${board.name}" - a live leaderboard on Podium! Use code ${board.inviteCode} or tap: ${url}` : `Check out "${board.name}" on Podium: ${url}`
  try { await Share.share(Platform.OS === 'ios' ? { url, message: msg } : { message: msg }) } catch {}
}
export async function copyInviteCode(code: string) {
  await Clipboard.setStringAsync(code)
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
