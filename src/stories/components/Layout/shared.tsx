import { Link } from 'react-router-dom'
import type { FooterProps } from '@webui/components/components/Layout/Footer'
import type { HeaderProps } from '@webui/components/components/Layout/Header'
import type { SideMenuProps } from '@webui/components/components/Layout/SideMenu'

export const sampleSideMenu: SideMenuProps = {
  headerChildren: <span className="font-semibold">MaksIT WebUI</span>,
  children: (
    <nav className="flex flex-col gap-3 text-sm">
      <Link className="hover:underline" to="/vault">Vault</Link>
      <Link className="hover:underline" to="/certs">Certificates</Link>
      <Link className="hover:underline" to="/admin">Administration</Link>
      <Link className="hover:underline" to="/reports">Reports</Link>
    </nav>
  ),
  footerChildren: <span className="text-xs opacity-90">Build 0.3.0</span>,
}

export const minimalSideMenu: SideMenuProps = {
  headerChildren: <span className="font-semibold">App</span>,
  children: (
    <nav className="flex flex-col gap-2 text-sm">
      <Link className="hover:underline" to="/">Home</Link>
      <Link className="hover:underline" to="/settings">Settings</Link>
    </nav>
  ),
}

export const sampleHeader: HeaderProps = {
  children: (
    <>
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <span className="text-sm opacity-90">Signed in as demo@example.com</span>
    </>
  ),
}

export const sampleFooter: FooterProps = {
  children: <span>© 2026 MaksIT — Shared WebUI layout</span>,
}

export const sampleMainContent = (
  <div className="p-6 space-y-4">
    <h2 className="text-xl font-semibold text-gray-800">Main content area</h2>
    <p className="text-gray-600 max-w-prose">
      This region maps to <code className="bg-gray-200 px-1 rounded">Layout</code> children —
      forms, tables, and page content render here inside the scrollable main panel.
    </p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200">Card A</div>
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200">Card B</div>
    </div>
  </div>
)
