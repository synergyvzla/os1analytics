import { DashboardSidebar } from "@/components/DashboardSidebar"

export default function GHL() {
  return (
    <DashboardSidebar>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">GHL</h1>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <p className="text-muted-foreground">
              Esta página está en desarrollo.
            </p>
          </div>
        </div>
      </div>
    </DashboardSidebar>
  )
}