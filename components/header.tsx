import { ModeToggle } from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="container mx-auto py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Access Request Management</h1>
      <div className="flex items-center space-x-4">
        <ModeToggle />
      </div>
    </header>
  )
}

