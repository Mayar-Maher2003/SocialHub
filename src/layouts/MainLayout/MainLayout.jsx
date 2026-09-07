import React from 'react'
import Nav from '../../components/layout/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import MobileBottomNav from './MobileBottomNav'

export default function MainLayout() {
  return (
    <div className="bg-page min-h-screen">
      <Nav />
      <div className="max-w-[1280px] mx-auto flex justify-center gap-6 px-0 lg:px-6 pb-16 lg:pb-0">
        <LeftSidebar />
        <main className="w-full min-w-0 max-w-[640px]">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <MobileBottomNav />
    </div>
  )
}
