import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from "react";
import { Button, Platform, SafeAreaView } from "react-native";

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
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };
  
  if(Platform.OS === 'web') {
    return (
    <input
        type="date"
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          onChange(e, newDate)
        }}
      />
    )
  } else {
    return (
          <SafeAreaView>
            <Button onPress={showDatepicker} title="Show date picker!" />
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode='date'
                is24Hour={true}
                onChange={onChange}
              />
            )}
          </SafeAreaView>
        )
  }
  
};