"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

// Mock data for initial UI
const students = [
  { id: 1, name: "Kamau Njoroge" },
  { id: 2, name: "Achieng Otieno" },
  { id: 3, name: "Musa Hassan" },
]

const subjects = [
  "English", "Kiswahili", "Mathematics", "Religious Education", 
  "Social Studies", "Integrated Science", "Pre-Technical Studies", 
  "Agriculture", "Creative Arts and Sports"
]

const rubricLevels = [
  { value: "EE", label: "Exceeding Expectations (EE)" },
  { value: "ME", label: "Meeting Expectations (ME)" },
  { value: "AE", label: "Approaching Expectations (AE)" },
  { value: "BE", label: "Below Expectations (BE)" },
]

export function TeacherDashboard() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setStatus(null)

    const formData = new FormData(event.currentTarget)
    const payload = {
      studentId: formData.get('studentId'),
      subject: formData.get('subject'),
      rubricScore: formData.get('rubricScore'),
      teacherNotes: formData.get('teacherNotes'),
    }

    try {
      const response = await fetch('/api/translate-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to save assessment')

      setStatus({ type: 'success', message: 'Assessment logged and translated successfully!' })
      event.currentTarget.reset()
    } catch (error) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Log CBC Assessment</CardTitle>
        <CardDescription>
          Quickly record student progress and generate parent-friendly translations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentId">Select Student</Label>
            <Select name="studentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select name="subject" required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rubric Score</Label>
            <RadioGroup name="rubricScore" defaultValue="ME" className="flex flex-col space-y-1">
              {rubricLevels.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={level.value} id={level.value} />
                  <Label htmlFor={level.value} className="font-normal">
                    {level.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherNotes">Teacher's Observation</Label>
            <Textarea 
              name="teacherNotes" 
              placeholder="e.g., Struggles with fractions, easily distracted but shows effort in group work."
              className="min-h-[100px]"
              required
            />
          </div>

          {status && (
            <div className={`p-3 rounded-md text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {status.message}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing with Gemini...
              </>
            ) : (
              'Submit Assessment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
