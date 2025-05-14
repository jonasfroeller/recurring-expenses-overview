"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Plus, Trash2, Clipboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { PasteDialog } from "./paste-dialog"

interface ExpenseItem {
  id: string
  description: string
  amount: number
}

export function Calculator() {
  const { toast } = useToast()
  const [yearlyExpenses, setYearlyExpenses] = useState<ExpenseItem[]>([
    { id: "1", description: "Miete Büro", amount: 0 },
  ])
  const [monthlyExpenses, setMonthlyExpenses] = useState<ExpenseItem[]>([
    { id: "1", description: "Miete Büro", amount: 0 },
  ])
  const [revenue, setRevenue] = useState<number>(0)
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const importDataFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        importData(jsonData)
      } catch (error) {
        toast({
          title: "Fehler beim Importieren",
          description: "Die Datei enthält kein gültiges JSON-Format.",
          variant: "destructive",
        })
        console.error("Fehler beim Importieren:", error)
      }
    }

    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle pasted JSON from dialog
  const handlePastedJson = (jsonText: string) => {
    try {
      const jsonData = JSON.parse(jsonText)
      importData(jsonData)
    } catch (error) {
      toast({
        title: "Fehler beim Importieren",
        description: "Der eingefügte Text enthält kein gültiges JSON-Format.",
        variant: "destructive",
      })
      console.error("Fehler beim Importieren aus der Zwischenablage:", error)
    }
  }

  // Common function to handle importing data
  const importData = (jsonData: any) => {
    let importSuccessful = false

    // Validate the data structure
    if (jsonData.yearlyExpenses && Array.isArray(jsonData.yearlyExpenses)) {
      setYearlyExpenses(jsonData.yearlyExpenses)
      importSuccessful = true
    }

    if (jsonData.monthlyExpenses && Array.isArray(jsonData.monthlyExpenses)) {
      setMonthlyExpenses(jsonData.monthlyExpenses)
      importSuccessful = true
    }

    if (typeof jsonData.revenue === "number") {
      setRevenue(jsonData.revenue)
      importSuccessful = true
    }

    if (importSuccessful) {
      toast({
        title: "Daten importiert",
        description: "Die Daten wurden erfolgreich importiert.",
      })
    } else {
      toast({
        title: "Fehler beim Importieren",
        description: "Die Daten haben kein gültiges Format.",
        variant: "destructive",
      })
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const addYearlyExpense = () => {
    const newId = String(yearlyExpenses.length + 1)
    setYearlyExpenses([...yearlyExpenses, { id: newId, description: "", amount: 0 }])
  }

  const addMonthlyExpense = () => {
    const newId = String(monthlyExpenses.length + 1)
    setMonthlyExpenses([...monthlyExpenses, { id: newId, description: "", amount: 0 }])
  }

  const updateYearlyExpense = (id: string, field: keyof ExpenseItem, value: string | number) => {
    setYearlyExpenses(
      yearlyExpenses.map((expense) => {
        if (expense.id === id) {
          return { ...expense, [field]: value }
        }
        return expense
      }),
    )
  }

  const updateMonthlyExpense = (id: string, field: keyof ExpenseItem, value: string | number) => {
    setMonthlyExpenses(
      monthlyExpenses.map((expense) => {
        if (expense.id === id) {
          return { ...expense, [field]: value }
        }
        return expense
      }),
    )
  }

  const removeYearlyExpense = (id: string) => {
    setYearlyExpenses(yearlyExpenses.filter((expense) => expense.id !== id))
  }

  const removeMonthlyExpense = (id: string) => {
    setMonthlyExpenses(monthlyExpenses.filter((expense) => expense.id !== id))
  }

  const totalYearlyExpenses = yearlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

  const totalMonthlyExpensesAnnual = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0) * 12, 0)

  const totalExpenses = totalYearlyExpenses + totalMonthlyExpensesAnnual

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
  }

  const copyDataAsJson = () => {
    const data = {
      yearlyExpenses,
      monthlyExpenses,
      totalYearlyExpenses,
      totalMonthlyExpensesAnnual,
      totalExpenses,
      revenue,
      difference: revenue - totalExpenses,
    }

    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => {
        toast({
          title: "Daten kopiert",
          description: "Alle Daten wurden als JSON in die Zwischenablage kopiert.",
        })
      })
      .catch((err) => {
        toast({
          title: "Fehler beim Kopieren",
          description: "Die Daten konnten nicht kopiert werden.",
          variant: "destructive",
        })
        console.error("Fehler beim Kopieren:", err)
      })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="yearly">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="yearly">Jährliche Ausgaben</TabsTrigger>
                <TabsTrigger value="monthly">Monatliche Ausgaben</TabsTrigger>
              </TabsList>

              <TabsContent value="yearly" className="space-y-4">
                {yearlyExpenses.map((expense) => (
                  <div key={expense.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                    <div>
                      <Label htmlFor={`yearly-desc-${expense.id}`}>Beschreibung</Label>
                      <Input
                        id={`yearly-desc-${expense.id}`}
                        value={expense.description}
                        onChange={(e) => updateYearlyExpense(expense.id, "description", e.target.value)}
                        placeholder="z.B. Miete Büro"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`yearly-amount-${expense.id}`}>Betrag (€/Jahr)</Label>
                      <Input
                        id={`yearly-amount-${expense.id}`}
                        type="number"
                        value={expense.amount || ""}
                        onChange={(e) =>
                          updateYearlyExpense(expense.id, "amount", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeYearlyExpense(expense.id)}
                      disabled={yearlyExpenses.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button onClick={addYearlyExpense} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Ausgabe hinzufügen
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Gesamt jährliche Ausgaben:</span>
                    <span>{formatCurrency(totalYearlyExpenses)}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                {monthlyExpenses.map((expense) => (
                  <div key={expense.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-end">
                    <div>
                      <Label htmlFor={`monthly-desc-${expense.id}`}>Beschreibung</Label>
                      <Input
                        id={`monthly-desc-${expense.id}`}
                        value={expense.description}
                        onChange={(e) => updateMonthlyExpense(expense.id, "description", e.target.value)}
                        placeholder="z.B. Miete Büro"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`monthly-amount-${expense.id}`}>Betrag (€/Monat)</Label>
                      <Input
                        id={`monthly-amount-${expense.id}`}
                        type="number"
                        value={expense.amount || ""}
                        onChange={(e) =>
                          updateMonthlyExpense(expense.id, "amount", Number.parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMonthlyExpense(expense.id)}
                      disabled={monthlyExpenses.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button onClick={addMonthlyExpense} variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Ausgabe hinzufügen
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Monatliche Ausgaben:</span>
                    <span>
                      {formatCurrency(monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium mt-2">
                    <span>Auf Jahr umgerechnet:</span>
                    <span>{formatCurrency(totalMonthlyExpensesAnnual)}</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geschätzter Jahresumsatz</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="revenue">Jahresumsatz (€)</Label>
            <Input
              id="revenue"
              type="number"
              value={revenue || ""}
              onChange={(e) => setRevenue(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="mb-4"
            />
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Gesamte jährliche Ausgaben:</span>
                <span className="font-medium">{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span>Geschätzter Jahresumsatz:</span>
                <span className="font-medium">{formatCurrency(revenue)}</span>
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between font-bold">
                  <span>Differenz:</span>
                  <span className={revenue - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatCurrency(revenue - totalExpenses)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4">
                <Button onClick={copyDataAsJson} variant="outline">
                  Als JSON kopieren
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={triggerFileInput} variant="outline">
                    JSON aus Datei
                  </Button>
                  <Button onClick={() => setPasteDialogOpen(true)} variant="outline">
                    <Clipboard className="mr-2 h-4 w-4" />
                    Aus Zwischenablage
                  </Button>
                </div>

                <input type="file" ref={fileInputRef} onChange={importDataFromJson} accept=".json" className="hidden" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PasteDialog open={pasteDialogOpen} onOpenChange={setPasteDialogOpen} onImport={handlePastedJson} />
    </div>
  )
}
