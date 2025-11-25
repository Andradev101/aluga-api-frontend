import { CalendarDaysIcon } from '@/components/ui/icon';
import { Input, InputField, InputIcon } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Platform } from "react-native";


interface DatePickerProps {
  date: Date; // controlled date value from parent
  onDateChange: (date: Date) => void; // callback to notify parent
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(false);
    console.log("AAAA")
    if (selectedDate) {
      console.log("selectedDate", selectedDate)
      onDateChange(selectedDate); // notify parent about new date
    }
  };

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    console.log("im in")
    showMode('date');
  };

  if(Platform.OS === 'web') {
  return (
      <Pressable>
  <div className="relative w-full flex items-center">
    <input
      type="date"
      value={date.toISOString().split('T')[0]}
      onChange={e => {
        const newDate = new Date(e.target.value + "T00:00:00");
        onDateChange(newDate);
      }}
      className="
        w-full
        px-2 py-2
        text-base
        border border-slate-300
        rounded-lg
        focus:border-indigo-500
        focus:ring-2 focus:ring-indigo-300
        bg-white
        appearance-none
      "
    />
  </div>
</Pressable>
    )
  } else {
    return (
      <>
        {/* <Button onPress={showDatepicker} title="Pick a date" /> */}
        {show && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode='date'
            is24Hour={true}
            onChange={onChange}
          />
        )}
        <Pressable onPress={showDatepicker}>
          <Input
            pointerEvents="none"
            variant="outline"
            size="md"
            isDisabled={false}
            isReadOnly={true}
          >
            <InputField value={date.toLocaleDateString()} />
            <InputIcon as={CalendarDaysIcon} className='m-2' />
          </Input>
        </Pressable>
      </>
    )
  }

};