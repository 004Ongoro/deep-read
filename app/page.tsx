import { TeacherDashboard } from "@/components/TeacherDashboard"
import { ParentPortalDemo } from "@/components/ParentPortal"

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 space-y-24">
      <section>
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Teacher View</h2>
          <p className="text-slate-600 text-sm">Use this form to log assessments and generate AI translations.</p>
        </div>
        <TeacherDashboard />
      </section>

      <hr className="max-w-4xl mx-auto border-slate-200" />

      <section>
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Parent View (Preview)</h2>
          <p className="text-slate-600 text-sm">How the translated report appears to the parent.</p>
        </div>
        <ParentPortalDemo />
      </section>
    </main>
  )
}
