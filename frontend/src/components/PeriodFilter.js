import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useBudget } from '../contexts/BudgetContext';
import { MONTHS } from '../data/mockData';
import { Calendar, ChevronDown } from 'lucide-react';

const PeriodFilter = () => {
  const {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear
  } = useBudget();

  const [filterType, setFilterType] = useState('month');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);

  const currentDate = new Date();
  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i);
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  const handleFilterChange = (type, value) => {
    setFilterType(type);
    switch (type) {
      case 'year':
        if (value !== currentYear) {
          setCurrentYear(value);
          setCurrentMonth(0);
        }
        break;
      case 'month':
        if (value !== currentMonth) {
          setCurrentMonth(value);
        }
        break;
      case 'week':
        setSelectedWeek(value);
        const firstDayOfYear = new Date(currentYear, 0, 1);
        const startOfWeek = new Date(firstDayOfYear.getTime() + (value - 1) * 7 * 24 * 60 * 60 * 1000);
        setCurrentMonth(startOfWeek.getMonth());
        break;
      case 'day':
        setSelectedDay(value);
        const dayDate = new Date(value);
        setCurrentMonth(dayDate.getMonth());
        setCurrentYear(dayDate.getFullYear());
        break;
      default:
        break;
    }
    setShowDropdown(false);
  };

  const getCurrentPeriodLabel = () => {
    switch (filterType) {
      case 'year':
        return `${currentYear}`;
      case 'month':
        return `${MONTHS[currentMonth]} ${currentYear}`;
      case 'week':
        return `Week ${selectedWeek}, ${currentYear}`;
      case 'day':
        return new Date(selectedDay).toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      default:
        return `${MONTHS[currentMonth]} ${currentYear}`;
    }
  };

  // ✅ Positionnement dynamique du dropdown (à droite du bouton)
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // ~w-80
      const viewportWidth = window.innerWidth;

      const left = Math.min(rect.right - dropdownWidth, viewportWidth - dropdownWidth - 16);
      const top = rect.bottom + 8 + window.scrollY;

      setDropdownStyle({
        top: `${top}px`,
        left: `${left}px`
      });
    }
  }, [showDropdown]);

  return (
    <>
      {/* Bouton principal */}
      <div className="relative z-10 isolate">
        <button
          ref={buttonRef}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm hover:bg-white/80 transition-all duration-200"
        >
          <Calendar className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {getCurrentPeriodLabel()}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* ✅ Dropdown rendu dans Portal */}
      {showDropdown &&
        ReactDOM.createPortal(
          <div
            className="fixed z-[9999] w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 max-h-[calc(100vh-100px)] overflow-auto"
            style={{ ...dropdownStyle, position: 'absolute' }}
          >
            {/* Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {['year', 'month', 'week', 'day'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    filterType === type
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Year */}
            {filterType === 'year' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Month */}
            {filterType === 'month' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Month</label>
                  <select
                    value={currentMonth}
                    onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Week */}
            {filterType === 'week' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Select Week</label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => handleFilterChange('week', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    {weeks.map((week) => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Day */}
            {filterType === 'day' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Date</label>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => handleFilterChange('day', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <button
              onClick={() => {
                if (filterType === 'day') {
                  const date = new Date(selectedDay);
                  setCurrentYear(date.getFullYear());
                  setCurrentMonth(date.getMonth());
                } else if (filterType === 'week') {
                  const firstDayOfYear = new Date(currentYear, 0, 1);
                  const startOfWeek = new Date(firstDayOfYear.getTime() + (selectedWeek - 1) * 7 * 24 * 60 * 60 * 1000);
                  setCurrentMonth(startOfWeek.getMonth());
                }

                // Call loadData if available
                if (typeof loadData === 'function') {
                  loadData();
                }

                setShowDropdown(false);
              }}
              className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Apply Filter
            </button>

          </div>,
          document.body
        )}
    </>
  );
};

export default PeriodFilter;
