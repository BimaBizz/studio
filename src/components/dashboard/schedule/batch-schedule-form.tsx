
"use client";

import { useState } from "react";
import type { Shift } from "@/lib/types";
import { SHIFT_TYPES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BatchScheduleFormProps {
  onApply: (pattern: Shift[]) => void;
  teamName: string;
}

export function BatchScheduleForm({ onApply, teamName }: BatchScheduleFormProps) {
  const [pattern, setPattern] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | "">("");

  const handleAddShift = () => {
    if (currentShift) {
      setPattern([...pattern, currentShift]);
      setCurrentShift("");
    }
  };

  const handleRemoveShift = (indexToRemove: number) => {
    setPattern(pattern.filter((_, index) => index !== indexToRemove));
  };
  
  const handleApplyPattern = () => {
    onApply(pattern);
  };
  
  const availableShifts = teamName === 'Management'
    ? ['Staff', 'L'] as const
    : SHIFT_TYPES.filter(s => s !== 'Staff');

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Batch Scheduling</CardTitle>
        <CardDescription>
          Create a repeating shift pattern and apply it to the entire team for the selected date range.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={currentShift} onValueChange={(value) => setCurrentShift(value as Shift)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Shift" />
            </SelectTrigger>
            <SelectContent>
              {availableShifts.map(shift => (
                <SelectItem key={shift} value={shift}>{shift}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAddShift} size="sm" variant="outline" disabled={!currentShift}>
            <Plus className="mr-2 h-4 w-4" />
            Add to Pattern
          </Button>
        </div>

        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Current Pattern:</h4>
            {pattern.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border p-2 min-h-[40px]">
                {pattern.map((shift, index) => (
                    <Badge key={index} variant="secondary" className="text-base">
                    {shift}
                    <button onClick={() => handleRemoveShift(index)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                    </Badge>
                ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">No pattern defined. Add shifts to create a pattern.</p>
            )}
        </div>

        <Button onClick={handleApplyPattern} disabled={pattern.length === 0}>
          Apply Pattern to Team
        </Button>
      </CardContent>
    </Card>
  );
}
