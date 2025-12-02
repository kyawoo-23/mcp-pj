/**
 * Helper functions for booking forms (create and edit)
 */

export interface TimeOption {
  value: string;
  label: string;
}

/**
 * Generate time options from 8am to 9pm with 1-hour gaps
 */
export function generateTimeOptions(): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = 8; hour <= 21; hour++) {
    const timeValue = `${hour.toString().padStart(2, "0")}:00`;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    const label = `${displayHour}:00 ${ampm}`;
    options.push({ value: timeValue, label });
  }
  return options;
}

/**
 * Get available end time options based on selected start time
 */
export function getAvailableEndTimes(
  timeOptions: TimeOption[],
  startTime: string | undefined
): TimeOption[] {
  if (!startTime) {
    return timeOptions;
  }
  // Filter to only show times after the start time
  const startIndex = timeOptions.findIndex((opt) => opt.value === startTime);
  if (startIndex === -1) {
    return timeOptions;
  }
  return timeOptions.slice(startIndex + 1);
}

/**
 * Create a handler for start time changes
 */
export function createStartTimeHandler(
  setValue: (name: "start_time" | "end_time", value: string) => void,
  setError: (error: string | null) => void,
  endTime: string | undefined
) {
  return (value: string) => {
    setValue("start_time", value);
    setError(null);
    // Clear end time if it's now invalid (earlier than or equal to start time)
    if (endTime && endTime <= value) {
      setValue("end_time", "");
    }
  };
}

/**
 * Create a handler for end time changes
 */
export function createEndTimeHandler(
  setValue: (name: "start_time" | "end_time", value: string) => void,
  setError: (error: string | null) => void,
  startTime: string | undefined
) {
  return (value: string) => {
    // Validate that end time is after start time
    if (startTime && value <= startTime) {
      setError("End time must be after start time");
      return;
    }
    setError(null);
    setValue("end_time", value);
  };
}

