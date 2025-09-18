"use client"

import { HelpCircle, FileText, AlertTriangle, CheckSquare, XCircle, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Question {
  id: number
  text: string
  icon: any
  category: string
}

interface SuggestedQuestionsProps {
  questions?: Question[]
  onQuestionClick: (question: string) => void
  isVisible?: boolean
}

export function SuggestedQuestions({ 
  questions = [], 
  onQuestionClick, 
  isVisible = true 
}: SuggestedQuestionsProps) {
  const defaultQuestions: Question[] = [
    {
      id: 1,
      text: "What are the key terms and conditions?",
      icon: FileText,
      category: "General"
    },
    {
      id: 2,
      text: "Are there any potential risks I should be aware of?",
      icon: AlertTriangle,
      category: "Risk Analysis"
    },
    {
      id: 3,
      text: "What are my obligations under this contract?",
      icon: CheckSquare,
      category: "Obligations"
    },
    {
      id: 4,
      text: "What happens if I want to terminate early?",
      icon: XCircle,
      category: "Termination"
    },
    {
      id: 5,
      text: "Are there any hidden fees or costs?",
      icon: DollarSign,
      category: "Financial"
    },
    {
      id: 6,
      text: "What are the payment terms and deadlines?",
      icon: Calendar,
      category: "Payment"
    }
  ]

  const questionsToShow = questions.length > 0 ? questions : defaultQuestions

  if (!isVisible) return null

  return (
    <div className="liquid-glass border-b border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-white">Suggested Questions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questionsToShow.slice(0, 6).map((question) => {
          const IconComponent = question.icon
          return (
            <Button
              key={question.id}
              variant="outline"
              size="sm"
              onClick={() => onQuestionClick(question.text)}
              className="justify-start text-left h-auto py-3 px-3 bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              <div className="flex items-start space-x-2 w-full">
                <IconComponent className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {question.text}
                  </p>
                  {question.category && (
                    <p className="text-xs text-gray-400 mt-1">
                      {question.category}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}