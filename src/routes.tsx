import { lazy } from 'react'

export const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
export const DigimonDetailPage = lazy(() => import('./pages/DigimonDetailPage').then((module) => ({ default: module.DigimonDetailPage })))
export const RequestBoardPage = lazy(() => import('./pages/RequestBoardPage').then((module) => ({ default: module.RequestBoardPage })))
export const QuestBoardPage = lazy(() => import('./pages/QuestBoardPage').then((module) => ({ default: module.QuestBoardPage })))
export const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage })))
export const AdminRequestBoardPage = lazy(() => import('./pages/AdminRequestBoardPage').then((module) => ({ default: module.AdminRequestBoardPage })))
export const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((module) => ({ default: module.PrivacyPolicyPage })))
