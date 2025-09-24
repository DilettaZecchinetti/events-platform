import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import "../../css/DatePickerOverride.css"

const DateRangePicker = ({ startDate, endDate, setStartDate, setEndDate }) => {
    const [range, setRange] = useState([
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null,
    ]);
    const [start, end] = range;

    return (
        <div className="d-flex gap-2">
            <DatePicker
                selectsRange
                startDate={start}
                endDate={end}
                onChange={(dates) => {
                    const [start, end] = dates;
                    setRange([start, end]);
                    setStartDate(start ? format(start, "yyyy-MM-dd") : "");
                    setEndDate(end ? format(end, "yyyy-MM-dd") : "");
                }}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select date"
                monthsShown={2}
                className="form-control rounded-4 shadow-sm border-0 py-2 px-3"
            />
        </div>
    );
};

export default DateRangePicker;

