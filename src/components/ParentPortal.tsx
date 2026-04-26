import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ParentPortalProps {
  studentName: string
  subject: string
  rubricScore: 'EE' | 'ME' | 'AE' | 'BE'
  translatedNote: string
}

const scoreMap = {
  EE: { label: "Exceeding Expectations", color: "text-green-600 bg-green-50 border-green-200" },
  ME: { label: "Meeting Expectations", color: "text-blue-600 bg-blue-50 border-blue-200" },
  AE: { label: "Approaching Expectations", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  BE: { label: "Below Expectations", color: "text-red-600 bg-red-50 border-red-200" },
}

export function ParentPortal({ studentName, subject, rubricScore, translatedNote }: ParentPortalProps) {
  const scoreInfo = scoreMap[rubricScore]

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Parent Report Portal</h1>
        <p className="text-slate-500 italic">"Pamoja Tunajenga Baadaye"</p>
      </header>

      <Card className="overflow-hidden border-2">
        <div className={cn("h-2 w-full", scoreInfo.color.split(' ')[1])} />
        <CardHeader className="bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{studentName}</CardTitle>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{subject}</p>
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border",
              scoreInfo.color
            )}>
              {rubricScore}: {scoreInfo.label}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-slate max-w-none">
            {translatedNote.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="mb-4 text-slate-700 leading-relaxed">
                  {paragraph}
                </p>
              ) : null
            ))}
          </div>
        </CardContent>
        <div className="bg-slate-50 p-4 text-center border-t">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
            CBC Assessment Translation Hub • Powered by Gemini AI
          </p>
        </div>
      </Card>
    </div>
  )
}

// Example usage component for demo
export function ParentPortalDemo() {
  return (
    <ParentPortal 
      studentName="Kamau Njoroge"
      subject="Mathematics"
      rubricScore="AE"
      translatedNote={`Habari Mzazi wa Kamau,

Matokeo ya Kamau katika somo la Hisabati (Mathematics) ni 'Approaching Expectations' (AE). Hii inamaanisha kuwa Kamau anaanza kuelewa mada tunazosoma, ingawa bado anahitaji msaada kidogo ili kufikia malengo kamili ya darasa. Ni jambo la kutia moyo kuona juhudi zake darasani!

Tunasherehekea bidii yake, hasa jinsi anavyojaribu kutatua matatizo mapya kwa moyo mkuu. Kila hatua ndogo anayopiga ni muhimu sana katika safari yake ya masomo.

Ili kumsaidia Kamau nyumbani, unaweza kufanya shughuli hii rahisi: Unapokuwa jikoni au sokoni, mwombe akusaidie kupanga vitu kwa makundi (kwa mfano, nyanya tatu hapa na vitunguu vinne pale). Mwombe ahesabu jumla ya vitu hivyo. Shughuli hii ya vitendo itamsaidia kuelewa dhana za hesabu kwa urahisi zaidi bila gharama yoyote.`}
    />
  )
}
