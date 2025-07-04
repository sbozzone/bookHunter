"use client"

import { useTheme } from "@/components/theme-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()

  return (
    <Select value={colorTheme} onValueChange={(value) => setColorTheme(value as any)}>
      <SelectTrigger>
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Lavender</SelectItem>
        <SelectItem value="green">Forest</SelectItem>
        <SelectItem value="orange">Sunset</SelectItem>
      </SelectContent>
    </Select>
  )
}
