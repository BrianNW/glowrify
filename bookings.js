const serviceSelect = document.querySelector("#preview-service");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarMonth = document.querySelector("#calendar-month");
const calendarHint = document.querySelector("#calendar-hint");
const timesHint = document.querySelector("#times-hint");
const timeList = document.querySelector("#time-list");
const previousMonth = document.querySelector("#previous-month");
const nextMonth = document.querySelector("#next-month");
const bookingForm = document.querySelector("#booking-preview-form");
const bookingResult = document.querySelector("#booking-result");

if (serviceSelect && calendarGrid && calendarMonth && timeList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastBookableDay = new Date(today);
  lastBookableDay.setDate(lastBookableDay.getDate() + 90);
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedTime = "";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function getSampleTimes(date) {
    const weekday = date.getDay();
    if (weekday === 0 || weekday === 6) return [];
    const opensAt = weekday === 1 || weekday === 4 ? 10 : 19;
    const closesAt = weekday === 1 || weekday === 4 ? 21 : 21;
    const visitMinutes = Number(serviceSelect.value) + 35;
    const times = [];

    for (let minutes = opensAt * 60; minutes + visitMinutes <= closesAt * 60; minutes += 60) {
      times.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
    }
    return times;
  }

  function formatTime(time) {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"} PT`;
  }

  function renderTimes() {
    timeList.replaceChildren();
    selectedTime = "";

    if (!serviceSelect.value || !selectedDate) {
      timesHint.textContent = "Choose a session and date to see sample times.";
      return;
    }

    const times = getSampleTimes(selectedDate);
    if (!times.length) {
      timesHint.textContent = "No sample times are shown for this date. Try a weekday.";
      return;
    }

    timesHint.textContent = "Sample appointment times for the selected date.";
    for (const time of times) {
      const button = document.createElement("button");
      button.className = "booking-preview__time";
      button.type = "button";
      button.textContent = formatTime(time);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        selectedTime = time;
        timeList.querySelectorAll("button").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        bookingResult.textContent = "";
      });
      timeList.append(button);
    }
  }

  function renderCalendar() {
    calendarMonth.textContent = visibleMonth.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
    calendarGrid.replaceChildren();

    for (const weekday of weekdays) {
      const heading = document.createElement("span");
      heading.className = "booking-preview__weekday";
      heading.setAttribute("role", "columnheader");
      heading.textContent = weekday;
      calendarGrid.append(heading);
    }

    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
    const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
    const cellCount = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;

    for (let index = 0; index < cellCount; index += 1) {
      const dayNumber = index - mondayFirstOffset + 1;
      const cell = document.createElement("span");
      cell.className = "booking-preview__day-cell";
      cell.setAttribute("role", "gridcell");

      if (dayNumber < 1 || dayNumber > daysInMonth) {
        calendarGrid.append(cell);
        continue;
      }

      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), dayNumber);
      const dateString = dateKey(date);
      const sampleTimes = getSampleTimes(date);
      const isAvailable = serviceSelect.value !== "" && date >= today && date <= lastBookableDay && sampleTimes.length > 0;
      const button = document.createElement("button");
      button.className = "booking-preview__day";
      button.type = "button";
      button.textContent = String(dayNumber);
      button.setAttribute("aria-label", `${date.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}. ${isAvailable ? `${sampleTimes.length} sample times` : "No sample times"}`);
      button.setAttribute("aria-pressed", String(selectedDate && dateKey(selectedDate) === dateString));
      button.disabled = !isAvailable;

      if (dateString === dateKey(today)) button.classList.add("is-today");
      if (selectedDate && dateKey(selectedDate) === dateString) button.classList.add("is-selected");
      if (isAvailable) button.classList.add("is-available");

      button.addEventListener("click", () => {
        selectedDate = date;
        bookingResult.textContent = "";
        renderCalendar();
        renderTimes();
      });
      cell.append(button);
      calendarGrid.append(cell);
    }

    calendarHint.textContent = serviceSelect.value
      ? "Pink dots show sample dates with times in this design preview."
      : "Choose a whitening session to see sample dates.";
    previousMonth.disabled = visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth();
    nextMonth.disabled = visibleMonth.getFullYear() === lastBookableDay.getFullYear() && visibleMonth.getMonth() === lastBookableDay.getMonth();
  }

  previousMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    selectedDate = null;
    renderCalendar();
    renderTimes();
  });

  nextMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    selectedDate = null;
    renderCalendar();
    renderTimes();
  });

  serviceSelect.addEventListener("change", () => {
    selectedDate = null;
    renderCalendar();
    renderTimes();
  });

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    if (!selectedDate || !selectedTime) {
      bookingResult.textContent = "Choose a sample appointment date and time to continue.";
      return;
    }
    bookingResult.textContent = `Preview only: ${selectedDate.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${formatTime(selectedTime)}. No booking was sent or saved.`;
  });

  renderCalendar();
}
