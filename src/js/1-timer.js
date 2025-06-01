import flatpickr from 'flatpickr';
import { English } from 'flatpickr/dist/l10n/default.js';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const customLocale = {
  ...English,
  firstDayOfWeek: 1,
  weekdays: {
    shorthand: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    longhand: [
      'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday', 'Sunday',
    ],
  },
};

flatpickr.localize(customLocale);

const input = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysEl = document.querySelector('[data-days]');
const hoursEl = document.querySelector('[data-hours]');
const minutesEl = document.querySelector('[data-minutes]');
const secondsEl = document.querySelector('[data-seconds]');

let selectedDate = null;
let timerId = null;

startBtn.disabled = true;

flatpickr(input, {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onChange(selectedDates) {
    const date = selectedDates[0];
    if (date <= new Date()) {
      iziToast.warning({
        title: 'Warning',
        message: 'Please choose a date in the future',
      });
      startBtn.disabled = true;
    } else {
      selectedDate = date;
      startBtn.disabled = false;
    }
  },
  
  onReady(_, __, fp) {
    const container = fp.calendarContainer.querySelector('.flatpickr-weekdaycontainer');
    const days = Array.from(container.children);
    if (days.length === 7 && days[0].innerText === 'Su') {
      const reordered = [...days.slice(1), days[0]];
      container.innerHTML = '';
      reordered.forEach(day => container.appendChild(day));
    }
  },
});

setTimeout(() => {
  const select = document.querySelector('.flatpickr-monthDropdown-months');
  if (select && !select.parentElement.classList.contains('flatpickr-monthDropdown-months-wrapper')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flatpickr-monthDropdown-months-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
  }
}, 0);

startBtn.addEventListener('click', () => {
  if (!selectedDate) return;

  startBtn.disabled = true;
  input.disabled = true;

  timerId = setInterval(() => {
    const now = new Date();
    const timeLeft = selectedDate - now;

    if (timeLeft <= 0) {
      clearInterval(timerId);
      updateTimerDisplay(0);
      input.disabled = false;

      iziToast.success({
        title: 'Done',
        message: 'Countdown finished!',
        position: 'topRight',
      });

      return;
    }

    updateTimerDisplay(timeLeft);
  }, 1000);
});

function updateTimerDisplay(ms) {
  const { days, hours, minutes, seconds } = convertMs(ms);
  daysEl.textContent = addLeadingZero(days);
  hoursEl.textContent = addLeadingZero(hours);
  minutesEl.textContent = addLeadingZero(minutes);
  secondsEl.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

